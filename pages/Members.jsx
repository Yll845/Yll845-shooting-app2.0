import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Search, Trash2, Pencil, Eye, Target, Shield, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import MemberFormDialog from '@/components/members/MemberFormDialog';
import ImportExcelDialog from '@/components/shared/ImportExcelDialog';
import { Link } from 'react-router-dom';

const MEMBER_COLUMN_MAP = {
  'Emri': 'first_name', 'Mbiemri': 'last_name', 'Numri Personal': 'personal_number',
  'Data e Lindjes (DD/MM/YYYY)': 'date_of_birth', 'Gjinia (Mashkull/Femër)': 'gender',
  'Qyteti': 'city', 'Adresa': 'address', 'Telefoni': 'phone', 'Email': 'email',
  'Emri i Klubit': 'club_name', 'Është Shenjëtar (true/false)': 'is_shooter',
  'Kategoria (Pionier/Junior/Senior)': 'shooter_category', 'Disiplina': 'discipline',
  'Nr. Licencës': 'license_number', 'Licenca Deri Më (DD/MM/YYYY)': 'license_valid_until',
  'ISSF ID': 'issf_id', 'I Mitur (true/false)': 'is_minor',
  'Emri i Kujdestarit': 'guardian_name', 'Telefoni i Kujdestarit': 'guardian_phone',
  'Pozitat në Klub': 'club_roles', 'Pozitat në Federatë': 'federation_roles',
  'Statusi (Aktiv/Joaktiv/I pezulluar/I transferuar)': 'status',
  'Data e Regjistrimit (DD/MM/YYYY)': 'registration_date',
  'Emri i Bankës': 'bank_name', 'IBAN': 'iban', 'SWIFT': 'swift',
  'Shënime': 'notes',
};

// Konverto DD/MM/YYYY → YYYY-MM-DD për databazën
function parseDateField(val) {
  if (!val) return val;
  const str = String(val).trim();
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return str; // fallback nëse është tashmë në format tjetër
}

const DATE_FIELDS = ['date_of_birth', 'license_valid_until', 'registration_date'];

const statusColors = {
  'Aktiv': 'bg-green-100 text-green-800',
  'Joaktiv': 'bg-gray-100 text-gray-600',
  'I pezulluar': 'bg-red-100 text-red-700',
  'I transferuar': 'bg-blue-100 text-blue-700',
};

export default function Members() {
  const [formOpen, setFormOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterClub, setFilterClub] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('-created_date', 500),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  const filtered = members.filter(m => {
    const matchSearch = search === '' ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      m.license_number?.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      filterRole === 'all' ||
      (filterRole === 'shooter' && m.is_shooter) ||
      (filterRole === 'club_official' && m.club_roles?.length > 0) ||
      (filterRole === 'fed_official' && m.federation_roles?.length > 0);
    const matchClub = filterClub === 'all' || m.club_id === filterClub;
    return matchSearch && matchRole && matchClub;
  });

  const handleDelete = async () => {
    await base44.entities.Member.delete(deleteId);
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['members'] });
  };

  const getRoleBadges = (member) => {
    const badges = [];
    if (member.is_shooter) badges.push({ label: 'Shenjëtar', color: 'bg-primary/10 text-primary' });
    if (member.club_roles?.length > 0) badges.push({ label: 'Zyrtar Klubi', color: 'bg-blue-100 text-blue-800' });
    if (member.federation_roles?.length > 0) badges.push({ label: 'Zyrtar Federatë', color: 'bg-purple-100 text-purple-800' });
    return badges;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Anëtarët</h1>
          <p className="text-muted-foreground mt-1">{members.length} anëtarë të regjistruar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />Importo nga Excel
          </Button>
          <Button onClick={() => { setEditMember(null); setFormOpen(true); }}>
            <Users className="h-4 w-4 mr-2" />Shto Anëtar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6 border-none shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kërko me emër ose licencë..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Roli" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha rolet</SelectItem>
              <SelectItem value="shooter">Shenjëtarë</SelectItem>
              <SelectItem value="club_official">Zyrtarë Klubi</SelectItem>
              <SelectItem value="fed_official">Zyrtarë Federatë</SelectItem>
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
          title="Nuk ka anëtarë"
          description="Filloni duke shtuar anëtarin e parë"
          actionLabel="Shto Anëtar"
          onAction={() => { setEditMember(null); setFormOpen(true); }}
        />
      ) : (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Emri</TableHead>
                  <TableHead className="hidden md:table-cell">Klubi</TableHead>
                  <TableHead>Rolet</TableHead>
                  <TableHead className="hidden lg:table-cell">Pozitat zyrtare</TableHead>
                  <TableHead className="hidden xl:table-cell">Data e Regj.</TableHead>
                  <TableHead>Statusi</TableHead>
                  <TableHead className="text-right">Veprime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{m.first_name?.[0]}{m.last_name?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{m.club_name || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{m.club_name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getRoleBadges(m).map(b => (
                          <Badge key={b.label} className={`text-[10px] ${b.color}`}>{b.label}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(m.club_roles || []).map(r => <Badge key={r} variant="outline" className="text-[10px]">K: {r}</Badge>)}
                        {(m.federation_roles || []).map(r => <Badge key={r} variant="outline" className="text-[10px]">F: {r}</Badge>)}
                        {!m.club_roles?.length && !m.federation_roles?.length && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                      {m.registration_date ? m.registration_date.split('-').reverse().join('/') : '—'}
                    </TableCell>
                    <TableCell><Badge className={`text-[10px] ${statusColors[m.status] || 'bg-gray-100'}`}>{m.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/members/${m.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditMember(m); setFormOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(m.id)}>
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

      <ImportExcelDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importo Anëtarë nga Excel"
        columnMap={MEMBER_COLUMN_MAP}
        onImport={async (row) => {
          if (row.club_roles && typeof row.club_roles === 'string') row.club_roles = row.club_roles.split(',').map(s => s.trim());
          if (row.federation_roles && typeof row.federation_roles === 'string') row.federation_roles = row.federation_roles.split(',').map(s => s.trim());
          if (row.discipline && typeof row.discipline === 'string') row.discipline = row.discipline.split(',').map(s => s.trim());
          // Konverto datat nga DD/MM/YYYY → YYYY-MM-DD
          DATE_FIELDS.forEach(f => { if (row[f]) row[f] = parseDateField(row[f]); });

          // Kontrollo nëse anëtari ekziston (bazuar në numrin personal)
          const existing = row.personal_number
            ? members.find(m => m.personal_number === row.personal_number)
            : null;

          if (existing) {
            // Plotëso vetëm fushat që mungojnë, por registration_date gjithmonë zëvendësohet
            const updates = {};
            Object.entries(row).forEach(([key, val]) => {
              if (key === 'registration_date') {
                // Gjithmonë zëvendëso datën e regjistrimit nga Excel
                if (val) updates[key] = val;
              } else if (!existing[key] || existing[key] === '' ||
                (Array.isArray(existing[key]) && existing[key].length === 0)) {
                // Plotëso vetëm fushat bosh/mungojnë
                updates[key] = val;
              }
            });
            if (Object.keys(updates).length > 0) {
              await base44.entities.Member.update(existing.id, updates);
            }
          } else {
            await base44.entities.Member.create(row);
          }
          queryClient.invalidateQueries({ queryKey: ['members'] });
        }}
      />

      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editMember}
        allMembers={members}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['members'] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi anëtarin?</AlertDialogTitle>
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