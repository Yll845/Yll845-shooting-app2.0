import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Calendar, Users, UserCheck, Info } from 'lucide-react';
import { REQUIRED_OFFICIAL_ROLES } from '@/lib/constants';

export default function WizardStepReview({ basics, relays, officials }) {
  const missingOfficials = REQUIRED_OFFICIAL_ROLES.filter(
    role => !officials.find(o => o.role === role)
  );
  const isComplete = missingOfficials.length === 0;

  return (
    <div className="space-y-4">
      <h2 className="font-display font-semibold text-lg">Hapi 4 – Verifikimi Final</h2>

      {/* Info - Eventet shtohen më vonë */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Eventet do të shtohen pas krijimit të garës</p>
          <p className="text-sm text-blue-700 mt-1">Pasi të krijohet gara, mund të shtoni evente (disiplina) te detajet e garës.</p>
        </div>
      </div>

      {!isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Organet e garës nuk janë komplet</p>
            <p className="text-sm text-yellow-700 mt-1">Mungojnë: {missingOfficials.join(', ')}</p>
            <p className="text-xs text-yellow-600 mt-1">Mund të vazhdoni, por PDF zyrtare nuk do të gjenerohet.</p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Të dhënat bazë */}
        <Card className="border shadow-sm">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold"><Calendar className="h-4 w-4 text-primary" />Gara</div>
            <p className="font-display font-bold">{basics.name}</p>
            {basics.type && <Badge variant="outline" className="text-xs">{basics.type}</Badge>}
            {basics.date_start && <p className="text-sm text-muted-foreground">📅 {basics.date_start}{basics.date_end ? ` — ${basics.date_end}` : ''}</p>}
            {(basics.location || basics.city) && <p className="text-sm text-muted-foreground">📍 {basics.location}{basics.location && basics.city ? ', ' : ''}{basics.city}</p>}
            {basics.organizer && <p className="text-sm text-muted-foreground">🏢 {basics.organizer}</p>}
          </CardContent>
        </Card>

        {/* Ndërrimet */}
        <Card className="border shadow-sm">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" />Ndërrimet ({relays.length})</div>
            {relays.length === 0 ? (
              <p className="text-sm text-destructive">⚠️ Nuk ka ndërrime!</p>
            ) : (
              <div className="space-y-1">
                {relays.map(r => (
                  <p key={r.relay_number} className="text-sm text-muted-foreground">
                    Ndërrimi {r.relay_number} {r.scheduled_time ? `— ora ${r.scheduled_time}` : ''}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organet */}
        <Card className="border shadow-sm sm:col-span-2">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserCheck className="h-4 w-4 text-primary" />
              Organet ({officials.length}/{REQUIRED_OFFICIAL_ROLES.length})
              {isComplete
                ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                : <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 max-h-40 overflow-y-auto">
              {REQUIRED_OFFICIAL_ROLES.map(role => {
                const off = officials.find(o => o.role === role);
                return (
                  <div key={role} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground truncate">{role}</span>
                    {off
                      ? <span className="font-medium text-green-700 shrink-0 ml-2">{off.member_name}</span>
                      : <span className="text-destructive shrink-0 ml-2">Mungon</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}