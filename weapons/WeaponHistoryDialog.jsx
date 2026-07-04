import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function WeaponHistoryDialog({ weapon, onClose }) {
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['weapon-history', weapon.id],
    queryFn: () => base44.entities.WeaponAssignment.filter({ weapon_id: weapon.id }, '-start_date', 100),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Historia e armës</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="font-medium">{weapon.brand} {weapon.model}</p>
            <p className="text-muted-foreground text-xs">SN: {weapon.serial_number}</p>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Duke ngarkuar...</p>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Asnjë caktim i gjetur.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{a.member_name}</p>
                    <p className="text-xs text-muted-foreground">{a.club_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{a.start_date}{a.end_date ? ` → ${a.end_date}` : ' → (aktuale)'}</p>
                  </div>
                  <Badge className={a.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}>
                    {a.is_active ? 'Aktive' : 'Mbyllur'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}