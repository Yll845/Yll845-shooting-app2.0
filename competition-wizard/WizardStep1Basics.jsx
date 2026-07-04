import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { COMPETITION_TYPES, COMPETITION_STATUSES } from '@/lib/constants';

export default function WizardStep1Basics({ data, onChange }) {
  const set = (field, val) => onChange({ ...data, [field]: val });

  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Hapi 1 – Të dhënat bazë</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Emri i garës *</Label>
            <Input value={data.name} onChange={e => set('name', e.target.value)} placeholder="p.sh. Kampionati Kombëtar 2026" required />
          </div>
          <div>
            <Label>Lloji i garës</Label>
            <Select value={data.type || ''} onValueChange={v => set('type', v)}>
              <SelectTrigger><SelectValue placeholder="Zgjidh llojin" /></SelectTrigger>
              <SelectContent>{COMPETITION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Organizatori</Label>
            <Input value={data.organizer || ''} onChange={e => set('organizer', e.target.value)} />
          </div>
          <div>
            <Label>Data e fillimit *</Label>
            <Input type="date" value={data.date_start} onChange={e => set('date_start', e.target.value)} required />
          </div>
          <div>
            <Label>Data e mbarimit</Label>
            <Input type="date" value={data.date_end || ''} onChange={e => set('date_end', e.target.value)} />
          </div>
          <div>
            <Label>Afati i paraqitjes</Label>
            <Input type="date" value={data.registration_deadline || ''} onChange={e => set('registration_deadline', e.target.value)} />
          </div>
          <div>
            <Label>Statusi fillestar</Label>
            <Select value={data.status || 'Planifikuar'} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Planifikuar">Planifikuar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vendi i mbajtjes</Label>
            <Input value={data.location || ''} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <Label>Qyteti</Label>
            <Input value={data.city || ''} onChange={e => set('city', e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label>Përshkrimi</Label>
            <Textarea value={data.description || ''} onChange={e => set('description', e.target.value)} rows={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}