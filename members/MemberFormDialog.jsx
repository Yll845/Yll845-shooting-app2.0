import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const DISCIPLINES = [
  'Pushkë Ajrore 10m', 'Pistoletë Ajrore 10m',
  'Pushkë e Vogël 50m', 'Pistoletë 25m',
  'Pushkë 300m', 'Trap', 'Skeet'
];

const CLUB_ROLES = ['Kryetar', 'Nënkryetar', 'Sekretar', 'Anëtar Këshillit Drejtues', 'Anëtar Kuvendi', 'Trajner'];
const FEDERATION_ROLES = [
  'Kryetar',
  'Nënkryetar',
  'Sekretar',
  'Anëtar Këshillit Drejtues',
  'Anëtar Kuvendi',
  'Anëtar Komisioni Disiplinor',
  'Anëtar Komisioni Ankesave',
  'Komisioner',
  'Trajner',
  'Refer'
];

const REQUIRED_FIELDS = ['first_name', 'last_name', 'personal_number', 'date_of_birth', 'gender', 'city', 'phone', 'email', 'club_id', 'status'];

export default function MemberFormDialog({ open, onOpenChange, member, allMembers = [], onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const missingFields = REQUIRED_FIELDS.filter(f => !form[f]);
  const hasClubRole = (form.club_roles || []).length > 0;

  // Kontrollo duplikate (përjashto anëtarin aktual gjatë redaktimit)
  const otherMembers = allMembers.filter(m => m.id !== member?.id);
  const duplicateErrors = [];
  if (form.personal_number && otherMembers.some(m => m.personal_number === form.personal_number))
    duplicateErrors.push('Numri personal ekziston tashmë');
  if (form.phone && otherMembers.some(m => m.phone === form.phone))
    duplicateErrors.push('Numri i telefonit ekziston tashmë');
  if (form.email && otherMembers.some(m => m.email?.toLowerCase() === form.email?.toLowerCase()))
    duplicateErrors.push('Email adresa ekziston tashmë');

  const isValid = missingFields.length === 0 && hasClubRole && duplicateErrors.length === 0;

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (member) {
      setForm({ ...member });
    } else {
      setForm({ status: 'Aktiv', is_shooter: false, club_roles: [], federation_roles: [], discipline: [], registration_date: todayStr });
    }
    setShowErrors(false);
  }, [member, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) { setShowErrors(true); return; }
    setSaving(true);
    const selectedClub = clubs.find(c => c.id === form.club_id);
    const data = { ...form, club_name: selectedClub?.name || form.club_name || '' };
    if (member?.id) {
      await base44.entities.Member.update(member.id, data);
    } else {
      await base44.entities.Member.create(data);
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  const toggleArrayItem = (field, value) => {
    const current = form[field] || [];
    setForm({
      ...form,
      [field]: current.includes(value) ? current.filter(x => x !== value) : [...current, value]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{member ? 'Redakto Anëtarin' : 'Shto Anëtar të Ri'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Të dhëna personale */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Të dhëna personale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={showErrors && !form.first_name ? 'text-destructive' : ''}>Emri *</Label>
                <Input value={form.first_name || ''} onChange={e => setForm({...form, first_name: e.target.value})} className={showErrors && !form.first_name ? 'border-destructive' : ''} />
              </div>
              <div>
                <Label className={showErrors && !form.last_name ? 'text-destructive' : ''}>Mbiemri *</Label>
                <Input value={form.last_name || ''} onChange={e => setForm({...form, last_name: e.target.value})} className={showErrors && !form.last_name ? 'border-destructive' : ''} />
              </div>
              <div>
                <Label className={showErrors && (!form.personal_number || duplicateErrors.some(e => e.includes('personal'))) ? 'text-destructive' : ''}>Numri personal *</Label>
                <Input value={form.personal_number || ''} onChange={e => setForm({...form, personal_number: e.target.value})} className={showErrors && (!form.personal_number || duplicateErrors.some(e => e.includes('personal'))) ? 'border-destructive' : ''} />
                {showErrors && duplicateErrors.some(e => e.includes('personal')) && <p className="text-xs text-destructive mt-1">Ky numër personal ekziston tashmë.</p>}
              </div>
              <div>
                <Label className={showErrors && !form.date_of_birth ? 'text-destructive' : ''}>Data e lindjes *</Label>
                <Input type="date" value={form.date_of_birth || ''} onChange={e => setForm({...form, date_of_birth: e.target.value})} className={showErrors && !form.date_of_birth ? 'border-destructive' : ''} />
              </div>
              <div>
                <Label className={showErrors && !form.gender ? 'text-destructive' : ''}>Gjinia *</Label>
                <Select value={form.gender || ''} onValueChange={v => setForm({...form, gender: v})}>
                  <SelectTrigger className={showErrors && !form.gender ? 'border-destructive' : ''}><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mashkull">Mashkull</SelectItem>
                    <SelectItem value="Femër">Femër</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={showErrors && !form.city ? 'text-destructive' : ''}>Qyteti *</Label>
                <Input value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} className={showErrors && !form.city ? 'border-destructive' : ''} />
              </div>
              <div>
                <Label className={showErrors && (!form.phone || duplicateErrors.some(e => e.includes('telefonit'))) ? 'text-destructive' : ''}>Telefoni *</Label>
                <Input value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className={showErrors && (!form.phone || duplicateErrors.some(e => e.includes('telefonit'))) ? 'border-destructive' : ''} />
                {showErrors && duplicateErrors.some(e => e.includes('telefonit')) && <p className="text-xs text-destructive mt-1">Ky numër telefoni ekziston tashmë.</p>}
              </div>
              <div>
                <Label className={showErrors && (!form.email || duplicateErrors.some(e => e.includes('Email'))) ? 'text-destructive' : ''}>Email *</Label>
                <Input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className={showErrors && (!form.email || duplicateErrors.some(e => e.includes('Email'))) ? 'border-destructive' : ''} />
                {showErrors && duplicateErrors.some(e => e.includes('Email')) && <p className="text-xs text-destructive mt-1">Kjo email adresë ekziston tashmë.</p>}
              </div>
              <div>
                <Label>ISSF ID <span className="text-muted-foreground font-normal">(opsionale)</span></Label>
                <Input value={form.issf_id || ''} onChange={e => setForm({...form, issf_id: e.target.value})} placeholder="p.sh. 1234567" />
              </div>
              </div>
              </div>

          {/* Klubi & Statusi */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Klubi & Statusi</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Data e regjistrimit — gjithmonë e bllokuar, nuk ndryshohet */}
              <div className="col-span-2">
                <Label>Data e regjistrimit</Label>
                <Input
                  type="date"
                  value={form.registration_date || ''}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {member ? 'Data e regjistrimit nuk mund të ndryshohet.' : 'Vendoset automatikisht me datën e sotme dhe nuk mund të ndryshohet.'}
                </p>
              </div>
              <div>
                <Label className={showErrors && !form.club_id ? 'text-destructive' : ''}>Klubi *</Label>
                <Select value={form.club_id || ''} onValueChange={v => setForm({...form, club_id: v})}>
                  <SelectTrigger className={showErrors && !form.club_id ? 'border-destructive' : ''}><SelectValue placeholder="Zgjidh klubin" /></SelectTrigger>
                  <SelectContent>{clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statusi</Label>
                <Select value={form.status || 'Aktiv'} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Aktiv', 'Joaktiv', 'I pezulluar', 'I transferuar'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Shenjëtar */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_shooter"
                checked={!!form.is_shooter}
                onCheckedChange={v => setForm({...form, is_shooter: v})}
              />
              <Label htmlFor="is_shooter" className="text-sm font-semibold cursor-pointer">Është shenjëtar (garues)</Label>
            </div>

            {form.is_shooter && (
              <div className="pl-6 space-y-4 border-l-2 border-muted">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kategoria</Label>
                    <Select value={form.shooter_category || ''} onValueChange={v => setForm({...form, shooter_category: v})}>
                      <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                      <SelectContent>{['Pionier', 'Junior', 'Senior', 'Veteran', 'U18', 'U21'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Nr. Licencës</Label><Input value={form.license_number || ''} onChange={e => setForm({...form, license_number: e.target.value})} /></div>
                  <div><Label>Licenca deri më</Label><Input type="date" value={form.license_valid_until || ''} onChange={e => setForm({...form, license_valid_until: e.target.value})} /></div>
                  </div>
                <div>
                  <Label className="mb-2 block">Disiplinat</Label>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map(d => (
                      <button key={d} type="button" onClick={() => toggleArrayItem('discipline', d)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${(form.discipline || []).includes(d) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pozitat në Klub */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pozitat në Klub <span className="text-destructive">* (të paktën një)</span></h3>
            <div className="flex flex-wrap gap-3">
              {CLUB_ROLES.map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(form.club_roles || []).includes(role)}
                    onCheckedChange={() => toggleArrayItem('club_roles', role)}
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
            {showErrors && !hasClubRole && (
              <p className="text-xs text-destructive">Duhet të zgjedhësh të paktën një pozitë në klub.</p>
            )}
          </div>

          {/* Pozitat në Federatë */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pozitat në Federatë</h3>
            <div className="flex flex-wrap gap-3">
              {FEDERATION_ROLES.map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={(form.federation_roles || []).includes(role)}
                    onCheckedChange={() => toggleArrayItem('federation_roles', role)}
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Të dhëna bankare */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Të dhëna bankare</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Emri i bankës</Label>
                <Input value={form.bank_name || ''} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="p.sh. Raiffeisen Bank" />
              </div>
              <div className="col-span-2">
                <Label>IBAN</Label>
                <Input value={form.iban || ''} onChange={e => setForm({...form, iban: e.target.value.toUpperCase()})} placeholder="p.sh. XK051212012345678906" />
              </div>
              <div>
                <Label>SWIFT / BIC</Label>
                <Input value={form.swift || ''} onChange={e => setForm({...form, swift: e.target.value.toUpperCase()})} placeholder="p.sh. RBKOXKPR" />
              </div>
            </div>
          </div>

          {/* Shënime */}
          <div>
            <Label>Shënime</Label>
            <Textarea value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
          </div>

          {showErrors && !isValid && (
            <div className="space-y-2">
              {missingFields.length > 0 && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  Ju luteni plotësoni të gjitha fushat e detyrueshme (*): {missingFields.join(', ')}.
                </p>
              )}
              {!hasClubRole && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  Duhet të zgjedhësh të paktën një pozitë në klub.
                </p>
              )}
              {duplicateErrors.map((err, i) => (
                <p key={i} className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  ⚠️ {err} — nuk lejohen të dhëna të njëjta për anëtarë të ndryshëm.
                </p>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {member ? 'Ruaj ndryshimet' : 'Shto anëtarin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}