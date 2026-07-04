import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { STATUS_COLORS, STATUS_TRANSITIONS } from '@/lib/constants';

// Përshkrimi i çdo statusi
const STATUS_DESCRIPTIONS = {
  'Planifikuar':          'Faza e planifikimit: evente, ndërrime dhe organe.',
  'Regjistrimi i hapur':  'Garuesit mund të regjistrohen dhe caktohen në evente/ndërrime.',
  'Në zhvillim':          'Gara është duke u zhvilluar. Rezultatet mund të regjistrohen.',
  'Përfunduar':           'Gara ka përfunduar. Rezultatet janë finalizuar.',
  'Anuluar':              'Gara është anuluar.',
};

// Kushtet që duhet plotësohen për çdo kalim
const TRANSITION_LABELS = {
  'Regjistrimi i hapur':  'Hap Regjistrimin',
  'Në zhvillim':          'Fillo Garën',
  'Përfunduar':           'Finalizo Garën',
  'Anuluar':              'Anulo Garën',
};

export default function CompetitionStatusManager({
  competition,
  events,
  relays,
  officials,
  registrations,
  results,
}) {
  const queryClient = useQueryClient();
  const [targetStatus, setTargetStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentStatus = competition?.status || 'Planifikuar';
  const nextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  // Vlerëso kushtet për secilin kalim
  const getBlockers = (toStatus) => {
    const issues = [];
    if (toStatus === 'Regjistrimi i hapur') {
      if (events.length === 0) issues.push('Duhet të ketë të paktën 1 event.');
      if (relays.length === 0) issues.push('Duhet të ketë të paktën 1 ndërrim.');
      const missingRoles = ['Kryesuesi i garës', 'Referi kryesor'].filter(
        r => !officials.find(o => o.role === r)
      );
      if (missingRoles.length > 0) issues.push(`Mungojnë organet: ${missingRoles.join(', ')}.`);
    }
    if (toStatus === 'Në zhvillim') {
      if (registrations.length === 0) issues.push('Duhet të ketë të paktën 1 garues të regjistruar.');
      const withoutRelay = registrations.filter(r => !r.relay_number);
      if (withoutRelay.length > 0) issues.push(`${withoutRelay.length} garues nuk kanë ndërrim/pozicion të caktuar.`);
    }
    if (toStatus === 'Përfunduar') {
      const allResults = results.length > 0;
      if (!allResults) issues.push('Nuk ka rezultate të regjistruara.');
      const nonFinal = results.filter(r => r.status !== 'Final');
      if (nonFinal.length > 0) issues.push(`${nonFinal.length} rezultate nuk janë finalizuar ende.`);
    }
    return issues;
  };

  const handleTransition = async () => {
    if (!targetStatus) return;
    setSaving(true);
    await base44.entities.Competition.update(competition.id, { status: targetStatus });
    queryClient.invalidateQueries({ queryKey: ['competition', competition.id] });
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
    setSaving(false);
    setTargetStatus(null);
  };

  if (nextStatuses.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {nextStatuses.map(next => {
          const blockers = getBlockers(next);
          const isCancel = next === 'Anuluar';
          return (
            <Button
              key={next}
              size="sm"
              variant={isCancel ? 'outline' : 'default'}
              className={isCancel ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
              onClick={() => setTargetStatus(next)}
            >
              {isCancel ? <XCircle className="h-4 w-4 mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
              {TRANSITION_LABELS[next] || next}
              {blockers.length > 0 && <AlertTriangle className="h-3.5 w-3.5 ml-1 text-yellow-500" />}
            </Button>
          );
        })}
      </div>

      <AlertDialog open={!!targetStatus} onOpenChange={v => !v && setTargetStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {targetStatus === 'Anuluar'
                ? <XCircle className="h-5 w-5 text-destructive" />
                : <ArrowRight className="h-5 w-5 text-primary" />}
              Kalim: {currentStatus} → {targetStatus}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 mt-2">
                <p className="text-sm">{STATUS_DESCRIPTIONS[targetStatus]}</p>
                {targetStatus && getBlockers(targetStatus).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />Kushtet e mëposhtme nuk janë plotësuar:
                    </p>
                    {getBlockers(targetStatus).map((b, i) => (
                      <p key={i} className="text-xs text-yellow-700">• {b}</p>
                    ))}
                    <p className="text-xs text-yellow-600 mt-1 italic">
                  {targetStatus === 'Përfunduar'
                    ? 'Finalizimi i garës nuk lejohet derisa të plotësohen kushtet e mësipërme.'
                    : 'Mund të vazhdoni, por rekomandohet t\'i plotësoni këto kushte.'}
                </p>
                  </div>
                )}
                {targetStatus && getBlockers(targetStatus).length === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />Të gjitha kushtet janë plotësuar.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransition}
              disabled={saving || (targetStatus === 'Përfunduar' && getBlockers('Përfunduar').length > 0)}
              className={targetStatus === 'Anuluar' ? 'bg-destructive text-destructive-foreground' : ''}
            >
              {saving ? 'Duke ruajtur...' : `Konfirmo: ${targetStatus}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}