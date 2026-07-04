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
import { Plus, Building2, Loader2, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

const today = new Date().toISOString().split('T')[0];

function isLicenseActive(license) {
  if (!license) return false;
  return license.fee_paid && license.status === 'Aktive' &&
    license.valid_from <= today && license.valid_to >= today;
}

export default function ClubLicensing() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editLicense, setEditLicense] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list('name', 200),
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ['club-licenses'],
    queryFn: () => base44.entities.ClubLicense.list('-valid_from', 500),
  });

  // Per cdo klub, gjej licencën me të fundit
  const clubLicenseMap = {};
  for (const lic of licenses) {
    if (!clubLicenseMap[lic.club_id] || lic.valid_to > clubLicenseMap[lic.club_id].valid_to) {
      clubLicenseMap[lic.club_id] = lic;
    }
  }

  const openForm = (club, existingLic) => {
    setEditLicense(existingLic || null);
    setForm(existingLic ? { ...existingLic } : {
      club_id: club.id,
      club_name: club.name,
      status: 'Aktive',
      fee_paid: false,
      season: new Date().getFullYear().toString(),
      valid_from: today,
      valid_to: `${new Date().getFullYear()}-12-31`,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editLicense?.id) {
      await base44.entities.ClubLicense.update(editLicense.id, form);
    } else {
      await base44.entities.ClubLicense.create(form);
    }
    setSaving(false);
    setFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['club-licenses'] });
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Licencat e Klubeve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clubs.map(club => {
              const lic = clubLicenseMap[club.id];
              const active = isLicenseActive(lic);
              return (
                <div key={club.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{club.name}</p>
                      <p className="text-xs text-muted-foreground">{club.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {lic ? (
                      <>
                        <StatusBadge status={active ? 'Aktive' : 'Skaduar'} />
                        <span className="text-xs text-muted-foreground">{lic.valid_from} → {lic.valid_to}</span>
                        {lic.fee_paid && <Badge className="bg-green-100 text-green-800 text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Paguar</Badge>}
                      </>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 text-[10px]">Pa licencë</Badge>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openForm(club, lic)}>
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
          <DialogHeader><DialogTitle className="font-display">Licenca e Klubit — {form.club_name}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Sezoni</Label><Input value={form.season || ''} onChange={e => setForm({ ...form, season: e.target.value })} /></div>
              <div>
                <Label>Statusi</Label>
                <Select value={form.status || 'Aktive'} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Aktive','Skaduar','I pezulluar'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
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