import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, CheckCircle2, Unlock, AlertTriangle, ShieldCheck } from 'lucide-react';

const STATUS_COLORS = { 'Provizor': 'bg-yellow-100 text-yellow-800', 'Final': 'bg-green-100 text-green-800' };

// Konfigurim sipas disiplinës (emrat e rinj të standardizuar)
const DISCIPLINE_CONFIG = {
  'Pushkë Ajrore 10m, serike':       { series: 4, decimal: false, showX: false },
  'Pushkë Ajrore 10m, standarde':    { series: 6, decimal: true,  showX: false },
  'Pistoletë Ajrore 10m, standarde': { series: 6, decimal: false, showX: true  },
  'Pushkë e Vogël 50m':              { series: 6, decimal: true,  showX: false },
  'Pistoletë Standarde 25m':         { series: 6, decimal: false, showX: true  },
  'Pushkë 300m':                     { series: 6, decimal: true,  showX: false },
  'Trap':                            { series: 6, decimal: false, showX: false },
  'Skeet':                           { series: 6, decimal: false, showX: false },
};

const getConfig = (discipline) => DISCIPLINE_CONFIG[discipline] || { series: 6, decimal: false, showX: false };

function getScoreDistribution(res, cfg) {
  const distribution = {};
  for (let i = 1; i <= cfg.series; i++) {
    const val = parseFloat(res[`series_${i}`]) || 0;
    const key = Math.floor(val);
    distribution[key] = (distribution[key] || 0) + 1;
  }
  return distribution;
}

function compareByDistribution(distA, distB, maxScore = 10) {
  for (let score = maxScore; score >= 1; score--) {
    const a = distA[score] || 0;
    const b = distB[score] || 0;
    if (a !== b) return b - a;
  }
  return 0;
}

function sortResultsWithTiebreaker(resultsList, discipline) {
  const cfg = getConfig(discipline);
  const isPistolete = discipline?.includes('Pistoletë');
  const lastSeriesField = `series_${cfg.series}`;

  return [...resultsList].sort((a, b) => {
    const totalDiff = (b.total_score || 0) - (a.total_score || 0);
    if (totalDiff !== 0) return totalDiff;

    if (isPistolete) {
      const xDiff = (b.inner_tens || 0) - (a.inner_tens || 0);
      if (xDiff !== 0) return xDiff;
      return compareByDistribution(
        getScoreDistribution(a, cfg),
        getScoreDistribution(b, cfg),
        10
      );
    }

    const lastA = parseFloat(a[lastSeriesField]) || 0;
    const lastB = parseFloat(b[lastSeriesField]) || 0;
    if (lastA !== lastB) return lastB - lastA;

    return compareByDistribution(
      getScoreDistribution(a, cfg),
      getScoreDistribution(b, cfg),
      10
    );
  });
}

export default function CompetitionResults({ competitionId, competition, events }) {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [editingResult, setEditingResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const isInProgress = competition?.status === 'Në zhvillim';
  const isFinalized = competition?.status === 'Përfunduar';
  const canEditResults = isInProgress;

  const { data: registrations = [] } = useQuery({
    queryKey: ['competition-registrations', competitionId],
    queryFn: () => base44.entities.Registration.filter({ competition_id: competitionId }),
  });

  const { data: results = [] } = useQuery({
    queryKey: ['competition-results', competitionId],
    queryFn: () => base44.entities.Result.filter({ competition_id: competitionId }, '-total_score', 500),
  });

  const { data: weaponAssignments = [] } = useQuery({
    queryKey: ['weapon-assignments-active'],
    queryFn: () => base44.entities.WeaponAssignment.filter({ is_active: true }, 'member_name', 200),
  });

  const weaponMap = {};
  weaponAssignments.forEach(wa => { weaponMap[wa.member_id] = wa.weapon_info || ''; });

  const presentRegsAll = registrations.filter(r => r.attendance_status === 'Prezent');
  const regsWithoutWeapon = presentRegsAll.filter(r => !weaponMap[r.member_id]);

  const presentRegs = presentRegsAll;
  const filteredRegs = selectedEvent
    ? presentRegs.filter(r => r.event_id === selectedEvent)
    : presentRegs;

  const getSortedResults = (resList, discipline) =>
    sortResultsWithTiebreaker(resList, discipline);

  const getDiscipline = (reg) => reg.discipline || events.find(e => e.id === reg.event_id)?.discipline || '';
  const currentEventDiscipline = selectedEvent
    ? events.find(e => e.id === selectedEvent)?.discipline || ''
    : '';
  const currentConfig = getConfig(currentEventDiscipline);
  const showX = selectedEvent ? currentConfig.showX : true;
  const activeSeriesCount = selectedEvent ? currentConfig.series : 6;

  const getResult = (regId) => results.find(r => r.registration_id === regId);

  const startEdit = (reg) => {
    const existing = getResult(reg.id);
    setEditingResult({
      registration_id: reg.id,
      member_id: reg.member_id,
      member_name: reg.member_name,
      club_id: reg.club_id,
      club_name: reg.club_name,
      discipline: reg.discipline,
      gender: reg.gender,
      age_category: reg.age_category,
      relay_number: reg.relay_number,
      lane_number: reg.lane_number,
      event_id: reg.event_id,
      series_1: '', series_2: '', series_3: '',
      series_4: '', series_5: '', series_6: '',
      inner_tens: '',
      final_score: '',
      status: 'Provizor',
      notes: '',
      ...existing,
      id: existing?.id,
    });
  };

  const calcTotal = (res) => {
    const disc = res.discipline || '';
    const cfg = getConfig(disc);
    const fields = Array.from({ length: cfg.series }, (_, i) => `series_${i+1}`);
    const vals = fields.map(f => parseFloat(res[f]) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum * 10) / 10;
  };

  const toNum = (v) => (v === '' || v === null || v === undefined) ? null : parseFloat(v);

  const saveResult = async () => {
    if (!editingResult) return;
    setSaving(true);
    const total = calcTotal(editingResult);
    const data = {
      ...editingResult,
      series_1: toNum(editingResult.series_1),
      series_2: toNum(editingResult.series_2),
      series_3: toNum(editingResult.series_3),
      series_4: toNum(editingResult.series_4),
      series_5: toNum(editingResult.series_5),
      series_6: toNum(editingResult.series_6),
      inner_tens: toNum(editingResult.inner_tens),
      final_score: toNum(editingResult.final_score),
      total_score: total,
      competition_id: competitionId,
      competition_name: competition.name,
    };
    if (editingResult.id) {
      const existing = results.find(r => r.id === editingResult.id);
      if (existing?.status === 'Final') {
        alert('Rezultati Final nuk mund të ndryshohet.');
        setSaving(false);
        return;
      }
      await base44.entities.Result.update(editingResult.id, data);
    } else {
      await base44.entities.Result.create(data);
    }
    setSaving(false);
    setEditingResult(null);
    queryClient.invalidateQueries({ queryKey: ['competition-results', competitionId] });
  };

  const finalizeEvent = async (eventId) => {
    const eventResults = results.filter(r => r.event_id === eventId);
    for (const r of eventResults) {
      await base44.entities.Result.update(r.id, { status: 'Final' });
    }
    queryClient.invalidateQueries({ queryKey: ['competition-results', competitionId] });
  };

  const unlockResult = async (resultId) => {
    await base44.entities.Result.update(resultId, { status: 'Provizor' });
    queryClient.invalidateQueries({ queryKey: ['competition-results', competitionId] });
  };

  if (!isInProgress && !isFinalized) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center space-y-2">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
        <p className="font-semibold text-yellow-800">Rezultatet nuk mund të regjistrohen ende</p>
        <p className="text-sm text-yellow-700">
          Statusi i garës duhet të jetë <strong>"Në zhvillim"</strong> për të futur rezultate.<br />
          Statusi aktual: <strong>{competition?.status}</strong>
        </p>
      </div>
    );
  }

  if (isFinalized) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Gara është përfunduar</p>
            <p className="text-xs text-green-700 mt-0.5">Rezultatet janë finalizuar dhe nuk mund të ndryshohen më.</p>
          </div>
        </div>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />Rezultatet përfundimtare ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nuk ka rezultate të regjistruar.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-8 text-center">#</TableHead>
                      <TableHead>Sportisti</TableHead>
                      <TableHead className="hidden md:table-cell">Klubi</TableHead>
                      <TableHead className="text-center">S1</TableHead>
                      <TableHead className="text-center">S2</TableHead>
                      <TableHead className="text-center">S3</TableHead>
                      <TableHead className="text-center">S4</TableHead>
                      <TableHead className="text-center">S5</TableHead>
                      <TableHead className="text-center">S6</TableHead>
                      <TableHead className="text-center font-bold">Total</TableHead>
                      {showX && <TableHead className="text-center">X</TableHead>}
                      <TableHead className="text-center">Statusi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSortedResults(results, currentEventDiscipline).map((res, idx) => (
                      <TableRow key={res.id} className="bg-green-50/30">
                        <TableCell className="text-center font-bold text-sm w-8">{idx + 1}.</TableCell>
                        <TableCell className="font-medium text-sm">
                          {res.member_name}
                          {res.relay_number && <span className="text-xs text-muted-foreground block">N{res.relay_number}-P{res.lane_number}</span>}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{res.club_name || '—'}</TableCell>
                        <TableCell className="text-center text-sm">{res.series_1 ?? '—'}</TableCell>
                        <TableCell className="text-center text-sm">{res.series_2 ?? '—'}</TableCell>
                        <TableCell className="text-center text-sm">{res.series_3 ?? '—'}</TableCell>
                        <TableCell className="text-center text-sm">{res.series_4 ?? '—'}</TableCell>
                        <TableCell className="text-center text-sm">{res.series_5 ?? '—'}</TableCell>
                        <TableCell className="text-center text-sm">{res.series_6 ?? '—'}</TableCell>
                        <TableCell className="text-center font-bold">{res.total_score ?? '—'}</TableCell>
                        {showX && <TableCell className="text-center text-sm">{res.inner_tens ?? '—'}</TableCell>}
                        <TableCell className="text-center">
                          <Badge className={`text-[10px] ${STATUS_COLORS[res.status]}`}>{res.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {regsWithoutWeapon.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {regsWithoutWeapon.length} garues pa armë aktive
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              {regsWithoutWeapon.map(r => r.member_name).join(', ')} — Caktoni armën para eksportit të tabelës fillestare.
            </p>
          </div>
        </div>
      )}
      {regsWithoutWeapon.length === 0 && presentRegs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <p className="text-xs text-green-700 font-medium">Të gjithë garuesit prezent kanë armë aktive të verifikuar.</p>
        </div>
      )}
      <div className="flex gap-3 items-center flex-wrap">
        <Select value={selectedEvent || '_all'} onValueChange={v => setSelectedEvent(v === '_all' ? '' : v)}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Filtro sipas eventit" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Të gjithë</SelectItem>
            {events.map(ev => (
              <SelectItem key={ev.id} value={ev.id}>
                {ev.discipline} / {ev.gender} / {ev.age_category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEvent && (
          <Button size="sm" variant="outline" onClick={() => finalizeEvent(selectedEvent)}>
            <CheckCircle2 className="h-4 w-4 mr-1" />Finalizo eventin
          </Button>
        )}
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />Futja e rezultateve ({filteredRegs.length} garues prezent)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRegs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nuk ka garues prezent. Konfirmoni prezencën fillimisht.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-8 text-center">#</TableHead>
                    <TableHead>Sportisti</TableHead>
                    <TableHead className="hidden md:table-cell">Klubi</TableHead>
                    {Array.from({ length: activeSeriesCount }, (_, i) => (
                      <TableHead key={i} className="text-center">S{i+1}</TableHead>
                    ))}
                    <TableHead className="text-center font-bold">Total</TableHead>
                    {showX && <TableHead className="text-center">X</TableHead>}
                    <TableHead className="text-center">Statusi</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const regsWithResults = filteredRegs
                      .filter(r => getResult(r.id))
                      .map(r => ({ ...getResult(r.id), _regId: r.id }));
                    const sorted = getSortedResults(regsWithResults, currentEventDiscipline);
                    const rankMap = {};
                    sorted.forEach((r, i) => { rankMap[r._regId] = i + 1; });
                    return filteredRegs.map(reg => {
                      const res = getResult(reg.id);
                      const isFinal = res?.status === 'Final';
                      const disc = getDiscipline(reg);
                      const cfg = getConfig(disc);
                      const seriesFields = Array.from({ length: cfg.series }, (_, i) => `series_${i+1}`);
                      return (
                        <TableRow key={reg.id} className={isFinal ? 'bg-green-50/30' : ''}>
                          <TableCell className="text-center text-sm font-bold text-muted-foreground">
                            {rankMap[reg.id] ?? '—'}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {reg.member_name}
                            {reg.relay_number && <span className="text-xs text-muted-foreground block">N{reg.relay_number}-P{reg.lane_number}</span>}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{reg.club_name || '—'}</TableCell>
                          {seriesFields.map(s => (
                            <TableCell key={s} className="text-center text-sm p-1">
                              {editingResult?.registration_id === reg.id ? (
                                <Input
                                  type="number"
                                  step={cfg.decimal ? '0.1' : '1'}
                                  className="w-14 h-7 text-center text-xs p-1"
                                  value={editingResult[s] ?? ''}
                                  onChange={e => setEditingResult({ ...editingResult, [s]: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                />
                              ) : res?.[s] ?? '—'}
                            </TableCell>
                          ))}
                          {activeSeriesCount > cfg.series && Array.from({ length: activeSeriesCount - cfg.series }, (_, i) => (
                            <TableCell key={`empty-${i}`} className="text-center text-muted-foreground/30 text-sm">—</TableCell>
                          ))}
                          <TableCell className="text-center font-bold">
                            {editingResult?.registration_id === reg.id
                              ? calcTotal(editingResult)
                              : res?.total_score ?? '—'}
                          </TableCell>
                          {showX && (
                            <TableCell className="text-center text-sm p-1">
                              {cfg.showX ? (
                                editingResult?.registration_id === reg.id ? (
                                  <Input
                                    type="number"
                                    step="1"
                                    className="w-12 h-7 text-center text-xs p-1"
                                    value={editingResult.inner_tens ?? ''}
                                    onChange={e => setEditingResult({ ...editingResult, inner_tens: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                  />
                                ) : res?.inner_tens ?? '—'
                              ) : (
                                <span className="text-muted-foreground/30">—</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-center">
                            {res && <Badge className={`text-[10px] ${STATUS_COLORS[res.status]}`}>{res.status}</Badge>}
                          </TableCell>
                          <TableCell>
                            {editingResult?.registration_id === reg.id ? (
                              <div className="flex gap-1">
                                <Button size="sm" className="h-7 text-xs" onClick={saveResult} disabled={saving}>Ruaj</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingResult(null)}>✕</Button>
                              </div>
                            ) : isFinal || !canEditResults ? (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" disabled={!canEditResults} onClick={() => isFinal && unlockResult(res.id)}>
                                <Unlock className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => startEdit(reg)}>
                                {res ? 'Edito' : 'Fut'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}