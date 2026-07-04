import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { MAX_LANES } from '@/lib/constants';

export default function WizardStep3Relays({ relays, onChange }) {
  const [time, setTime] = useState('');

  const addRelay = () => {
    const relay_number = relays.length + 1;
    onChange([...relays, { relay_number, scheduled_time: time, notes: '' }]);
    setTime('');
  };

  const removeRelay = (idx) => {
    const updated = relays
      .filter((_, i) => i !== idx)
      .map((r, i) => ({ ...r, relay_number: i + 1 }));
    onChange(updated);
  };

  const updateTime = (idx, val) => {
    const updated = relays.map((r, i) => i === idx ? { ...r, scheduled_time: val } : r);
    onChange(updated);
  };

  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6 space-y-5">
        <h2 className="font-display font-semibold text-lg">Hapi 3 – Ndërrimet</h2>
        <p className="text-sm text-muted-foreground">
          Çdo ndërrim ka maksimum <strong>{MAX_LANES} pozicione</strong>. Brenda të njëjtit ndërrim mund të ketë garues nga klube, gjini dhe kategori të ndryshme.
        </p>

        <div className="flex gap-3 items-end">
          <div>
            <Label>Ora e planifikuar (opsionale)</Label>
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-36" />
          </div>
          <Button type="button" onClick={addRelay}>
            <Plus className="h-4 w-4 mr-2" />Shto ndërrim
          </Button>
        </div>

        {relays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">Nuk ka ndërrime. Shtoni të paktën një ndërrim.</p>
        ) : (
          <div className="space-y-2">
            {relays.map((r, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
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
                  onChange={e => updateTime(idx, e.target.value)}
                  className="w-28 h-7 text-xs"
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRelay(idx)}>
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