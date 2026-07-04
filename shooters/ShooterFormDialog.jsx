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

const CATEGORIES = ['Junior', 'Senior', 'Veteran', 'U18', 'U21'];
const GENDERS = ['Mashkull', 'Femër'];
const STATUSES = ['Aktiv', 'Joaktiv', 'I pezulluar', 'I transferuar'];
const DISCIPLINES = [
  'Pushkë Ajrore 10m', 'Pistoletë Ajrore 10m',
  'Pushkë e Vogël 50m', 'Pistoletë 25m',
  'Pushkë 300m', 'Trap', 'Skeet'
];

export default function ShooterFormDialog({ open, onOpenChange, shooter, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  useEffect(() => {
    if (shooter) {
      setForm({ ...shooter });
    } else {
      setForm({ status: 'Aktiv', category: 'Senior', gender: 'Mashkull', discipline: [] });
    }
  }, [shooter, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const selectedClub = clubs.find(c => c.id === form.club_id);
    const data = { ...form, club_name: selectedClub?.name || form.club_name || '' };
    
    if (shooter?.id) {
      await base44.entities.Shooter.update(shooter.id, data);
    } else {
      await base44.entities.Shooter.create(data);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  const toggleDiscipline = (d) => {
    const current = form.discipline || [];
    setForm({
      ...form,
      discipline: current.includes(d) ? current.filter(x => x !== d) : [...current, d]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{shooter ? 'Redakto Shenjëtarin' : 'Shto Shenjëtar të Ri'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Të dhëna personale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Emri *</Label><Input value={form.first_name || ''} onChange={e => setForm({...form, first_name: e.target.value})} required /></div>
              <div><Label>Mbiemri *</Label><Input value={form.last_name || ''} onChange={e => setForm({...form, last_name: e.target.value})} required /></div>
              <div><Label>Numri personal</Label><Input value={form.personal_number || ''} onChange={e => setForm({...form, personal_number: e.target.value})} /></div>
              <div><Label>Data e lindjes</Label><Input type="date" value={form.date_of_birth || ''} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
              <div>
                <Label>Gjinia</Label>
                <Select value={form.gender || ''} onValueChange={v => setForm({...form, gender: v})}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                  <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Qyteti</Label><Input value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div><Label>Telefoni</Label><Input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} /></div>
            </div>
          </div>

          {/* Club & profession */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profesionale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Klubi</Label>
                <Select value={form.club_id || ''} onValueChange={v => setForm({...form, club_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh klubin" /></SelectTrigger>
                  <SelectContent>{clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kategoria</Label>
                <Select value={form.category || ''} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Nr. Licencës</Label><Input value={form.license_number || ''} onChange={e => setForm({...form, license_number: e.target.value})} /></div>
              <div><Label>Licenca deri më</Label><Input type="date" value={form.license_valid_until || ''} onChange={e => setForm({...form, license_valid_until: e.target.value})} /></div>
              <div>
                <Label>Statusi</Label>
                <Select value={form.status || 'Aktiv'} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Disciplines */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Disiplinat</h3>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDiscipline(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    (form.discipline || []).includes(d)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Shënime</Label>
            <Textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {shooter ? 'Ruaj ndryshimet' : 'Shto shenjëtarin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}