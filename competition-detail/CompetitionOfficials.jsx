import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_ROLES, REQUIRED_OFFICIAL_ROLES } from '@/lib/constants';

export default function CompetitionOfficials({ competitionId, officials }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('first_name', 500),
  });

  const memberOptions = members.filter(m => m.status === 'Aktiv' && !m.is_deleted);
  const assignedIds = officials.map(o => o.member_id);
  const missingRoles = REQUIRED_OFFICIAL_ROLES.filter(r => !officials.find(o => o.role === r));
  const isComplete = missingRoles.length === 0;

  const setOfficial = async (role, memberId) => {
    setSaving(true);
    const existing = officials.find(o => o.role === role);
    const member = members.find(m => m.id === memberId);

    if (!memberId) {
      if (existing) await base44.entities.CompetitionOfficial.delete(existing.id);
      setSaving(false);
      queryClient.invalidateQueries({ queryKey: ['competition-officials', competitionId] });
      return;
    }

    const alreadyAssigned = officials.find(o => o.member_id === memberId && o.role !== role);
    if (alreadyAssigned) {
      alert(`Ky person është caktuar tashmë si "${alreadyAssigned.role}".`);
      setSaving(false);
      return;
    }

    const data = {
      competition_id: competitionId,
      role,
      member_id: memberId,
      member_name: member ? `${member.first_name} ${member.last_name}` : '',
    };

    if (existing) {
      await base44.entities.CompetitionOfficial.update(existing.id, data);
    } else {
      await base44.entities.CompetitionOfficial.create(data);
    }
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['competition-officials', competitionId] });
  };

  const roleGroups = [
    { title: 'A. Menaxhimi dhe Refereimi', roles: ['Kryesuesi i garës','Referi kryesor','Referi ndihmës','Referi për numrim (serike)'] },
    { title: 'B. Komisioni i Ankesave', roles: ['Komisioni i Ankesave - Anëtari 1','Komisioni i Ankesave - Anëtari 2','Komisioni i Ankesave - Anëtari 3'] },
  ];

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <UserCheck className="h-4 w-4" />Organet e Garës
          {isComplete
            ? <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Komplet</Badge>
            : <Badge className="bg-yellow-100 text-yellow-800 gap-1"><AlertTriangle className="h-3.5 w-3.5" />{missingRoles.length} mungojnë</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {roleGroups.map(group => (
          <div key={group.title} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">{group.title}</h3>
            {group.roles.map(role => {
              const current = officials.find(o => o.role === role);
              return (
                <div key={role} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{role}</p>
                  </div>
                  <div className="w-64">
                    <Select
                      value={current?.member_id || ''}
                      onValueChange={v => setOfficial(role, v)}
                      disabled={saving}
                    >
                      <SelectTrigger className={current ? 'border-green-400' : ''}>
                        <SelectValue placeholder="Zgjidh person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>— Pa caktuar —</SelectItem>
                        {memberOptions
                          .filter(m => !assignedIds.includes(m.id) || current?.member_id === m.id)
                          .map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.first_name} {m.last_name}
                            </SelectItem>
                          ))}
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