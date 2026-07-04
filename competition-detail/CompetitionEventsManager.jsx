import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Target } from 'lucide-react';
import { DISCIPLINES, GENDERS, AGE_CATEGORIES } from '@/lib/constants';

export default function CompetitionEventsManager({ competitionId, competitionName }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ discipline: '', gender: '', age_category: '' });
  const [adding, setAdding] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ['competition-events', competitionId],
    queryFn: () => base44.entities.CompetitionEvent.filter({ competition_id: competitionId }),
  });

  const handleAdd = async () => {
    if (!form.discipline || !form.gender || !form.age_category) return;
    const exists = events.some(e =>
      e.discipline === form.discipline && e.gender === form.gender && e.age_category === form.age_category
    );
    if (exists) return;
    setAdding(true);
    await base44.entities.CompetitionEvent.create({
      competition_id: competitionId,
      competition_name: competitionName,
      discipline: form.discipline,
      gender: form.gender,
      age_category: form.age_category,
      status: 'Aktiv',
    });
    setForm({ discipline: '', gender: '', age_category: '' });
    setAdding(false);
    queryClient.invalidateQueries({ queryKey: ['competition-events', competitionId] });
  };

  const handleDelete = async (eventId) => {
    await base44.entities.CompetitionEvent.delete(eventId);
    queryClient.invalidateQueries({ queryKey: ['competition-events', competitionId] });
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Target className="h-4 w-4" />Eventet ({events.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forma e shtimit */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shto event të ri</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Disiplina</Label>
              <Select value={form.discipline} onValueChange={v => setForm({ ...form, discipline: v })}>
                <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>{DISCIPLINES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Gjinia</Label>
              <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Kategoria</Label>
              <Select value={form.age_category} onValueChange={v => setForm({ ...form, age_category: v })}>
                <SelectTrigger><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>{AGE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={handleAdd} disabled={adding || !form.discipline || !form.gender || !form.age_category}>
            <Plus className="h-3.5 w-3.5 mr-1" />{adding ? 'Duke shtuar...' : 'Shto event'}
          </Button>
        </div>

        {/* Lista e eventeve */}
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nuk ka evente. Shtoni të paktën një event.</p>
        ) : (
          <div className="space-y-2">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{ev.discipline}</Badge>
                  <Badge className="bg-blue-100 text-blue-800">{ev.gender}</Badge>
                  <Badge className="bg-green-100 text-green-800">{ev.age_category}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ev.id)}>
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