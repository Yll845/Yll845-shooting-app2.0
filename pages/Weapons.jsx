import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Target, UserCheck, Upload } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import WeaponFormDialog from '@/components/weapons/WeaponFormDialog';
import WeaponAssignDialog from '@/components/weapons/WeaponAssignDialog';
import WeaponHistoryDialog from '@/components/weapons/WeaponHistoryDialog';
import ImportExcelDialog from '@/components/shared/ImportExcelDialog';

const WEAPON_COLUMN_MAP = {
  'Kodi i Inventarit': 'inventory_code', 'Lloji i Armës': 'weapon_type',
  'Disiplina': 'discipline', 'Marka': 'brand', 'Modeli': 'model',
  'Kalibri': 'caliber', 'Numri Serik': 'serial_number',
  'Pronësia (Klub/Federatë/Personale)': 'ownership_type',
  'Emri i Klubit Pronar': 'owner_club_name', 'Emri i Personit Pronar': 'owner_member_name',
  'Statusi (Aktive/Joaktive/E dëmtuar/E hequr nga përdorimi)': 'status', 'Shënime': 'notes',
};

export default function Weapons() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editWeapon, setEditWeapon] = useState(null);
  const [assignWeapon, setAssignWeapon] = useState(null);
  const [historyWeapon, setHistoryWeapon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: weapons = [] } = useQuery({
    queryKey: ['weapons'],
    queryFn: () => base44.entities.Weapon.filter({ is_deleted: false }, '-created_date', 200),
  });

  const filtered = weapons.filter(w => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${w.brand} ${w.model} ${w.serial_number} ${w.inventory_code}`.toLowerCase().includes(q);
    const matchType = !filterType || w.weapon_type === filterType;
    const matchStatus = !filterStatus || w.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleDelete = async () => {
    await base44.entities.Weapon.update(deleteId, { is_deleted: true });
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['weapons'] });
  };

  const weaponTypes = [...new Set(weapons.map(w => w.weapon_type).filter(Boolean))];

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Armët</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} armë të regjistruara</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />Importo nga Excel
          </Button>
          <Button onClick={() => { setEditWeapon(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Shto Armë
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Kërko sipas markës, modelit, numrit serik..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Të gjitha llojet" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Të gjitha llojet</SelectItem>
            {weaponTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Të gjitha statuset" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Të gjitha</SelectItem>
            {['Aktive','Joaktive','E dëmtuar','E hequr nga përdorimi'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nuk ka armë të regjistruara</p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4 mr-2" />Shto armë</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(w => (
            <Card key={w.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge status={w.status} />
                  <Badge variant="outline" className="text-[10px]">{w.weapon_type}</Badge>
                </div>
                <h3 className="font-semibold">{w.brand} {w.model}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">SN: {w.serial_number}</p>
                {w.inventory_code && <p className="text-xs text-muted-foreground">Kodi: {w.inventory_code}</p>}
                {w.discipline && <p className="text-xs text-muted-foreground mt-1">🎯 {w.discipline}</p>}
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <span>{w.ownership_type}</span>
                  {w.owner_club_name && <span>· {w.owner_club_name}</span>}
                  {w.owner_member_name && <span>· {w.owner_member_name}</span>}
                </div>

                <div className="flex gap-1 mt-4 pt-3 border-t flex-wrap">
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => setAssignWeapon(w)}>
                    <UserCheck className="h-3 w-3 mr-1" />Cakto
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={() => setHistoryWeapon(w)}>
                    Historia
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditWeapon(w); setFormOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteId(w.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ImportExcelDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Importo Armë nga Excel"
        columnMap={WEAPON_COLUMN_MAP}
        onImport={async (row) => {
          await base44.entities.Weapon.create(row);
          queryClient.invalidateQueries({ queryKey: ['weapons'] });
        }}
      />

      <WeaponFormDialog open={formOpen} onOpenChange={setFormOpen} weapon={editWeapon}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['weapons'] })} />
      {assignWeapon && <WeaponAssignDialog weapon={assignWeapon} onClose={() => setAssignWeapon(null)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['weapons'] })} />}
      {historyWeapon && <WeaponHistoryDialog weapon={historyWeapon} onClose={() => setHistoryWeapon(null)} />}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hiq armën?</AlertDialogTitle>
            <AlertDialogDescription>Arma do të arkivohet (soft delete).</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Hiq</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}