import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Award, Target } from 'lucide-react';
import { format } from 'date-fns';

export default function ShooterDetail() {
  const { id } = useParams();

  const { data: shooter, isLoading } = useQuery({
    queryKey: ['shooter', id],
    queryFn: async () => {
      const list = await base44.entities.Shooter.filter({ id });
      return list[0];
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ['results-shooter', id],
    queryFn: () => base44.entities.Result.filter({ shooter_id: id }, '-created_date', 50),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!shooter) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Gjuajtësi nuk u gjet</p><Link to="/shooters"><Button variant="outline" className="mt-4">Kthehu</Button></Link></div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/shooters"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kthehu tek gjuajtësit</Button></Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="border-none shadow-md lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{shooter.first_name?.[0]}{shooter.last_name?.[0]}</span>
              </div>
              <h2 className="text-xl font-display font-bold">{shooter.first_name} {shooter.last_name}</h2>
              <Badge className="mt-2">{shooter.status}</Badge>
            </div>
            <div className="mt-6 space-y-3">
              {shooter.club_name && <div className="flex items-center gap-3 text-sm"><Building2 className="h-4 w-4 text-muted-foreground" />{shooter.club_name}</div>}
              {shooter.category && <div className="flex items-center gap-3 text-sm"><Award className="h-4 w-4 text-muted-foreground" />{shooter.category}</div>}
              {shooter.date_of_birth && <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{format(new Date(shooter.date_of_birth), 'dd/MM/yyyy')}</div>}
              {shooter.city && <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{shooter.city}</div>}
              {shooter.phone && <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{shooter.phone}</div>}
              {shooter.email && <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{shooter.email}</div>}
            </div>
            {shooter.discipline?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Disiplinat</p>
                <div className="flex flex-wrap gap-1.5">
                  {shooter.discipline.map(d => (
                    <Badge key={d} variant="outline" className="text-[10px]"><Target className="h-3 w-3 mr-1" />{d}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="border-none shadow-md lg:col-span-2">
          <CardHeader><CardTitle className="font-display">Rezultatet në gara</CardTitle></CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Nuk ka rezultate ende</p>
            ) : (
              <div className="space-y-3">
                {results.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{r.competition_name}</p>
                      <p className="text-xs text-muted-foreground">{r.discipline} · {r.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{r.total_score}</p>
                      {r.medal && <Badge className="text-[10px]">{r.medal}</Badge>}
                      {r.rank && <p className="text-xs text-muted-foreground">Vendi {r.rank}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}