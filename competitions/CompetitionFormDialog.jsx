import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const TYPES = ['Kampionat Kombëtar', 'Kupë e Kosovës', 'Garë Miqësore', 'Turne', 'Kualifikuese', 'Ndërkombëtare'];
const CATEGORIES = ['Junior', 'Senior', 'Veteran', 'U18', 'U21', 'Të gjitha'];
const STATUSES = ['Planifikuar', 'Regjistrimi i hapur', 'Në zhvillim', 'Përfunduar', 'Anuluar'];
const DISCIPLINES = [
  'Pushkë Ajrore 10m', 'Pistoletë Ajrore 10m',
  'Pushkë e Vogël 50m', 'Pistoletë 25m',
  'Pushkë 300m', 'Trap', 'Skeet'
];

export default function CompetitionFormDialog({ open, onOpenChange, competition, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (competition) {
      setForm({ ...competition });
    } else {
      setForm({ status: 'Planifikuar', category: 'Të gjitha' });
    }
  }, [competition, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (competition?.id) {
      await base44.entities.Competition.update(competition.id, form);
    } else {
      await base44.entities.Competition.create(form);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{competition ? 'Redakto Garën' : 'Shto Garë të Re'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Emri i garës *</Label><Input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div>
              <Label>Lloji</Label>
              <Select value={form.type || ''} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kategoria</Label>
              <Select value={form.category || ''} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statusi</Label>
              <Select value={form.status || 'Planifikuar'} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Data e fillimit *</Label><Input type="date" value={form.date_start || ''} onChange={e => setForm({...form, date_start: e.target.value})} required /></div>
            <div><Label>Data e mbarimit</Label><Input type="date" value={form.date_end || ''} onChange={e => setForm({...form, date_end: e.target.value})} /></div>
            <div><Label>Vendi</Label><Input value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div><Label>Qyteti</Label><Input value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} /></div>
            <div><Label>Max pjesëmarrës</Label><Input type="number" value={form.max_participants || ''} onChange={e => setForm({...form, max_participants: parseInt(e.target.value) || ''})} /></div>
          </div>
          <div><Label>Përshkrimi</Label><Textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {competition ? 'Ruaj' : 'Shto garën'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}