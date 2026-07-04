import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Users, Trophy, UserCheck, GraduationCap } from 'lucide-react';

const statusLabels = { active: 'Aktiv', inactive: 'Joaktiv', suspended: 'I pezulluar' };

export default function ClubDetail() {
  const { id } = useParams();

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  const club = clubs.find(c => c.id === id);

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('-created_date', 500),
  });

  const { data: results = [] } = useQuery({
    queryKey: ['results'],
    queryFn: () => base44.entities.Result.list('-created_date', 500),
  });

  const { data: competitions = [] } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => base44.entities.Competition.list('-date_start', 100),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!club) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Klubi nuk u gjet</p><Link to="/clubs"><Button variant="outline" className="mt-4">Kthehu</Button></Link></div>;
  }

  const clubMembers = members.filter(m => m.club_id === id);
  const shooters = clubMembers.filter(m => m.is_shooter);
  const officials = clubMembers.filter(m => !m.is_shooter || m.club_roles?.length > 0);

  // Competition history: results where club_name matches
  const clubResults = results.filter(r => r.club_name === club.name);
  const competitionIds = [...new Set(clubResults.map(r => r.competition_id))];
  const clubCompetitions = competitions.filter(c => competitionIds.includes(c.id));

  return (
    <div className="space-y-6">
      <Link to="/clubs"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kthehu tek klubet</Button></Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info card */}
        <Card className="border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">{club.name?.[0]}</span>
              </div>
              <div>
                <h2 className="text-xl font-display font-bold leading-tight">{club.name}</h2>
                <Badge variant="outline" className="mt-1 text-[10px]">{statusLabels[club.status] || club.status}</Badge>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {club.city && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" />{club.city}</div>}
              {club.registration_number && <div className="flex items-center gap-3"><UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />Nr. Reg: <span className="font-medium">{club.registration_number}</span></div>}
              {club.president_name && <div className="flex items-center gap-3"><Users className="h-4 w-4 text-muted-foreground shrink-0" />Kryetar: <span className="font-medium">{club.president_name}</span></div>}
              {club.vice_president_name && <div className="flex items-center gap-3"><Users className="h-4 w-4 text-muted-foreground shrink-0" />Nënkryetar: <span className="font-medium">{club.vice_president_name}</span></div>}
              {club.secretary_name && <div className="flex items-center gap-3"><Users className="h-4 w-4 text-muted-foreground shrink-0" />Sekretar: <span className="font-medium">{club.secretary_name}</span></div>}
              {club.founded_year && <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" />Themeluar: <span className="font-medium">{club.founded_year}</span></div>}
              {club.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground shrink-0" />{club.phone}</div>}
              {club.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground shrink-0" />{club.email}</div>}
              {club.address && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" />{club.address}</div>}
            </div>

            {/* Trajnerët */}
            {club.coach_names?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> Trajnerët
                </p>
                <div className="space-y-1">
                  {club.coach_names.map((c, i) => (
                    <div key={i} className="text-sm bg-muted/50 px-3 py-1.5 rounded-md">{c}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t text-center">
              <div><p className="text-2xl font-bold font-display">{shooters.length}</p><p className="text-xs text-muted-foreground">Shenjëtarë</p></div>
              <div><p className="text-2xl font-bold font-display">{clubMembers.length}</p><p className="text-xs text-muted-foreground">Anëtarë</p></div>
              <div><p className="text-2xl font-bold font-display">{clubCompetitions.length}</p><p className="text-xs text-muted-foreground">Gara</p></div>
            </div>

            {club.notes && <p className="mt-4 text-sm text-muted-foreground italic">{club.notes}</p>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Sportistët */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2"><Users className="h-4 w-4" />Sportistët e regjistruar ({shooters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {shooters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nuk ka shenjëtarë të regjistruar</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {shooters.map(m => (
                    <Link key={m.id} to={`/members/${m.id}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{m.first_name?.[0]}{m.last_name?.[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.first_name} {m.last_name}</p>
                        <p className="text-xs text-muted-foreground">{m.shooter_category || '—'} · {m.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historia e garrave */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2"><Trophy className="h-4 w-4" />Historia e pjesëmarrjes në gara ({clubCompetitions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {clubCompetitions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Asnjë garë e regjistruar ende</p>
              ) : (
                <div className="space-y-2">
                  {clubCompetitions.map(comp => {
                    const compResults = clubResults.filter(r => r.competition_id === comp.id);
                    const medals = compResults.filter(r => r.medal && r.medal !== '').length;
                    return (
                      <Link key={comp.id} to={`/competitions/${comp.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div>
                          <p className="text-sm font-medium">{comp.name}</p>
                          <p className="text-xs text-muted-foreground">{comp.date_start} · {comp.city || comp.location || ''}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-semibold">{compResults.length} rezultate</p>
                          {medals > 0 && <p className="text-xs text-yellow-600">{medals} medalje</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}