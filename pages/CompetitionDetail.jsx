import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, MapPin, Trophy, Users, UserCheck, Shuffle, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { format } from 'date-fns';
import { STATUS_COLORS, REQUIRED_OFFICIAL_ROLES, SEEDING_PRIORITY, MAX_LANES } from '@/lib/constants';
import CompetitionRegistrations from '@/components/competition-detail/CompetitionRegistrations';
import CompetitionResults from '@/components/competition-detail/CompetitionResults';
import CompetitionOfficials from '@/components/competition-detail/CompetitionOfficials';
import CompetitionRelaysView from '@/components/competition-detail/CompetitionRelaysView';
import CompetitionEventsManager from '@/components/competition-detail/CompetitionEventsManager';
import CompetitionRelaysManager from '@/components/competition-detail/CompetitionRelaysManager';
import CompetitionStatusManager from '@/components/competition-detail/CompetitionStatusManager';

export default function CompetitionDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data: competition, isLoading } = useQuery({
    queryKey: ['competition', id],
    queryFn: async () => {
      const list = await base44.entities.Competition.filter({ id });
      return list[0];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['competition-events', id],
    queryFn: () => base44.entities.CompetitionEvent.filter({ competition_id: id }),
    enabled: !!id,
  });

  const { data: relays = [] } = useQuery({
    queryKey: ['competition-relays', id],
    queryFn: () => base44.entities.CompetitionRelay.filter({ competition_id: id }, 'relay_number'),
    enabled: !!id,
  });

  const { data: officials = [] } = useQuery({
    queryKey: ['competition-officials', id],
    queryFn: () => base44.entities.CompetitionOfficial.filter({ competition_id: id }),
    enabled: !!id,
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['competition-registrations', id],
    queryFn: () => base44.entities.Registration.filter({ competition_id: id }),
    enabled: !!id,
  });

  const { data: results = [] } = useQuery({
    queryKey: ['competition-results', id],
    queryFn: () => base44.entities.Result.filter({ competition_id: id }, '-total_score', 500),
    enabled: !!id,
  });

  const missingOfficials = REQUIRED_OFFICIAL_ROLES.filter(r => !officials.find(o => o.role === r));
  const officialsComplete = missingOfficials.length === 0;

  const handleAutoSeed = async () => {
    if (relays.length === 0) return;

    const toSeed = [...registrations].sort((a, b) => {
      const pa = SEEDING_PRIORITY[a.discipline] || 99;
      const pb = SEEDING_PRIORITY[b.discipline] || 99;
      return pa - pb;
    });

    const sorted_relays = [...relays].sort((a, b) => a.relay_number - b.relay_number);

    const updates = [];
    let relayIdx = 0;
    let lane = 1;

    for (const reg of toSeed) {
      if (relayIdx >= sorted_relays.length) break;
      const relay = sorted_relays[relayIdx];
      updates.push({ id: reg.id, relay_id: relay.id, relay_number: relay.relay_number, lane_number: lane });
      lane++;
      if (lane > MAX_LANES) {
        lane = 1;
        relayIdx++;
      }
    }

    setSeeding(true);
    await Promise.all(updates.map(u =>
      base44.entities.Registration.update(u.id, {
        relay_id: u.relay_id,
        relay_number: u.relay_number,
        lane_number: u.lane_number,
      })
    ));
    setSeeding(false);
    queryClient.invalidateQueries({ queryKey: ['competition-registrations', id] });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!competition) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Gara nuk u gjet</p><Link to="/competitions"><Button variant="outline" className="mt-4">Kthehu</Button></Link></div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/competitions"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Kthehu tek garat</Button></Link>

      {/* Header */}
      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={STATUS_COLORS[competition.status] || 'bg-gray-100 text-gray-600'}>{competition.status}</Badge>
                {competition.type && <Badge variant="outline">{competition.type}</Badge>}
                {!officialsComplete && (
                  <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                    <AlertTriangle className="h-3 w-3" />Organet jo komplet
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-display font-bold">{competition.name}</h1>
              {competition.organizer && <p className="text-muted-foreground mt-1">{competition.organizer}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {competition.date_start && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(competition.date_start), 'dd MMM yyyy')}{competition.date_end && ` — ${format(new Date(competition.date_end), 'dd MMM yyyy')}`}</span>
                )}
                {(competition.location || competition.city) && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{competition.location}{competition.location && competition.city ? ', ' : ''}{competition.city}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Button variant="outline" size="sm" onClick={handleAutoSeed} disabled={seeding || registrations.length === 0}>
                <Shuffle className="h-4 w-4 mr-2" />{seeding ? 'Duke caktuar...' : 'Seeding automatik'}
              </Button>
              <CompetitionStatusManager
                competition={competition}
                events={events}
                relays={relays}
                officials={officials}
                registrations={registrations}
                results={results}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t text-center">
            <div><p className="text-xl font-bold font-display">{events.length}</p><p className="text-xs text-muted-foreground">Evente</p></div>
            <div><p className="text-xl font-bold font-display">{relays.length}</p><p className="text-xs text-muted-foreground">Ndërrime</p></div>
            <div><p className="text-xl font-bold font-display">{registrations.length}</p><p className="text-xs text-muted-foreground">Garues</p></div>
            <div>
              <p className="text-xl font-bold font-display flex items-center justify-center gap-1">
                {officialsComplete ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              </p>
              <p className="text-xs text-muted-foreground">Organet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="registrations">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="events"><Target className="h-3.5 w-3.5 mr-1" />Eventet</TabsTrigger>
          <TabsTrigger value="registrations"><Users className="h-3.5 w-3.5 mr-1" />Garuesit</TabsTrigger>
          <TabsTrigger value="relays"><Shuffle className="h-3.5 w-3.5 mr-1" />Ndërrimet</TabsTrigger>
          <TabsTrigger value="results"><Trophy className="h-3.5 w-3.5 mr-1" />Rezultatet</TabsTrigger>
          <TabsTrigger value="officials"><UserCheck className="h-3.5 w-3.5 mr-1" />Organet</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <CompetitionEventsManager competitionId={id} competitionName={competition.name} />
        </TabsContent>
        <TabsContent value="registrations" className="mt-4">
          <CompetitionRegistrations competitionId={id} competition={competition} events={events} relays={relays} />
        </TabsContent>
        <TabsContent value="relays" className="mt-4">
          <div className="space-y-4">
            <CompetitionRelaysManager competitionId={id} />
            <CompetitionRelaysView competitionId={id} relays={relays} />
          </div>
        </TabsContent>
        <TabsContent value="results" className="mt-4">
          <CompetitionResults competitionId={id} competition={competition} events={events} results={results} />
        </TabsContent>
        <TabsContent value="officials" className="mt-4">
          <CompetitionOfficials competitionId={id} officials={officials} />
        </TabsContent>
      </Tabs>
    </div>
  );
}