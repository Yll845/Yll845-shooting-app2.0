import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Building2, Trophy, Medal, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import StatCard from '@/components/shared/StatCard';
import { format } from 'date-fns';

export default function Dashboard() {
  const { data: shooters = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => base44.entities.Member.list('-created_date', 100),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.Club.list(),
  });

  const { data: competitions = [] } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => base44.entities.Competition.list('-date_start', 50),
  });

  const { data: results = [] } = useQuery({
    queryKey: ['results'],
    queryFn: () => base44.entities.Result.list('-created_date', 100),
  });

  const activeShooters = shooters.filter(s => s.status === 'Aktiv' && s.is_shooter).length;
  const upcomingCompetitions = competitions.filter(c => c.status === 'Planifikuar' || c.status === 'Regjistrimi hapur');
  const recentCompetitions = competitions.filter(c => c.status === 'Përfunduar').slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="relative bg-primary rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-accent/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-8 w-8 text-accent" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">
              Federata e Shënjetarisë e Kosovës
            </h1>
          </div>
          <p className="text-primary-foreground/70 max-w-lg">
            Sistemi i menaxhimit të sportistëve, klubeve, garave dhe rezultateve
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Anëtarë" value={shooters.length} icon={Users} trend={`${activeShooters} shenjëtarë aktivë`} />
        <StatCard title="Klube" value={clubs.length} icon={Building2} />
        <StatCard title="Gara" value={competitions.length} icon={Trophy} trend={`${upcomingCompetitions.length} të ardhshme`} />
        <StatCard title="Rezultate" value={results.length} icon={Medal} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming competitions */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Garat e ardhshme
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingCompetitions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Nuk ka gara të planifikuara</p>
            ) : (
              <div className="space-y-3">
                {upcomingCompetitions.slice(0, 5).map(comp => (
                  <Link key={comp.id} to={`/competitions/${comp.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-xs text-muted-foreground">{comp.discipline} · {comp.city || comp.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{comp.date_start && format(new Date(comp.date_start), 'dd MMM yyyy')}</p>
                        <Badge variant="outline" className="text-[10px] mt-1">{comp.status}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent results */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Rezultatet e fundit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompetitions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Nuk ka rezultate ende</p>
            ) : (
              <div className="space-y-3">
                {recentCompetitions.map(comp => (
                  <Link key={comp.id} to={`/results?competition=${comp.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{comp.name}</p>
                        <p className="text-xs text-muted-foreground">{comp.discipline}</p>
                      </div>
                      <Badge className="bg-accent/10 text-accent-foreground border-accent/20 text-[10px]">
                        Përfunduar
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent shooters */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Shenjëtarët e fundit të regjistruar
            </CardTitle>
            <Link to="/members" className="text-sm text-primary hover:underline">Shiko të gjithë →</Link>
          </div>
        </CardHeader>
        <CardContent>
          {shooters.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">Nuk ka gjuajtës të regjistruar</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shooters.slice(0, 6).map(s => (
                <Link key={s.id} to={`/members/${s.id}`} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {s.first_name?.[0]}{s.last_name?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.club_name || 'Pa klub'}{s.is_shooter ? ` · ${s.shooter_category || ''}` : ''}</p>

                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}