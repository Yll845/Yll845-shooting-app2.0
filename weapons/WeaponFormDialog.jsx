import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { DISCIPLINES } from '@/lib/constants';

const WEAPON_TYPES = ['Pushkë Ajrore', 'Pistoletë Ajrore', 'Pushkë e Vogël', 'Pistoletë Standarde', 'Pushkë 300m', 'Shotgun'];
const OWNERSHIP_TYPES = ['Klub', 'Federatë', 'Personale'];

export default function WeaponFormDialog({ open, onOpenChange, weapon, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list('name', 200),
    enabled: open,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
    enabled: open,
  });

  useEffect(() => {
    setForm(weapon ? { ...weapon, discipline: weapon.discipline || [] } : { status: 'Aktive', ownership_type: 'Klub', discipline: [] });
  }, [weapon, open]);

  const clubRequired = form.ownership_type === 'Klub' && !form.owner_club_id;
  const memberRequired = form.ownership_type === 'Personale' && !form.owner_member_id;

  // Filtro vetëm shenjëtarët (garuesit)
  const shooters = members.filter(m => m.is_shooter && !m.is_deleted);

  const handleOwnershipChange = (v) => {
    // Pastro fushat e pronarit kur ndryshon tipi
    setForm({
      ...form,
      ownership_type: v,
      owner_club_id: '',
      owner_club_name: '',
      owner_member_id: '',
      owner_member_name: '',
    });
  };

  const toggleDiscipline = (d) => {
    const current = form.discipline || [];
    setForm({
      ...form,
      discipline: current.includes(d) ? current.filter(x => x !== d) : [...current, d],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clubRequired || memberRequired) return;
    setSaving(true);
    if (weapon?.id) {
      await base44.entities.Weapon.update(weapon.id, form);
    } else {
      await base44.entities.Weapon.create(form);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  const setClub = (clubId) => {
    const c = clubs.find(x => x.id === clubId);
    setForm({ ...form, owner_club_id: clubId, owner_club_name: c?.name || '' });
  };

  const setMember = (memberId) => {
    const m = members.find(x => x.id === memberId);
    setForm({ ...form, owner_member_id: memberId, owner_member_name: m ? `${m.first_name} ${m.last_name}` : '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{weapon ? 'Redakto Armën' : 'Shto Armë të Re'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lloji i armës *</Label>
              <Select value={form.weapon_type || ''} onValueChange={v => setForm({ ...form, weapon_type: v })}>
                <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>{WEAPON_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Marka</Label><Input value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
            <div><Label>Modeli</Label><Input value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} /></div>
            <div><Label>Numri serik *</Label><Input value={form.serial_number || ''} onChange={e => setForm({ ...form, serial_number: e.target.value })} required /></div>
            <div><Label>Kalibri</Label><Input value={form.caliber || ''} onChange={e => setForm({ ...form, caliber: e.target.value })} /></div>
            <div><Label>Kodi i inventarit</Label><Input value={form.inventory_code || ''} onChange={e => setForm({ ...form, inventory_code: e.target.value })} /></div>
            <div>
              <Label>Statusi</Label>
              <Select value={form.status || 'Aktive'} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Aktive','Joaktive','E dëmtuar','E hequr nga përdorimi'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Pronësia *</Label>
              <Select value={form.ownership_type || ''} onValueChange={handleOwnershipChange}>
                <SelectTrigger><SelectValue placeholder="Zgjidh nivelin e pronësisë" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Federatë">Federatë</SelectItem>
                  <SelectItem value="Klub">Klub</SelectItem>
                  <SelectItem value="Personale">Garues (Personale)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Federata — fusha gri, pa zgjedhje */}
            {form.ownership_type === 'Federatë' && (
              <div className="col-span-2">
                <Label className="text-muted-foreground">Pronari</Label>
                <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground italic">
                  Federata e Shënjetarisë së Kosovës
                </div>
              </div>
            )}

            {/* Klubi — filtrohen klubet */}
            {form.ownership_type === 'Klub' && (
              <div className="col-span-2">
                <Label className={clubRequired ? 'text-destructive' : ''}>Klubi pronar *</Label>
                <Select value={form.owner_club_id || ''} onValueChange={setClub}>
                  <SelectTrigger className={clubRequired ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Zgjidh klubin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {clubRequired && <p className="text-xs text-destructive mt-1">Klubi pronar është i detyrueshëm.</p>}
              </div>
            )}

            {/* Garues — filtrohen vetëm shenjëtarët */}
            {form.ownership_type === 'Personale' && (
              <div className="col-span-2">
                <Label className={memberRequired ? 'text-destructive' : ''}>Garuesi pronar *</Label>
                <Select value={form.owner_member_id || ''} onValueChange={setMember}>
                  <SelectTrigger className={memberRequired ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Zgjidh garusin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shooters.length === 0
                      ? <SelectItem value="_none" disabled>Nuk ka garues të regjistruar</SelectItem>
                      : shooters.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.first_name} {m.last_name} {m.club_name ? `— ${m.club_name}` : ''}
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
                {memberRequired && <p className="text-xs text-destructive mt-1">Garuesi pronar është i detyrueshëm.</p>}
              </div>
            )}
          </div>

          {/* Disiplinat — multi-select */}
          <div>
            <Label className="mb-2 block">Disiplinat <span className="text-muted-foreground font-normal text-xs">(mund të zgjidhni më shumë se një)</span></Label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map(d => {
                const selected = (form.discipline || []).includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDiscipline(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            {(form.discipline || []).length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Nuk është zgjedhur asnjë disiplinë.</p>
            )}
          </div>

          <div><Label>Shënime</Label><Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {weapon ? 'Ruaj' : 'Shto armën'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}