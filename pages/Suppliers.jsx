import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Pencil, Trash2, Truck, AlertCircle } from 'lucide-react';

const EMPTY_FORM = {
  name: '', contact_person: '', unique_id: '', address: '', phone: '', email: '',
  bank_name: '', iban: '', swift: '', notes: '', is_active: true
};

export default function Suppliers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBlocked, setDeleteBlocked] = useState(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Supplier.update(editing.id, data)
      : base44.entities.Supplier.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setFormOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Supplier.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setDeleteTarget(null); },
  });

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...EMPTY_FORM, ...s }); setFormOpen(true); };
  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = () => saveMutation.mutate(form);

  const handleDeleteClick = async (s) => {
    const linked = await base44.entities.FinancialTransaction.filter({ supplier_id: s.id }, null, 1);
    if (linked.length > 0) {
      setDeleteBlocked(s);
    } else {
      setDeleteTarget(s);
    }
  };

  const filtered = suppliers.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
    s.unique_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Furnitorët</h1>
          <p className="text-sm text-muted-foreground">Menaxho listën e furnitorëve</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Shto Furnitor</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Kërko furnitor..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Truck className="h-10 w-10 opacity-40" />
          <p className="text-sm">Nuk u gjetën furnitorë.</p>
          <Button variant="outline" size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Shto Furnitor</Button>
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Emërtimi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Personi Kontaktues</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">NUI/NF</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Telefoni</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statusi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.contact_person || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.unique_id || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.is_active !== false ? 'default' : 'secondary'}>
                      {s.is_active !== false ? 'Aktiv' : 'Joaktiv'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Ndrysho Furnitorin' : 'Shto Furnitor të Ri'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Emërtimi i plotë *</Label>
              <Input value={form.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Personi kontaktues</Label>
              <Input value={form.contact_person} onChange={e => handleChange('contact_person', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>NUI / Numri Fiskal</Label>
              <Input value={form.unique_id} onChange={e => handleChange('unique_id', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Telefoni</Label>
              <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={form.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Adresa</Label>
              <Input value={form.address} onChange={e => handleChange('address', e.target.value)} />
            </div>
            <div className="col-span-2 border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Të dhënat bankare</p>
            </div>
            <div className="space-y-1">
              <Label>Emri i Bankës</Label>
              <Input value={form.bank_name} onChange={e => handleChange('bank_name', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>SWIFT</Label>
              <Input value={form.swift} onChange={e => handleChange('swift', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>IBAN</Label>
              <Input value={form.iban} onChange={e => handleChange('iban', e.target.value)} placeholder="p.sh. XK05 1234 5678 9012 3456" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Shënime</Label>
              <Textarea rows={2} value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Anulo</Button>
            <Button onClick={handleSubmit} disabled={!form.name || saveMutation.isPending}>
              {saveMutation.isPending ? 'Duke ruajtur...' : 'Ruaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi Furnitorin</AlertDialogTitle>
            <AlertDialogDescription>
              A je i sigurt që dëshiron të fshish <strong>{deleteTarget?.name}</strong>? Ky veprim nuk mund të kthehet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}>
              Fshi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Blocked */}
      <AlertDialog open={!!deleteBlocked} onOpenChange={o => !o && setDeleteBlocked(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Fshirja nuk lejohet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Për furnitorin <strong>{deleteBlocked?.name}</strong>, tashmë ka transaksione të regjistruara dhe ky furnitor nuk lejohet të fshihet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mbyll</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}