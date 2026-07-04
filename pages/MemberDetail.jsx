import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, Award, Target, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function MemberDetail() {
  const { id } = useParams();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const list = await base44.entities.Member.filter({ id });
      return list[0];
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ['results-member', id],
    queryFn: () => base44.entities.Result.filter({ shooter_id: id }, '-created_date', 50),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!member) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Anëtari nuk u gjet</p><Link to="/members"><Button variant="outline" className="mt-4">Kthehu</Button></Link></div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/members"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kthehu tek anëtarët</Button></Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card className="border-none shadow-md lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{member.first_name?.[0]}{member.last_name?.[0]}</span>
              </div>
              <h2 className="text-xl font-display font-bold">{member.first_name} {member.last_name}</h2>
              <Badge className="mt-2">{member.status}</Badge>
            </div>

            <div className="mt-6 space-y-3">
              {member.club_name && <div className="flex items-center gap-3 text-sm"><Building2 className="h-4 w-4 text-muted-foreground shrink-0" />{member.club_name}</div>}
              {member.date_of_birth && <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground shrink-0" />{format(new Date(member.date_of_birth), 'dd/MM/yyyy')}</div>}
              {member.city && <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground shrink-0" />{member.city}</div>}
              {member.phone && <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground shrink-0" />{member.phone}</div>}
              {member.email && <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground shrink-0" />{member.email}</div>}
            </div>

            {/* Roles summary */}
            <div className="mt-6 space-y-3">
              {member.is_shooter && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Target className="h-3 w-3" /> Shenjëtar</p>
                  <div className="space-y-1 pl-1 text-sm">
                    {member.shooter_category && <p>Kategoria: <span className="font-medium">{member.shooter_category}</span></p>}
                    {member.license_number && <p>Licenca: <span className="font-medium">{member.license_number}</span></p>}
                    {member.license_valid_until && <p>Deri: <span className="font-medium">{format(new Date(member.license_valid_until), 'dd/MM/yyyy')}</span></p>}
                  </div>
                  {member.discipline?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.discipline.map(d => <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>)}
                    </div>
                  )}
                </div>
              )}

              {member.club_roles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Shield className="h-3 w-3" /> Pozitat në Klub</p>
                  <div className="flex flex-wrap gap-1">
                    {member.club_roles.map(r => <Badge key={r} className="bg-blue-100 text-blue-800 text-[10px]">{r}</Badge>)}
                  </div>
                </div>
              )}

              {member.federation_roles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1"><Shield className="h-3 w-3" /> Pozitat në Federatë</p>
                  <div className="flex flex-wrap gap-1">
                    {member.federation_roles.map(r => <Badge key={r} className="bg-purple-100 text-purple-800 text-[10px]">{r}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results (only if shooter) */}
        <Card className="border-none shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">
              {member.is_shooter ? 'Rezultatet në gara' : 'Ky anëtar nuk është shenjëtar'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!member.is_shooter ? (
              <p className="text-muted-foreground text-sm">Rezultatet shfaqen vetëm për anëtarët me rolin "Shenjëtar".</p>
            ) : results.length === 0 ? (
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