import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Building2, Users, Pencil, Trash2, MapPin, Eye, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ClubFormDialog from '@/components/clubs/ClubFormDialog';
import ImportExcelDialog from '@/components/shared/ImportExcelDialog';

const CLUB_COLUMN_MAP = {
  'Emri i Klubit': 'name', 'Qyteti': 'city', 'Numri i Regjistrimit': 'registration_number',
  'Emri i Kryetarit': 'president_name', 'Emri i Nënkryetarit': 'vice_president_name',
  'Emri i Sekretarit': 'secretary_name', 'Adresa': 'address', 'Telefoni': 'phone',
  'Email': 'email', 'Viti i Themelimit': 'founded_year',
  'Statusi (active/inactive/suspended)': 'status', 'Shënime': 'notes',
};

export default function Clubs() {
  const [formOpen, setFormOpen] = useState(false);
  const [editClub, setEditClub] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('-created_date', 500),
  });

  const getClubShooterCount = (clubId) => members.filter(m => m.club_id === clubId && m.is_shooter).length;

  const handleDelete = async () => {
    await base44.entities.Club.delete(deleteId);
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['clubs'] });
  };

  const statusLabels = { active: 'Aktiv', inactive: 'Joaktiv', suspended: 'I pezulluar' };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Klubet</h1>
          <p className="text-muted-foreground mt-1">{clubs.length} klube të regjistruara</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />Importo nga Excel
          </Button>
          <Button onClick={() => { setEditClub(null); setFormOpen(true); }}>
            <Building2 className="h-4 w-4 mr-2" />Shto Klub
          </Button>
        </div>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nuk ka klube"
          description="Filloni duke shtuar klubin e parë"
          actionLabel="Shto Klub"
          onAction={() => { setEditClub(null); setFormOpen(true); }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <Card key={club.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{statusLabels[club.status] || club.status}</Badge>
                </div>
                <h3 className="font-display font-bold text-lg">{club.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {club.city}
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{getClubShooterCount(club.id)} shenjëtarë</div>
                </div>
                {club.president_name && <p className="text-xs text-muted-foreground mt-2">Kryetar: {club.president_name}</p>}
                {club.registration_number && <p className="text-xs text-muted-foreground mt-1">Nr. Reg: {club.registration_number}</p>}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link to={`/clubs/${club.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Eye className="h-3.5 w-3.5 mr-1" /> Detajet</Button>
                  </Link>
                  <Button variant="outline" size="icon" size="sm" onClick={() => { setEditClub(club); setFormOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteId(club.id)}>
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
        title="Importo Klube nga Excel"
        columnMap={CLUB_COLUMN_MAP}
        onImport={async (row) => {
          await base44.entities.Club.create(row);
          queryClient.invalidateQueries({ queryKey: ['clubs'] });
        }}
      />

      <ClubFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        club={editClub}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['clubs'] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi klubin?</AlertDialogTitle>
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