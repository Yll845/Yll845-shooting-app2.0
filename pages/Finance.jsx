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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle, Landmark, CheckCircle2, FileDown, X } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const TYPES = ['Faturë Hyrëse', 'Faturë Dalëse', 'Pagesë Hyrëse', 'Pagesë Dalëse'];

// Normalizon stringjet për krahasim të sigurt
const norm = (s) => (s || '').normalize('NFC').trim();
const STATUSES = ['Paguar', 'Papaguar', 'Pjesërisht paguar'];

const EMPTY_FORM = {
  type: '', date_received: '', invoice_number: '', description: '',
  amount: '', payment_date: '',
  federation_account_id: '', federation_account_name: '',
  supplier_id: '', supplier_name: '',
  revenue_source_id: '', revenue_source_name: '',
  club_id: '', club_name: '', member_id: '', member_name: '',
  status: 'Papaguar', notes: ''
};

const typeConfig = {
  'Faturë Hyrëse':  { icon: ArrowDownCircle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  'Faturë Dalëse':  { icon: ArrowUpCircle,   color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  'Pagesë Hyrëse':  { icon: TrendingUp,      color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  'Pagesë Dalëse':  { icon: TrendingDown,    color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
};

const statusVariant = { 'Paguar': 'default', 'Papaguar': 'destructive', 'Pjesërisht paguar': 'secondary' };

function formatCurrency(v) {
  return new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR' }).format(v || 0);
}
function fmtDate(d) { try { return d ? format(new Date(d), 'dd/MM/yyyy') : '—'; } catch { return '—'; } }

const TAB_FILTERS = [
  { key: 'all', label: 'Të gjitha' },
  { key: 'Faturë Hyrëse', label: 'Fatura Hyrëse' },
  { key: 'Faturë Dalëse', label: 'Fatura Dalëse' },
  { key: 'Pagesë Hyrëse', label: 'Pagesa Hyrëse' },
  { key: 'Pagesë Dalëse', label: 'Pagesa Dalëse' },
];

export default function Finance() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterFundSource, setFilterFundSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ payment_date: '', federation_account_id: '', federation_account_name: '', revenue_source_id: '', revenue_source_name: '' });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['finance'],
    queryFn: () => base44.entities.FinancialTransaction.list('-date_received', 500),
  });
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.filter({ is_active: true }, 'name', 200),
  });
  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list('name', 200),
  });
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.filter({ is_deleted: false }, 'first_name', 300),
  });
  const { data: fedAccounts = [] } = useQuery({
    queryKey: ['fedAccounts'],
    queryFn: () => base44.entities.FederationBankAccount.filter({ is_active: true }, 'name', 50),
  });
  const { data: fundSources = [] } = useQuery({
    queryKey: ['fundSources'],
    queryFn: () => base44.entities.FundSource.filter({ is_active: true }, 'name', 200),
  });

  // Logjika e balancave:
  // Vetëm pagesat ndikojnë në balanca — faturat janë dokumente pritëse dhe nuk ndikojnë.
  // Pagesë Hyrëse = para hyjnë (+)
  // Pagesë Dalëse = para dalin (-)
  // Faturë Hyrëse / Dalëse = nuk ndikon (0)
  const getBalanceDelta = (type, amount) => {
    const t = norm(type);
    if (t === norm('Pagesë Hyrëse')) return amount;
    if (t === norm('Pagesë Dalëse')) return -amount;
    return 0; // Faturat nuk ndikojnë drejtpërdrejt
  };

  const updateAccountBalance = async (accountId, delta) => {
    if (!accountId || !delta) return;
    // Lexo drejtpërdrejt nga lista e cached dhe gjej me id
    const all = await base44.entities.FederationBankAccount.list('name', 100);
    const acc = all.find(a => a.id === accountId);
    if (!acc) return;
    const current = acc.balance || 0;
    await base44.entities.FederationBankAccount.update(accountId, { balance: parseFloat((current + delta).toFixed(2)) });
  };

  const updateFundSourceBalance = async (sourceId, delta) => {
    if (!sourceId || !delta) return;
    const all = await base44.entities.FundSource.list('name', 200);
    const src = all.find(s => s.id === sourceId);
    if (!src) return;
    const current = src.balance || 0;
    await base44.entities.FundSource.update(sourceId, { balance: parseFloat((current + delta).toFixed(2)) });
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) {
        // Undo old effect, apply new effect
        const oldDelta = getBalanceDelta(editing.type, editing.amount || 0);
        const newDelta = getBalanceDelta(data.type, data.amount || 0);
        const accountChanged = editing.federation_account_id !== data.federation_account_id;

        const fundSourceChanged = editing.revenue_source_id !== data.revenue_source_id;

        if (accountChanged) {
          await updateAccountBalance(editing.federation_account_id, -oldDelta);
          await updateAccountBalance(data.federation_account_id, newDelta);
        } else {
          await updateAccountBalance(data.federation_account_id, newDelta - oldDelta);
        }

        if (fundSourceChanged) {
          await updateFundSourceBalance(editing.revenue_source_id, -oldDelta);
          await updateFundSourceBalance(data.revenue_source_id, newDelta);
        } else {
          await updateFundSourceBalance(data.revenue_source_id, newDelta - oldDelta);
        }

        return base44.entities.FinancialTransaction.update(editing.id, data);
      } else {
        const delta = getBalanceDelta(data.type, data.amount || 0);
        await updateAccountBalance(data.federation_account_id, delta);
        await updateFundSourceBalance(data.revenue_source_id, delta);
        return base44.entities.FinancialTransaction.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['fedAccounts'] });
      qc.invalidateQueries({ queryKey: ['fundSources'] });
      setFormOpen(false);
    },
  });

  // Krijon pagesën e lidhur dhe shënon faturën si Paguar
  const payMutation = useMutation({
    mutationFn: async ({ invoice, payData }) => {
      // 1. Krijo transaksionin e pagesës
      // Faturë Dalëse (federata lëshon) → paguhet nga klienti → Pagesë Hyrëse (+)
      // Faturë Hyrëse (federata pranon) → federata paguan → Pagesë Dalëse (-)
      const paymentType = norm(invoice.type) === norm('Faturë Dalëse') ? 'Pagesë Hyrëse' : 'Pagesë Dalëse';
      const paymentRecord = {
        type: paymentType,
        date_received: payData.payment_date,
        payment_date: payData.payment_date,
        invoice_number: invoice.invoice_number,
        description: `Pagesë për: ${invoice.description || invoice.invoice_number || ''}`,
        amount: invoice.amount,
        federation_account_id: payData.federation_account_id,
        federation_account_name: payData.federation_account_name,
        revenue_source_id: payData.revenue_source_id,
        revenue_source_name: payData.revenue_source_name,
        supplier_id: invoice.supplier_id,
        supplier_name: invoice.supplier_name,
        club_id: invoice.club_id,
        club_name: invoice.club_name,
        member_id: invoice.member_id,
        member_name: invoice.member_name,
        status: 'Paguar',
        notes: invoice.notes,
      };
      const delta = getBalanceDelta(paymentType, invoice.amount || 0);
      await updateAccountBalance(payData.federation_account_id, delta);
      await updateFundSourceBalance(payData.revenue_source_id, delta);
      await base44.entities.FinancialTransaction.create(paymentRecord);
      // 2. Shëno faturën origjinale si Paguar
      return base44.entities.FinancialTransaction.update(invoice.id, { status: 'Paguar', payment_date: payData.payment_date });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['fedAccounts'] });
      qc.invalidateQueries({ queryKey: ['fundSources'] });
      setPayTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (t) => {
      // Nëse është faturë, kontrollo nëse ekziston pagesa e lidhur
      const isInvoiceType = norm(t.type) === norm('Faturë Hyrëse') || norm(t.type) === norm('Faturë Dalëse');
      if (isInvoiceType && t.invoice_number) {
        const all = await base44.entities.FinancialTransaction.list('-date_received', 500);
        const linkedPayment = all.find(x =>
          x.invoice_number === t.invoice_number &&
          (norm(x.type) === norm('Pagesë Hyrëse') || norm(x.type) === norm('Pagesë Dalëse'))
        );
        if (linkedPayment) throw new Error('PAYMENT_EXISTS');
      }
      const delta = getBalanceDelta(t.type, t.amount || 0);
      await updateAccountBalance(t.federation_account_id, -delta);
      await updateFundSourceBalance(t.revenue_source_id, -delta);
      return base44.entities.FinancialTransaction.delete(t.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance'] });
      qc.invalidateQueries({ queryKey: ['fedAccounts'] });
      qc.invalidateQueries({ queryKey: ['fundSources'] });
      setDeleteTarget(null);
    },
  });

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...EMPTY_FORM, ...t }); setFormOpen(true); };
  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSupplierChange = (id) => {
    const s = suppliers.find(x => x.id === id);
    handleChange('supplier_id', id);
    handleChange('supplier_name', s?.name || '');
  };
  const handleFedAccountChange = (id) => {
    const a = fedAccounts.find(x => x.id === id);
    handleChange('federation_account_id', id === '__none__' ? '' : id);
    handleChange('federation_account_name', id === '__none__' ? '' : (a?.name || ''));
  };
  const handleRevenueSourceChange = (id) => {
    const s = fundSources.find(x => x.id === id);
    handleChange('revenue_source_id', id === '__none__' ? '' : id);
    handleChange('revenue_source_name', id === '__none__' ? '' : (s?.name || ''));
  };
  const handleClubChange = (id) => {
    if (id === '__none__') {
      handleChange('club_id', '');
      handleChange('club_name', '');
    } else if (id.startsWith('fs-')) {
      const realId = id.slice(3);
      const s = fundSources.find(x => x.id === realId);
      handleChange('club_id', id); // ruaj me prefix që ta dallojmë
      handleChange('club_name', s?.name || '');
    } else {
      const c = clubs.find(x => x.id === id);
      handleChange('club_id', id);
      handleChange('club_name', c?.name || '');
    }
  };
  const handleMemberChange = (id) => {
    const m = members.find(x => x.id === id);
    handleChange('member_id', id === '__none__' ? '' : id);
    handleChange('member_name', id === '__none__' ? '' : (m ? `${m.first_name} ${m.last_name}` : ''));
  };

  const handleSubmit = () => {
    const data = { ...form, amount: parseFloat(form.amount) || 0 };
    saveMutation.mutate(data);
  };

  const filtered = transactions.filter(t => {
    const matchTab = tab === 'all' || norm(t.type) === norm(tab);
    const matchSearch = !search ||
      t.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.club_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.member_name?.toLowerCase().includes(search.toLowerCase());
    const matchAccount = !filterAccount || t.federation_account_id === filterAccount;
    const matchFundSource = !filterFundSource || t.revenue_source_id === filterFundSource;
    const matchDateFrom = !dateFrom || (t.date_received && t.date_received >= dateFrom);
    const matchDateTo = !dateTo || (t.date_received && t.date_received <= dateTo);
    return matchTab && matchSearch && matchAccount && matchFundSource && matchDateFrom && matchDateTo;
  });

  const exportToExcel = () => {
    const tabLabel = TAB_FILTERS.find(t => t.key === tab)?.label || 'Të gjitha';
    const accountLabel = filterAccount ? (fedAccounts.find(a => a.id === filterAccount)?.name || '') : '';
    const fundLabel = filterFundSource ? (fundSources.find(s => s.id === filterFundSource)?.name || '') : '';

    const rows = filtered.map(t => ({
      'Lloji': t.type || '',
      'Data': fmtDate(t.date_received),
      'Nr. Faturës': t.invoice_number || '',
      'Palë / Furnitor': t.supplier_name || t.club_name || t.member_name || '',
      'Përshkrimi': t.description || '',
      'Llogaria Bankare': t.federation_account_name || '',
      'Burimi i Fondeve': t.revenue_source_name || '',
      'Shuma (€)': t.amount || 0,
      'Statusi': t.status || '',
      'Data e Pagesës': fmtDate(t.payment_date),
      'Shënime': t.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksionet');

    const parts = ['Financat', tabLabel];
    if (accountLabel) parts.push(accountLabel);
    if (fundLabel) parts.push(fundLabel);
    if (dateFrom) parts.push(`nga ${dateFrom}`);
    if (dateTo) parts.push(`deri ${dateTo}`);
    const fileName = parts.join(' - ') + '.xlsx';

    XLSX.writeFile(wb, fileName);
  };

  const hasActiveFilters = filterAccount || filterFundSource || dateFrom || dateTo || search;

  // Summary cards — norm() siguron krahasim të saktë pavarësisht enkodimit
  const totalIn = transactions.filter(t => norm(t.type) === norm('Pagesë Hyrëse')).reduce((s, t) => s + (t.amount || 0), 0);
  const totalOut = transactions.filter(t => norm(t.type) === norm('Pagesë Dalëse')).reduce((s, t) => s + (t.amount || 0), 0);
  const unpaidIn = transactions.filter(t => norm(t.type) === norm('Faturë Hyrëse') && t.status !== 'Paguar').reduce((s, t) => s + (t.amount || 0), 0);
  const unpaidOut = transactions.filter(t => norm(t.type) === norm('Faturë Dalëse') && t.status !== 'Paguar').reduce((s, t) => s + (t.amount || 0), 0);

  const isIncoming = norm(form.type) === norm('Faturë Hyrëse') || norm(form.type) === norm('Pagesë Hyrëse');
  const isOutgoing = norm(form.type) === norm('Faturë Dalëse') || norm(form.type) === norm('Pagesë Dalëse');
  const isInvoice = norm(form.type) === norm('Faturë Hyrëse') || norm(form.type) === norm('Faturë Dalëse');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Financat</h1>
          <p className="text-sm text-muted-foreground">Fatura dhe pagesa hyrëse/dalëse</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Regjistro</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pagesa Hyrëse', value: totalIn, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pagesa Dalëse', value: totalOut, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Fatura Dalëse të papaguara (të ardhura në pritje)', value: unpaidOut, icon: ArrowUpCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Fatura Hyrëse të papaguara (detyrime)', value: unpaidIn, icon: ArrowDownCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`font-bold text-sm ${s.color}`}>{formatCurrency(s.value)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gjendja e llogarive bankare — klikueshme për filtrim */}
      {fedAccounts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <Landmark className="h-3.5 w-3.5" /> Gjendja e llogarive
            {filterAccount && (
              <button onClick={() => setFilterAccount('')} className="ml-2 text-primary underline text-xs font-normal normal-case tracking-normal">
                (pastro filtrin)
              </button>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {fedAccounts.map(a => {
              const isActive = filterAccount === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => { setFilterAccount(isActive ? '' : a.id); setFilterFundSource(''); }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-card shadow-sm min-w-[180px] text-left transition-all ${isActive ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50 hover:shadow-md'}`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-primary/10'}`}>
                    <Landmark className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{a.name}</p>
                    <p className={`font-bold text-sm ${(a.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(a.balance || 0)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gjendja e burimeve të fondeve — klikueshme për filtrim */}
      {fundSources.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Gjendja e burimeve të fondeve
            {filterFundSource && (
              <button onClick={() => setFilterFundSource('')} className="ml-2 text-primary underline text-xs font-normal normal-case tracking-normal">
                (pastro filtrin)
              </button>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {fundSources.map(s => {
              const isActive = filterFundSource === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setFilterFundSource(isActive ? '' : s.id); setFilterAccount(''); }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-card shadow-sm min-w-[180px] text-left transition-all ${isActive ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50 hover:shadow-md'}`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                    <TrendingUp className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-secondary-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground truncate max-w-[140px]">{s.name}</p>
                    <p className={`font-bold text-sm ${(s.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(s.balance || 0)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b flex-wrap">
        {TAB_FILTERS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filters + Export */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Kërko sipas numrit, përshkrimit, palës..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Prej:</label>
            <Input type="date" className="w-36" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <label className="text-xs text-muted-foreground whitespace-nowrap">deri:</label>
            <Input type="date" className="w-36" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {filtered.length} regjistrime{hasActiveFilters ? ' (të filtruara)' : ''}
          </p>
          <Button variant="outline" size="sm" onClick={exportToExcel} disabled={filtered.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            Eksporto në Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <TrendingUp className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nuk u gjetën regjistra.</p>
          <Button variant="outline" size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Regjistro</Button>
        </CardContent></Card>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Lloji</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Nr. Faturës</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Palë / Furnitor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Përshkrimi</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Llogaria</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Shuma</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Statusi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(t => {
                const cfgKey = Object.keys(typeConfig).find(k => norm(k) === norm(t.type));
                const cfg = cfgKey ? typeConfig[cfgKey] : {};
                const Icon = cfg.icon || TrendingUp;
                const party = t.supplier_name || t.club_name || t.member_name || '—';
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                        <span className="hidden sm:inline text-xs font-medium">{t.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(t.date_received)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{t.invoice_number || '—'}</td>
                    <td className="px-4 py-3 font-medium">{party}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{t.description || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell text-xs">{t.federation_account_name || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatCurrency(t.amount)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant={statusVariant[t.status] || 'secondary'}>{t.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        {(norm(t.type) === norm('Faturë Hyrëse') || norm(t.type) === norm('Faturë Dalëse')) && t.status !== 'Paguar' && (
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" title="Regjistro Pagesën"
                            onClick={() => { setPayTarget(t); setPayForm({ payment_date: new Date().toISOString().split('T')[0], federation_account_id: '', federation_account_name: '', revenue_source_id: '', revenue_source_name: '' }); }}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Ndrysho Regjistrimin' : 'Regjistro të Dhëna Financiare'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Type */}
            <div className="col-span-2 space-y-1">
              <Label>Lloji *</Label>
              <Select value={form.type} onValueChange={v => handleChange('type', v)}>
                <SelectTrigger><SelectValue placeholder="Zgjidh llojin..." /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Llogaria bankare e Federatës */}
            {form.type && (
             <div className="col-span-2 space-y-1">
               <Label>Llogaria Bankare e Federatës</Label>
               <Select value={form.federation_account_id || '__none__'} onValueChange={handleFedAccountChange}>
                 <SelectTrigger><SelectValue placeholder="Zgjidh llogarinë..." /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="__none__">— Asnjë —</SelectItem>
                   {fedAccounts.map(a => (
                     <SelectItem key={a.id} value={a.id}>
                       {a.name}{a.account_number ? ` — ${a.account_number}` : ''}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
            )}

            {/* Pagesa të regjistrohet tek — për të gjitha llojet */}
            {form.type && (
             <div className="col-span-2 space-y-1">
               <Label>Burimi i fondeve</Label>
               <Select value={form.revenue_source_id || '__none__'} onValueChange={handleRevenueSourceChange}>
                 <SelectTrigger><SelectValue placeholder="Zgjidh nënllogarinë..." /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="__none__">— Asnjë —</SelectItem>
                   {fundSources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                   </SelectContent>
                   </Select>
                   </div>
                   )}

                   {/* Fatura/Pagesa Hyrëse: Furnitori dhe/ose Anëtari */}
            {isIncoming && (
              <>
                <div className="col-span-2 border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pala dërguese</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Furnitori</Label>
                  <Select value={form.supplier_id || '__none__'} onValueChange={v => {
                    const s = suppliers.find(x => x.id === v);
                    handleChange('supplier_id', v === '__none__' ? '' : v);
                    handleChange('supplier_name', v === '__none__' ? '' : (s?.name || ''));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Zgjidh furnitorin..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Asnjë —</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Anëtari</Label>
                  <Select value={form.member_id || '__none__'} onValueChange={handleMemberChange}>
                    <SelectTrigger><SelectValue placeholder="Zgjidh anëtarin..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Asnjë —</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name}{m.club_name ? ` — ${m.club_name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Faturë/Pagesë Dalëse: Klubi/Burimi i fondeve dhe/ose Anëtari */}
            {isOutgoing && (
              <>
                <div className="col-span-2 border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pala përfituese</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Anëtari (pagë, mëditje, shpërblim...)</Label>
                  <Select value={form.member_id || '__none__'} onValueChange={handleMemberChange}>
                    <SelectTrigger><SelectValue placeholder="Zgjidh anëtarin..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Asnjë —</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name}{m.club_name ? ` — ${m.club_name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Klubi / Burimi i fondeve (pala përfituese)</Label>
                  <Select value={form.club_id || '__none__'} onValueChange={handleClubChange}>
                    <SelectTrigger><SelectValue placeholder="Zgjidh klubin ose burimin..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Asnjë —</SelectItem>
                      {clubs.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Klubet</div>
                          {clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </>
                      )}
                      {fundSources.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t mt-1 pt-1">Burimet e fondeve</div>
                          {fundSources.map(s => <SelectItem key={`fs-${s.id}`} value={`fs-${s.id}`}>{s.name}</SelectItem>)}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label>Data e pranimit/lëshimit *</Label>
              <Input type="date" value={form.date_received} onChange={e => handleChange('date_received', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Numri i faturës</Label>
              <Input value={form.invoice_number} onChange={e => handleChange('invoice_number', e.target.value)} placeholder="p.sh. FAT-2026-001" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Përshkrimi</Label>
              <Textarea rows={2} value={form.description} onChange={e => handleChange('description', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Shuma (€) *</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => handleChange('amount', e.target.value)} placeholder="0.00" />
            </div>
            {!isInvoice && (
              <div className="space-y-1">
                <Label>Data e pagesës</Label>
                <Input type="date" value={form.payment_date} onChange={e => handleChange('payment_date', e.target.value)} />
              </div>
            )}
            {isInvoice && (
              <div className="space-y-1">
                <Label>Statusi</Label>
                <Select value={form.status} disabled>
                  <SelectTrigger className="opacity-50 cursor-not-allowed bg-muted"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Statusi ndryshohet vetëm përmes "Regjistro Pagesën" (butoni ✓)</p>
              </div>
            )}
            <div className={`${isInvoice ? '' : 'col-span-2'} space-y-1`}>
              <Label>Shënime</Label>
              <Textarea rows={2} value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Anulo</Button>
            <Button onClick={handleSubmit} disabled={!form.type || !form.date_received || !form.amount || saveMutation.isPending}>
              {saveMutation.isPending ? 'Duke ruajtur...' : 'Ruaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog open={!!payTarget} onOpenChange={o => !o && setPayTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Regjistro Pagesën</DialogTitle>
          </DialogHeader>
          {payTarget && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <p><span className="text-muted-foreground">Fatura:</span> <span className="font-medium">{payTarget.invoice_number || '—'}</span></p>
                <p><span className="text-muted-foreground">Shuma:</span> <span className="font-bold text-green-600">{formatCurrency(payTarget.amount)}</span></p>
                <p><span className="text-muted-foreground">Lloji i pagesës:</span> <span className="font-medium">{norm(payTarget.type) === norm('Faturë Dalëse') ? 'Pagesë Hyrëse' : 'Pagesë Dalëse'}</span></p>
              </div>
              <div className="space-y-1">
                <Label>Data e pagesës *</Label>
                <Input type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Llogaria Bankare e Federatës *</Label>
                <Select value={payForm.federation_account_id || '__none__'} onValueChange={id => {
                  const a = fedAccounts.find(x => x.id === id);
                  setPayForm(f => ({ ...f, federation_account_id: id === '__none__' ? '' : id, federation_account_name: id === '__none__' ? '' : (a?.name || '') }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh llogarinë..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Asnjë —</SelectItem>
                    {fedAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}{a.account_number ? ` — ${a.account_number}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Burimi i fondeve</Label>
                <Select value={payForm.revenue_source_id || '__none__'} onValueChange={id => {
                  const s = fundSources.find(x => x.id === id);
                  setPayForm(f => ({ ...f, revenue_source_id: id === '__none__' ? '' : id, revenue_source_name: id === '__none__' ? '' : (s?.name || '') }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Zgjidh burimin..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Asnjë —</SelectItem>
                    {fundSources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayTarget(null)}>Anulo</Button>
            <Button onClick={() => payMutation.mutate({ invoice: payTarget, payData: payForm })}
              disabled={!payForm.payment_date || payMutation.isPending}>
              {payMutation.isPending ? 'Duke regjistruar...' : 'Regjistro Pagesën'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => { if (!o) { setDeleteTarget(null); deleteMutation.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi Regjistrimin</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMutation.isError && deleteMutation.error?.message === 'PAYMENT_EXISTS' ? (
                <span className="text-destructive font-medium">
                  Kjo faturë nuk mund të fshihet sepse ka një pagesë të regjistruar të lidhur me të.
                  Fshi së pari pagesën përkatëse, pastaj mund të fshish faturën.
                </span>
              ) : (
                'A je i sigurt? Ky veprim nuk mund të kthehet.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {deleteMutation.isError && deleteMutation.error?.message === 'PAYMENT_EXISTS' ? (
              <AlertDialogCancel>Mbyll</AlertDialogCancel>
            ) : (
              <>
                <AlertDialogCancel>Anulo</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteMutation.mutate(deleteTarget)}>
                  Fshi
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}