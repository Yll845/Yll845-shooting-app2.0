import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, UserCheck, UserX, User, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ATTENDANCE_COLORS = {
  'Regjistruar': 'bg-gray-100 text-gray-600',
  'Prezent': 'bg-green-100 text-green-800',
  'Mungon': 'bg-red-100 text-red-700',
};

function getAgeCategory(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed = today >= new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (!hasBirthdayPassed) age--;
  if (age < 16) return 'Pionier';
  if (age < 21) return 'Junior';
  return 'Senior';
}

function normalizeGender(memberGender) {
  if (memberGender === 'Mashkull') return 'Meshkuj';
  if (memberGender === 'Femër') return 'Femra';
  return memberGender;
}

export default function CompetitionRegistrations({ competitionId, competition, events, relays }) {
  const registrationDeadlinePassed = (() => {
    if (!competition?.date_start) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const raceDate = new Date(competition.date_start);
    raceDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((raceDate - today) / (1000 * 60 * 60 * 24));
    return diffDays < 3;
  })();

  const canRegister = ['Regjistrimi i hapur', 'Hapur'].includes(competition?.status) && !registrationDeadlinePassed;
  const queryClient = useQueryClient();
  const [addForm, setAddForm] = useState({ event_id: '', member_id: '' });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data: registrations = [] } = useQuery({
    queryKey: ['competition-registrations', competitionId],
    queryFn: () => base44.entities.Registration.filter({ competition_id: competitionId }),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
  });

  const { data: weaponAssignments = [] } = useQuery({
    queryKey: ['weapon-assignments-active'],
    queryFn: () => base44.entities.WeaponAssignment.filter({ is_active: true }, 'member_name', 200),
  });

  // Map member_id -> { info, discipline[] }
  const weaponMap = {};
  weaponAssignments.forEach(wa => {
    weaponMap[wa.member_id] = {
      info: wa.weapon_info || '',
      // weapon_discipline mund të jetë array ose string (backward compat)
      discipline: Array.isArray(wa.weapon_discipline)
        ? wa.weapon_discipline
        : (wa.weapon_discipline ? [wa.weapon_discipline] : []),
    };
  });

  // Vetëm shenjëtarët me armë aktive mund të regjistrohen
  const shootersWithWeapon = members.filter(m => m.is_shooter && !m.is_deleted && weaponMap[m.id]);

  const selectedEvent = events.find(e => e.id === addForm.event_id);
  const selectedDiscipline = selectedEvent?.discipline || '';
  const selectedGender = selectedEvent?.gender || '';
  const selectedAgeCategory = selectedEvent?.age_category || '';

  // Filtro sipas disiplinës (arma duhet të mbulojë disiplinën e eventit), gjinisë dhe kategorisë
  const shooters = selectedEvent
    ? shootersWithWeapon.filter(m => {
        const weaponDisciplines = weaponMap[m.id]?.discipline || [];
        const weaponDisciplineMatch = weaponDisciplines.includes(selectedDiscipline);
        const genderMatch = normalizeGender(m.gender) === selectedGender;
        const ageCategoryMatch = getAgeCategory(m.date_of_birth) === selectedAgeCategory;
        return weaponDisciplineMatch && genderMatch && ageCategoryMatch;
      })
    : shootersWithWeapon;

  // A ka fare armë aktive që mbulojnë këtë disiplinë?
  const noWeaponsForDiscipline = selectedDiscipline &&
    !weaponAssignments.some(wa => {
      const disciplines = Array.isArray(wa.weapon_discipline)
        ? wa.weapon_discipline
        : (wa.weapon_discipline ? [wa.weapon_discipline] : []);
      return disciplines.includes(selectedDiscipline);
    });

  const alreadyRegisteredInEvent = registrations
    .filter(r => r.event_id === addForm.event_id)
    .map(r => r.member_id);

  const handleAdd = async () => {
    if (!addForm.event_id || !addForm.member_id) return;
    setAdding(true);
    const ev = events.find(e => e.id === addForm.event_id);
    const member = members.find(m => m.id === addForm.member_id);
    await base44.entities.Registration.create({
      competition_id: competitionId,
      competition_name: competition.name,
      event_id: addForm.event_id,
      member_id: addForm.member_id,
      member_name: `${member.first_name} ${member.last_name}`,
      club_id: member.club_id || '',
      club_name: member.club_name || '',
      discipline: ev?.discipline || '',
      gender: ev?.gender || '',
      age_category: ev?.age_category || '',
      weapon_info: weaponMap[addForm.member_id]?.info || '',
      attendance_status: 'Regjistruar',
    });
    setAdding(false);
    setShowForm(false);
    setAddForm({ event_id: '', member_id: '' });
    queryClient.invalidateQueries({ queryKey: ['competition-registrations', competitionId] });
  };

  const updateAttendance = async (regId, status) => {
    await base44.entities.Registration.update(regId, { attendance_status: status });
    queryClient.invalidateQueries({ queryKey: ['competition-registrations', competitionId] });
  };

  const handleDelete = async () => {
    await base44.entities.Registration.delete(deleteId);
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['competition-registrations', competitionId] });
  };

  const confirmAll = async () => {
    const toConfirm = registrations.filter(r => r.attendance_status === 'Regjistruar');
    for (const r of toConfirm) {
      await base44.entities.Registration.update(r.id, { attendance_status: 'Prezent' });
    }
    queryClient.invalidateQueries({ queryKey: ['competition-registrations', competitionId] });
  };

  const counts = {
    prezent: registrations.filter(r => r.attendance_status === 'Prezent').length,
    mungon: registrations.filter(r => r.attendance_status === 'Mungon').length,
    regjistruar: registrations.filter(r => r.attendance_status === 'Regjistruar').length,
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="font-display text-base">Garuesit e regjistruar ({registrations.length})</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={confirmAll} disabled={counts.regjistruar === 0}>
                <UserCheck className="h-3.5 w-3.5 mr-1" />Konfirmo prezencën
              </Button>
              {canRegister ? (
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Shto garues
                </Button>
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                  {registrationDeadlinePassed
                    ? 'Regjistrimi u mbyll (3 ditë para garës)'
                    : ['Planifikuar', 'Draft'].includes(competition?.status)
                      ? 'Regjistrimi nuk është hapur'
                      : 'Regjistrimi mbyllur'}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="text-green-700">✓ Prezent: {counts.prezent}</span>
            <span className="text-red-600">✗ Mungon: {counts.mungon}</span>
            <span>⏳ Regjistruar: {counts.regjistruar}</span>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium mb-1">Eventi</p>
                  <Select value={addForm.event_id} onValueChange={v => setAddForm({ ...addForm, event_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Zgjidh eventin" /></SelectTrigger>
                    <SelectContent>
                      {events.length === 0
                        ? <SelectItem value="_none" disabled>Nuk ka evente — shto evente te gara</SelectItem>
                        : events.map(ev => (
                            <SelectItem key={ev.id} value={ev.id}>
                              {ev.discipline} / {ev.gender} / {ev.age_category}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Sportisti</p>
                  {noWeaponsForDiscipline ? (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Nuk ka armë të regjistruara për disiplinën "{selectedDiscipline}"
                    </div>
                  ) : (
                    <Select value={addForm.member_id} onValueChange={v => setAddForm({ ...addForm, member_id: v })} disabled={!addForm.event_id}>
                      <SelectTrigger><SelectValue placeholder={addForm.event_id ? 'Zgjidh sportisin' : 'Zgjidh eventin së pari'} /></SelectTrigger>
                      <SelectContent>
                        {shooters.filter(m => !alreadyRegisteredInEvent.includes(m.id)).length === 0 ? (
                          <SelectItem value="_none" disabled>
                            {addForm.event_id
                              ? `Nuk ka sportistë të përshtatshëm (${selectedDiscipline} / ${selectedGender} / ${selectedAgeCategory})`
                              : 'Zgjidh eventin së pari'}
                          </SelectItem>
                        ) : (
                          shooters
                            .filter(m => !alreadyRegisteredInEvent.includes(m.id))
                            .map(m => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.first_name} {m.last_name} — {m.club_name || 'Pa klub'} · {weaponMap[m.id]?.info}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={adding || !addForm.event_id || !addForm.member_id}>
                  {adding ? 'Duke shtuar...' : 'Shto'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Anulo</Button>
              </div>
            </div>
          )}

          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nuk ka garues të regjistruar ende.</p>
          ) : (
            <div className="space-y-2">
              {registrations.map(r => (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-opacity ${r.attendance_status === 'Mungon' ? 'opacity-40 bg-muted/20' : 'bg-muted/10'}`}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.member_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.club_name || '—'} · {r.discipline} · {r.gender} · {r.age_category}
                      {r.relay_number ? ` · Ndërrimi ${r.relay_number}, Poz. ${r.lane_number}` : ''}
                    </p>
                    {!weaponMap[r.member_id]?.info && (
                      <p className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="h-3 w-3" />Pa armë aktive
                      </p>
                    )}
                  </div>
                  <Badge className={`text-[10px] ${ATTENDANCE_COLORS[r.attendance_status]}`}>{r.attendance_status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="Prezent"
                      onClick={() => updateAttendance(r.id, 'Prezent')}>
                      <UserCheck className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Mungon"
                      onClick={() => updateAttendance(r.id, 'Mungon')}>
                      <UserX className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hiq garusin?</AlertDialogTitle>
            <AlertDialogDescription>Do të hiqet nga lista e regjistrimit.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hiq</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}