import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Medal, Search, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Link } from 'react-router-dom';

const medalColors = { 'Ar': 'text-yellow-500', 'Argjend': 'text-gray-400', 'Bronz': 'text-amber-700' };

export default function Results() {
  const urlParams = new URLSearchParams(window.location.search);
  const [filterComp, setFilterComp] = useState(urlParams.get('competition') || 'all');
  const [search, setSearch] = useState('');

  const { data: results = [] } = useQuery({
    queryKey: ['results'],
    queryFn: () => base44.entities.Result.list('-total_score', 500),
  });

  const { data: competitions = [] } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => base44.entities.Competition.list('-date_start', 100),
  });

  const { data: weaponAssignments = [] } = useQuery({
    queryKey: ['weapon-assignments-active'],
    queryFn: () => base44.entities.WeaponAssignment.filter({ is_active: true }, 'member_name', 200),
  });

  // Map member_id -> weapon_info (arma aktive)
  const weaponMap = {};
  weaponAssignments.forEach(wa => { weaponMap[wa.member_id] = wa.weapon_info || ''; });

  const filtered = results.filter(r => {
    const matchComp = filterComp === 'all' || r.competition_id === filterComp;
    const matchSearch = search === '' || r.member_name?.toLowerCase().includes(search.toLowerCase()) || r.club_name?.toLowerCase().includes(search.toLowerCase());
    return matchComp && matchSearch;
  });

  // Group by competition + event (discipline/gender/age_category)
  const grouped = {};
  filtered.forEach(r => {
    const key = `${r.competition_id}__${r.event_id || r.discipline}`;
    if (!grouped[key]) grouped[key] = {
      competition_id: r.competition_id,
      name: r.competition_name,
      discipline: r.discipline,
      gender: r.gender,
      age_category: r.age_category,
      results: []
    };
    grouped[key].results.push(r);
  });

  // Sort each group by total_score desc
  Object.values(grouped).forEach(g => {
    g.results.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
  });

  return (
    <div>
      <PageHeader title="Rezultatet" subtitle="Rezultatet e të gjitha garave" />

      <Card className="p-4 mb-6 border-none shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kërko shenjëtarin ose klubin..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterComp} onValueChange={setFilterComp}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Gara" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha garat</SelectItem>
              {competitions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={Medal}
          title="Nuk ka rezultate"
          description="Rezultatet do të shfaqen pasi të shtohen në gara"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([compId, group]) => (
            <Card key={compId} className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    {group.name}
                  </CardTitle>
                  <Link to={`/competitions/${group.competition_id}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs">Shiko garën →</Badge>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {group.discipline && <Badge variant="secondary" className="text-xs">{group.discipline}</Badge>}
                  {group.gender && <Badge variant="outline" className="text-xs">{group.gender}</Badge>}
                  {group.age_category && <Badge variant="outline" className="text-xs">{group.age_category}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Shenjëtari</TableHead>
                        <TableHead className="hidden md:table-cell">Klubi</TableHead>
                        <TableHead className="hidden lg:table-cell">Arma</TableHead>
                        <TableHead className="text-center font-bold">Total</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">X</TableHead>
                        <TableHead className="text-center">Medalja</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.results.map((r, idx) => (
                        <TableRow key={r.id} className={idx < 3 ? 'bg-accent/5' : ''}>
                          <TableCell className="font-bold">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{r.member_name || '—'}</TableCell>
                           <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{r.club_name || '—'}</TableCell>
                           <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{weaponMap[r.member_id] || '—'}</TableCell>
                           <TableCell className="text-center font-bold text-lg">{r.total_score ?? '—'}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell text-sm">{r.inner_tens ?? '—'}</TableCell>
                          <TableCell className="text-center">
                            {r.medal && <span className={`font-bold ${medalColors[r.medal] || ''}`}>🏅 {r.medal}</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}