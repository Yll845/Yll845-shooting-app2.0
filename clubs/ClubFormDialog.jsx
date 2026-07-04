import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function ClubFormDialog({ open, onOpenChange, club, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
  });

  useEffect(() => {
    if (club) {
      setForm({ ...club });
    } else {
      setForm({ status: 'active', coaches: [], coach_names: [] });
    }
  }, [club, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (club?.id) {
      await base44.entities.Club.update(club.id, form);
    } else {
      await base44.entities.Club.create(form);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  const setMemberField = (idField, nameField, memberId) => {
    const m = members.find(x => x.id === memberId);
    setForm({ ...form, [idField]: memberId, [nameField]: m ? `${m.first_name} ${m.last_name}` : '' });
  };

  const toggleCoach = (memberId) => {
    const m = members.find(x => x.id === memberId);
    const fullName = m ? `${m.first_name} ${m.last_name}` : '';
    const currentIds = form.coaches || [];
    const currentNames = form.coach_names || [];
    if (currentIds.includes(memberId)) {
      const idx = currentIds.indexOf(memberId);
      setForm({
        ...form,
        coaches: currentIds.filter(id => id !== memberId),
        coach_names: currentNames.filter((_, i) => i !== idx),
      });
    } else {
      setForm({ ...form, coaches: [...currentIds, memberId], coach_names: [...currentNames, fullName] });
    }
  };

  const memberOptions = members.map(m => ({ id: m.id, name: `${m.first_name} ${m.last_name}` }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{club ? 'Redakto Klubin' : 'Shto Klub të Ri'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Të dhënat kryesore */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Të dhëna kryesore</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Emri i klubit *</Label><Input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><Label>Qyteti / Komuna *</Label><Input value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} required /></div>
              <div><Label>Nr. Regjistrimit</Label><Input value={form.registration_number || ''} onChange={e => setForm({...form, registration_number: e.target.value})} /></div>
              <div><Label>Viti i themelimit</Label><Input type="number" value={form.founded_year || ''} onChange={e => setForm({...form, founded_year: parseInt(e.target.value) || ''})} /></div>
              <div>
                <Label>Statusi</Label>
                <Select value={form.status || 'active'} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Joaktiv</SelectItem>
                    <SelectItem value="suspended">I pezulluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Udhëheqja */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Udhëheqja</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>Kryetari</Label>
                <Select value={form.president_id || ''} onValueChange={v => setMemberField('president_id', 'president_name', v)}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh nga anëtarët" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>— Pa kryetar —</SelectItem>
                    {memberOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nënkryetari</Label>
                <Select value={form.vice_president_id || ''} onValueChange={v => setMemberField('vice_president_id', 'vice_president_name', v)}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh nga anëtarët" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>— Pa nënkryetar —</SelectItem>
                    {memberOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sekretari</Label>
                <Select value={form.secretary_id || ''} onValueChange={v => setMemberField('secretary_id', 'secretary_name', v)}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh nga anëtarët" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>— Pa sekretar —</SelectItem>
                    {memberOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Trajnerët */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trajnerët</h3>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
              {memberOptions.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nuk ka anëtarë</p>}
              {memberOptions.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={(form.coaches || []).includes(m.id)}
                    onChange={() => toggleCoach(m.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{m.name}</span>
                </label>
              ))}
            </div>
            {(form.coach_names || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.coach_names.map((name, i) => (
                  <span key={i} className="bg-muted text-xs px-2 py-1 rounded-full">{name}</span>
                ))}
              </div>
            )}
          </div>

          {/* Kontakti */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kontakti</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefoni</Label><Input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="col-span-2"><Label>Adresa</Label><Input value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} /></div>
            </div>
          </div>

          <div>
            <Label>Shënime</Label>
            <Textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {club ? 'Ruaj ndryshimet' : 'Shto klubin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}