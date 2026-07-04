import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Shuffle } from 'lucide-react';
import { MAX_LANES } from '@/lib/constants';

export default function CompetitionRelaysManager({ competitionId }) {
  const queryClient = useQueryClient();
  const [time, setTime] = useState('');
  const [adding, setAdding] = useState(false);

  const { data: relays = [] } = useQuery({
    queryKey: ['competition-relays', competitionId],
    queryFn: () => base44.entities.CompetitionRelay.filter({ competition_id: competitionId }, 'relay_number'),
  });

  const handleAdd = async () => {
    setAdding(true);
    const relay_number = relays.length + 1;
    await base44.entities.CompetitionRelay.create({
      competition_id: competitionId,
      relay_number,
      scheduled_time: time,
      notes: '',
    });
    setTime('');
    setAdding(false);
    queryClient.invalidateQueries({ queryKey: ['competition-relays', competitionId] });
  };

  const handleDelete = async (relayId) => {
    await base44.entities.CompetitionRelay.delete(relayId);
    // Rinumëro ndërrimet pas fshirjes
    const remaining = relays.filter(r => r.id !== relayId).sort((a, b) => a.relay_number - b.relay_number);
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].relay_number !== i + 1) {
        await base44.entities.CompetitionRelay.update(remaining[i].id, { relay_number: i + 1 });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['competition-relays', competitionId] });
  };

  const updateTime = async (relayId, val) => {
    await base44.entities.CompetitionRelay.update(relayId, { scheduled_time: val });
    queryClient.invalidateQueries({ queryKey: ['competition-relays', competitionId] });
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Shuffle className="h-4 w-4" />Ndërrimet ({relays.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forma e shtimit */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shto ndërrim të ri</p>
          <div className="flex gap-3 items-end">
            <div>
              <Label className="text-xs">Ora e planifikuar (opsionale)</Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-36" />
            </div>
            <Button size="sm" onClick={handleAdd} disabled={adding}>
              <Plus className="h-3.5 w-3.5 mr-1" />{adding ? 'Duke shtuar...' : 'Shto ndërrim'}
            </Button>
          </div>
        </div>

        {/* Lista e ndërrimeve */}
        {relays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nuk ka ndërrime. Shtoni të paktën një ndërrim.</p>
        ) : (
          <div className="space-y-2">
            {relays.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {r.relay_number}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ndërrimi {r.relay_number}</p>
                  <p className="text-xs text-muted-foreground">Deri në {MAX_LANES} pozicione</p>
                </div>
                <Input
                  type="time"
                  value={r.scheduled_time || ''}
                  onChange={e => updateTime(r.id, e.target.value)}
                  className="w-28 h-7 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(r.id)}>
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