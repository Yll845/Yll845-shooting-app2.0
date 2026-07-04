import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function WeaponAssignDialog({ weapon, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState('');

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['weapon-assignments'],
    queryFn: () => base44.entities.WeaponAssignment.filter({ is_active: true }, '-created_date', 200),
  });

  const shooters = members.filter(m => m.is_shooter && m.status === 'Aktiv' && !m.is_deleted);

  // Caktimi aktiv i kësaj arme specifike (nëse ekziston)
  const currentWeaponAssignment = assignments.find(a => a.weapon_id === weapon.id && a.is_active);

  const handleMemberChange = (id) => {
    setMemberId(id);
    // Nëse arma tashmë i takon këtij shenjëtari
    if (currentWeaponAssignment && currentWeaponAssignment.member_id === id) {
      setWarning('same_member');
      return;
    }
    // Nëse shenjëtari ka armë tjetër aktive (jo këtë)
    const memberHasOther = assignments.some(a => a.member_id === id && a.weapon_id !== weapon.id && a.is_active);
    if (memberHasOther) {
      setWarning('has_other');
    } else {
      setWarning('');
    }
  };

  const handleAssign = async () => {
    if (!memberId || !startDate) return;
    setSaving(true);
    const member = members.find(m => m.id === memberId);

    // Kontrollo nëse ka caktim aktiv për këtë armë
    const existingForWeapon = assignments.find(a => a.weapon_id === weapon.id && a.is_active);
    if (existingForWeapon) {
      // Mbyll caktimin e vjetër
      await base44.entities.WeaponAssignment.update(existingForWeapon.id, {
        is_active: false,
        end_date: startDate,
      });
    }

    // Mbyll çdo caktim aktiv të mëparshëm të shenjëtarit (një aktiv për shenjëtar)
    const memberActiveAssignments = assignments.filter(a => a.member_id === memberId && a.is_active);
    for (const old of memberActiveAssignments) {
      await base44.entities.WeaponAssignment.update(old.id, { is_active: false, end_date: startDate });
    }

    await base44.entities.WeaponAssignment.create({
      weapon_id: weapon.id,
      weapon_info: `${weapon.brand || ''} ${weapon.model || ''} SN:${weapon.serial_number}`.trim(),
      weapon_discipline: weapon.discipline || '',
      member_id: memberId,
      member_name: `${member.first_name} ${member.last_name}`,
      club_id: member.club_id || '',
      club_name: member.club_name || '',
      start_date: startDate,
      is_active: true, // gjithmonë aktive — caktimet e vjetra u mbyllën
    });

    setSaving(false);
    onSaved();
    queryClient.invalidateQueries({ queryKey: ['weapon-assignments'] });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Cakto armën te shenjëtari</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="font-medium">{weapon.brand} {weapon.model}</p>
            <p className="text-muted-foreground text-xs">SN: {weapon.serial_number} · {weapon.weapon_type}</p>
            {weapon.discipline && <p className="text-muted-foreground text-xs">🎯 {weapon.discipline}</p>}
          </div>

          {/* Arma tashmë i takon shenjëtarit tjetër — blloko */}
          {currentWeaponAssignment && !memberId && (
            <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Kjo armë aktualisht i është caktuar: <strong>{currentWeaponAssignment.member_name}</strong>. Zgjidh shenjëtarin e ri — caktimi i vjetër do të mbyllet automatikisht.
            </div>
          )}
          {warning === 'same_member' && (
            <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Kjo armë tashmë i është caktuar këtij shenjëtari me status aktiv.
            </div>
          )}
          {warning === 'has_other' && (
            <div className="flex gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              Ky shenjëtar ka armë tjetër aktive. Ajo do të zëvendësohet me këtë armë.
            </div>
          )}

          <div>
            <Label>Shenjëtari *</Label>
            <Select value={memberId} onValueChange={handleMemberChange}>
              <SelectTrigger><SelectValue placeholder="Zgjidh shenjëtarin" /></SelectTrigger>
              <SelectContent>
                {shooters.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name} — {m.club_name || 'Pa klub'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data e fillimit *</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Anulo</Button>
            <Button onClick={handleAssign} disabled={saving || !memberId || warning === 'same_member'}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Cakto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}