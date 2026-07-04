import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, UserCheck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { DISCIPLINES } from '@/lib/constants';

const today = new Date().toISOString().split('T')[0];

function isLicenseActive(license) {
  if (!license) return false;
  return license.fee_paid && license.status === 'Aktive' &&
    license.valid_from <= today && license.valid_to >= today;
}

export default function AthleteLicensing() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editLicense, setEditLicense] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [clubWarning, setClubWarning] = useState('');

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list('name', 200),
  });

  const { data: clubLicenses = [] } = useQuery({
    queryKey: ['club-licenses'],
    queryFn: () => base44.entities.ClubLicense.list('-valid_from', 500),
  });

  const { data: athleteLicenses = [] } = useQuery({
    queryKey: ['athlete-licenses'],
    queryFn: () => base44.entities.AthleteLicense.list('-valid_from', 1000),
  });

  const shooters = members.filter(m => m.is_shooter && !m.is_deleted);
  const filtered = shooters.filter(m => {
    const q = search.toLowerCase();
    return !q || `${m.first_name} ${m.last_name} ${m.club_name || ''}`.toLowerCase().includes(q);
  });

  // Per cdo shenjëtar, gjej licencën aktive
  const getActiveLicense = (memberId) => {
    return athleteLicenses.find(l => l.member_id === memberId && isLicenseActive(l));
  };

  const isClubLicensed = (clubId) => {
    const lic = clubLicenses
      .filter(l => l.club_id === clubId)
      .sort((a, b) => b.valid_to > a.valid_to ? 1 : -1)[0];
    return isLicenseActive(lic);
  };

  const openForm = (member, existingLic) => {
    setEditLicense(existingLic || null);
    const clubLicensed = isClubLicensed(member.club_id);
    setClubWarning(clubLicensed ? '' : '⚠️ Klubi i këtij sportisti nuk ka licencë aktive. Licencimi i garuesit nuk rekomandohet.');
    setForm(existingLic ? { ...existingLic } : {
      member_id: member.id,
      member_name: `${member.first_name} ${member.last_name}`,
      club_id: member.club_id || '',
      club_name: member.club_name || '',
      status: 'Aktive',
      fee_paid: false,
      season: new Date().getFullYear().toString(),
      valid_from: today,
      valid_to: `${new Date().getFullYear()}-12-31`,
      discipline: member.discipline?.[0] || '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editLicense?.id) {
      await base44.entities.AthleteLicense.update(editLicense.id, form);
    } else {
      await base44.entities.AthleteLicense.create(form);
    }
    setSaving(false);
    setFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['athlete-licenses'] });
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Kërko garues..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Licencat e Garuesve ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map(member => {
              const lic = getActiveLicense(member.id);
              const clubLicensed = isClubLicensed(member.club_id);
              return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.first_name} {member.last_name}</p>
                      <p className="text-xs text-muted-foreground">{member.club_name || '—'} · {member.shooter_category || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {!clubLicensed && <Badge className="bg-orange-100 text-orange-700 text-[10px]"><AlertTriangle className="h-3 w-3 mr-0.5" />Klubi jo licencuar</Badge>}
                    {lic ? (
                      <>
                        <Badge className="bg-green-100 text-green-800 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-0.5" />Licencuar</Badge>
                        <span className="text-xs text-muted-foreground">{lic.discipline} · {lic.valid_to}</span>
                      </>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 text-[10px]">Pa licencë aktive</Badge>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openForm(member, lic)}>
                      {lic ? 'Rinovo' : 'Licenco'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Licenca e Garuesit — {form.member_name}</DialogTitle></DialogHeader>
          {clubWarning && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{clubWarning}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Disiplina *</Label>
                <Select value={form.discipline || ''} onValueChange={v => setForm({ ...form, discipline: v })}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh disiplinën" /></SelectTrigger>
                  <SelectContent>{DISCIPLINES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Sezoni</Label><Input value={form.season || ''} onChange={e => setForm({ ...form, season: e.target.value })} /></div>
              <div>
                <Label>Statusi</Label>
                <Select value={form.status || 'Aktive'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Aktive','Skaduar','I pezulluar'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Valide nga *</Label><Input type="date" value={form.valid_from || ''} onChange={e => setForm({ ...form, valid_from: e.target.value })} required /></div>
              <div><Label>Valide deri *</Label><Input type="date" value={form.valid_to || ''} onChange={e => setForm({ ...form, valid_to: e.target.value })} required /></div>
              <div>
                <Label>Tarifa e paguar</Label>
                <Select value={form.fee_paid ? 'po' : 'jo'} onValueChange={v => setForm({ ...form, fee_paid: v === 'po' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="po">Po</SelectItem><SelectItem value="jo">Jo</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Data e pagesës</Label><Input type="date" value={form.payment_date || ''} onChange={e => setForm({ ...form, payment_date: e.target.value })} /></div>
            </div>
            <div><Label>Shënime</Label><Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Anulo</Button>
              <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Ruaj licencën</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}