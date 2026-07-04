import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_ROLES, REQUIRED_OFFICIAL_ROLES } from '@/lib/constants';

export default function WizardStep4Officials({ officials, onChange }) {
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
  });

  const memberOptions = members
    .filter(m => m.status === 'Aktiv' && !m.is_deleted)
    .map(m => ({ id: m.id, name: `${m.first_name} ${m.last_name}` }));

  const getOfficial = (role) => officials.find(o => o.role === role);

  const setOfficial = (role, memberId) => {
    const member = members.find(m => m.id === memberId);
    const filtered = officials.filter(o => o.role !== role);
    if (!memberId) {
      onChange(filtered);
      return;
    }
    // Kontrollo: personi nuk mund të caktohet në dy funksione
    const alreadyAssigned = officials.find(o => o.member_id === memberId && o.role !== role);
    if (alreadyAssigned) {
      alert(`${member?.first_name} ${member?.last_name} është caktuar tashmë si "${alreadyAssigned.role}". Një person nuk mund të ketë dy funksione.`);
      return;
    }
    onChange([...filtered, {
      role,
      member_id: memberId,
      member_name: member ? `${member.first_name} ${member.last_name}` : '',
    }]);
  };

  const completedRoles = REQUIRED_OFFICIAL_ROLES.filter(r => getOfficial(r));
  const isComplete = completedRoles.length === REQUIRED_OFFICIAL_ROLES.length;
  const assignedIds = officials.map(o => o.member_id);

  const roleGroups = [
    {
      title: 'A. Menaxhimi dhe Refereimi',
      roles: [
        'Kryesuesi i garës',
        'Referi kryesor',
        'Referi ndihmës',
        'Referi për numrim (serike)',
      ],
    },
    {
      title: 'B. Komisioni i Ankesave',
      roles: [
        'Komisioni i Ankesave - Anëtari 1',
        'Komisioni i Ankesave - Anëtari 2',
        'Komisioni i Ankesave - Anëtari 3',
      ],
    },
  ];

  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg">Hapi 4 – Organet e Garës ⚠️</h2>
          {isComplete ? (
            <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Komplet</Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 gap-1"><AlertTriangle className="h-3.5 w-3.5" />{completedRoles.length}/{REQUIRED_OFFICIAL_ROLES.length} caktuar</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Caktoni organet zyrtare të garës. Një person nuk mund të caktohet në dy funksione. PDF-ja zyrtare kërkon të gjitha 7 funksionet.
        </p>

        {roleGroups.map(group => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">{group.title}</h3>
            {group.roles.map(role => {
              const current = getOfficial(role);
              return (
                <div key={role} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{role}</p>
                  </div>
                  <div className="w-64 shrink-0">
                    <Select
                      value={current?.member_id || ''}
                      onValueChange={v => setOfficial(role, v)}
                    >
                      <SelectTrigger className={current ? 'border-green-400' : ''}>
                        <SelectValue placeholder="Zgjidh person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>— Pa caktuar —</SelectItem>
                        {memberOptions
                          .filter(m => !assignedIds.includes(m.id) || current?.member_id === m.id)
                          .map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}