import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Search, Filter, Trash2, Pencil, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ShooterFormDialog from '@/components/shooters/ShooterFormDialog';
import { Link } from 'react-router-dom';

const statusColors = {
  'Aktiv': 'bg-green-100 text-green-800',
  'Joaktiv': 'bg-gray-100 text-gray-600',
  'I pezulluar': 'bg-red-100 text-red-700',
  'I transferuar': 'bg-blue-100 text-blue-700',
};

export default function Shooters() {
  const [formOpen, setFormOpen] = useState(false);
  const [editShooter, setEditShooter] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterClub, setFilterClub] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: shooters = [], isLoading } = useQuery({
    queryKey: ['shooters'],
    queryFn: () => base44.entities.Shooter.list('-created_date', 200),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  const filtered = shooters.filter(s => {
    const matchSearch = search === '' || 
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.license_number?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || s.category === filterCategory;
    const matchClub = filterClub === 'all' || s.club_id === filterClub;
    return matchSearch && matchCategory && matchClub;
  });

  const handleDelete = async () => {
    await base44.entities.Shooter.delete(deleteId);
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['shooters'] });
  };

  return (
    <div>
      <PageHeader
        title="Gjuajtësit"
        subtitle={`${shooters.length} shenjëtarë të regjistruar`}
        actionLabel="Shto Shenjëtar"
        onAction={() => { setEditShooter(null); setFormOpen(true); }}
      />

      {/* Filters */}
      <Card className="p-4 mb-6 border-none shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kërko me emër ose licencë..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />

          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha</SelectItem>
              {['Junior', 'Senior', 'Veteran', 'U18', 'U21'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterClub} onValueChange={setFilterClub}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Klubi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha klubet</SelectItem>
              {clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="Nuk ka shenjëtarë"
          description="Filloni duke shtuar shenjëtarin e parë"
          actionLabel="Shto Shenjëtar"
          onAction={() => { setEditShooter(null); setFormOpen(true); }}
        />
      ) : (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Emri</TableHead>
                  <TableHead className="hidden md:table-cell">Klubi</TableHead>
                  <TableHead className="hidden sm:table-cell">Kategoria</TableHead>
                  <TableHead className="hidden lg:table-cell">Licenca</TableHead>
                  <TableHead>Statusi</TableHead>
                  <TableHead className="text-right">Veprime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{s.first_name?.[0]}{s.last_name?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{s.first_name} {s.last_name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{s.club_name || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{s.club_name || '—'}</TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs">{s.category}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{s.license_number || '—'}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusColors[s.status] || 'bg-gray-100'}`}>{s.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/shooters/${s.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditShooter(s); setFormOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(s.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ShooterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        shooter={editShooter}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['shooters'] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi shenjëtarin?</AlertDialogTitle>
            <AlertDialogDescription>Ky veprim nuk mund të kthehet mbrapsht.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}