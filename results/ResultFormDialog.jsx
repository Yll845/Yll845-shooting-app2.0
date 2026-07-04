import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function ResultFormDialog({ open, onOpenChange, competition, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: shooters = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.filter({ is_shooter: true }, 'last_name', 200),
  });

  useEffect(() => {
    if (open) {
      setForm({
        competition_id: competition?.id,
        competition_name: competition?.name,
        discipline: competition?.discipline,
        category: competition?.category,
      });
    }
  }, [open, competition]);

  const handleShooterChange = (shooterId) => {
    const shooter = shooters.find(s => s.id === shooterId);
    setForm({
      ...form,
      shooter_id: shooterId,
      shooter_name: shooter ? `${shooter.first_name} ${shooter.last_name}` : '',
      club_name: shooter?.club_name || '',
    });
  };

  const handleSeriesChange = (field, value) => {
    const numVal = parseFloat(value) || 0;
    const newForm = { ...form, [field]: numVal };
    // Auto-calculate total
    const total = (newForm.series_1 || 0) + (newForm.series_2 || 0) + (newForm.series_3 || 0) +
                  (newForm.series_4 || 0) + (newForm.series_5 || 0) + (newForm.series_6 || 0);
    newForm.total_score = total;
    setForm(newForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Result.create(form);
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Shto Rezultat - {competition?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Shenjëtari *</Label>
              <Select value={form.shooter_id || ''} onValueChange={handleShooterChange}>
                <SelectTrigger><SelectValue placeholder="Zgjidh shenjëtarin" /></SelectTrigger>
                <SelectContent>
                  {shooters.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} {s.club_name ? `(${s.club_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Seritë (pikët)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[1,2,3,4,5,6].map(i => (
                <div key={i}>
                  <Label className="text-xs">Seria {i}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="109"
                    value={form[`series_${i}`] || ''}
                    onChange={e => handleSeriesChange(`series_${i}`, e.target.value)}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <Label className="text-xs">Total</Label>
                <p className="text-2xl font-bold">{form.total_score || 0}</p>
              </div>
              <div>
                <Label className="text-xs">X-at (qendrat)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.inner_tens || ''}
                  onChange={e => setForm({...form, inner_tens: parseInt(e.target.value) || 0})}
                  className="w-20 text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Medalja</Label>
              <Select value={form.medal || ''} onValueChange={v => setForm({...form, medal: v})}>
                <SelectTrigger><SelectValue placeholder="Pa medalje" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Pa medalje</SelectItem>
                  <SelectItem value="Ar">🥇 Ar</SelectItem>
                  <SelectItem value="Argjend">🥈 Argjend</SelectItem>
                  <SelectItem value="Bronz">🥉 Bronz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pikët finale</Label>
              <Input type="number" step="0.1" value={form.final_score || ''} onChange={e => setForm({...form, final_score: parseFloat(e.target.value) || 0})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" disabled={saving || !form.shooter_id}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ruaj rezultatin
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}