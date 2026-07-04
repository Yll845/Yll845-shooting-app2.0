import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { DISCIPLINES, GENDERS, AGE_CATEGORIES } from '@/lib/constants';

export default function WizardStep2Events({ events, onChange }) {
  const [form, setForm] = useState({ discipline: '', gender: '', age_category: '' });

  const addEvent = () => {
    if (!form.discipline || !form.gender || !form.age_category) return;
    const exists = events.some(e =>
      e.discipline === form.discipline && e.gender === form.gender && e.age_category === form.age_category
    );
    if (exists) return;
    onChange([...events, { ...form, status: 'Aktiv' }]);
    setForm({ discipline: '', gender: '', age_category: '' });
  };

  const removeEvent = (idx) => onChange(events.filter((_, i) => i !== idx));

  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6 space-y-5">
        <h2 className="font-display font-semibold text-lg">Hapi 2 – Eventet (Disiplinë + Gjini + Kategori)</h2>
        <p className="text-sm text-muted-foreground">Çdo kombinim i disiplinës, gjinisë dhe kategorisë është një event i veçantë.</p>

        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <Label>Disiplina</Label>
            <Select value={form.discipline} onValueChange={v => setForm({ ...form, discipline: v })}>
              <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
              <SelectContent>{DISCIPLINES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Gjinia</Label>
            <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
              <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
              <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Kategoria</Label>
            <Select value={form.age_category} onValueChange={v => setForm({ ...form, age_category: v })}>
              <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
              <SelectContent>{AGE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button type="button" onClick={addEvent} disabled={!form.discipline || !form.gender || !form.age_category}>
          <Plus className="h-4 w-4 mr-2" />Shto event
        </Button>

        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">Nuk ka evente. Shtoni të paktën një event.</p>
        ) : (
          <div className="space-y-2">
            {events.map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{ev.discipline}</Badge>
                  <Badge className="bg-blue-100 text-blue-800">{ev.gender}</Badge>
                  <Badge className="bg-green-100 text-green-800">{ev.age_category}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEvent(idx)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}