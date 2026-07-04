import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Trophy, Calendar, MapPin, Pencil, Trash2, Users, Plus, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import EmptyState from '@/components/shared/EmptyState';
import CompetitionFormDialog from '@/components/competitions/CompetitionFormDialog';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusColors = {
  'Planifikuar':         'bg-gray-100 text-gray-600',
  'Regjistrimi i hapur': 'bg-green-100 text-green-800',
  'Në zhvillim':         'bg-yellow-100 text-yellow-800',
  'Përfunduar':          'bg-blue-100 text-blue-800',
  'Anuluar':             'bg-red-100 text-red-700',
  // Backward compat
  'Draft': 'bg-gray-100 text-gray-600',
  'Hapur': 'bg-green-100 text-green-800',
  'Mbyllur': 'bg-yellow-100 text-yellow-800',
};

const BETA_TEST = true; // Ndyshoje në false kur të mbarojë faza BETA

export default function Competitions() {
  const [formOpen, setFormOpen] = useState(false);
  const [editComp, setEditComp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'admin'; // Super Admin = role 'admin'
  const canDeleteInProgress = isSuperAdmin && BETA_TEST;

  const { data: competitions = [] } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => base44.entities.Competition.list('-date_start', 100),
  });

  const handleDelete = async () => {
    await base44.entities.Competition.delete(deleteId);
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Garat</h1>
          <p className="text-muted-foreground mt-1">{competitions.length} gara të regjistruara</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditComp(null); setFormOpen(true); }}>
            <Pencil className="h-4 w-4 mr-2" />Shto (i shpejtë)
          </Button>
          <Link to="/competitions/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />Krijo me Wizard
            </Button>
          </Link>
        </div>
      </div>

      {competitions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nuk ka gara"
          description="Filloni duke shtuar garën e parë"
          actionLabel="Shto Garë"
          onAction={() => { setEditComp(null); setFormOpen(true); }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map(comp => (
            <Card key={comp.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-[10px] ${statusColors[comp.status] || 'bg-gray-100'}`}>{comp.status}</Badge>
                  {comp.type && <Badge variant="outline" className="text-[10px]">{comp.type}</Badge>}
                </div>
                <h3 className="font-display font-bold text-lg leading-tight">{comp.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{comp.discipline}</p>
                <div className="flex flex-col gap-1.5 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {comp.date_start && format(new Date(comp.date_start), 'dd MMM yyyy')}
                    {comp.date_end && ` — ${format(new Date(comp.date_end), 'dd MMM yyyy')}`}
                  </div>
                  {(comp.city || comp.location) && (
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{comp.location}{comp.location && comp.city ? ', ' : ''}{comp.city}</div>
                  )}
                  {comp.category && <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" />{comp.category}</div>}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Link to={`/competitions/${comp.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Shiko</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => { setEditComp(comp); setFormOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {comp.status === 'Në zhvillim' ? (
                    canDeleteInProgress ? (
                      <Button variant="outline" size="sm" className="text-destructive" title="BETA: Fshi garën në zhvillim" onClick={() => setDeleteId(comp.id)}>
                        <ShieldAlert className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-muted-foreground opacity-40 cursor-not-allowed" title="Gara në zhvillim nuk mund të fshihet" disabled>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteId(comp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CompetitionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        competition={editComp}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['competitions'] })}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fshi garën?</AlertDialogTitle>
            <AlertDialogDescription>Do të fshihen edhe rezultatet e kësaj gare.</AlertDialogDescription>
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