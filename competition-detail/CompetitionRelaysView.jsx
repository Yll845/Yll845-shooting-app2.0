import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';

const ATTENDANCE_COLORS = {
  'Regjistruar': 'bg-gray-100 text-gray-600',
  'Prezent': 'bg-green-100 text-green-800',
  'Mungon': 'bg-red-100 text-red-700',
};

export default function CompetitionRelaysView({ competitionId, relays }) {
  const queryClient = useQueryClient();
  const [localRegs, setLocalRegs] = useState([]);

  const canDrag = true;

  const { data: registrations = [] } = useQuery({
    queryKey: ['competition-registrations', competitionId],
    queryFn: () => base44.entities.Registration.filter({ competition_id: competitionId }),
  });

  useEffect(() => {
    setLocalRegs(registrations);
  }, [registrations]);

  const sortedRelays = [...relays].sort((a, b) => a.relay_number - b.relay_number);

  // Ndërtojmë grid: për çdo ndërrim × pozicion, gjejmë regjistrimin
  const getRegForSlot = (relayNumber, lane) =>
    localRegs.find(r => r.relay_number === relayNumber && r.lane_number === lane);

  const onDragEnd = async (result) => {
    if (!canDrag) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // droppableId format: "relay-{relayNumber}-lane-{laneNumber}"
    const parseSlot = (id) => {
      const parts = id.split('-');
      return { relayNumber: parseInt(parts[1]), lane: parseInt(parts[3]) };
    };

    const destSlot = parseSlot(destination.droppableId);
    const srcSlot = parseSlot(source.droppableId);

    const draggedReg = localRegs.find(r => r.id === draggableId);
    if (!draggedReg) return;

    // Kontrollo nëse destinacioni ka garues — nëse po, shkëmbeje
    const existingInDest = getRegForSlot(destSlot.relayNumber, destSlot.lane);

    // Update lokal menjëherë (optimistic)
    setLocalRegs(prev => prev.map(r => {
      if (r.id === draggableId) {
        const destRelay = relays.find(rel => rel.relay_number === destSlot.relayNumber);
        return { ...r, relay_number: destSlot.relayNumber, lane_number: destSlot.lane, relay_id: destRelay?.id };
      }
      if (existingInDest && r.id === existingInDest.id) {
        const srcRelay = relays.find(rel => rel.relay_number === srcSlot.relayNumber);
        return { ...r, relay_number: srcSlot.relayNumber, lane_number: srcSlot.lane, relay_id: srcRelay?.id };
      }
      return r;
    }));

    // Ruaj në databazë
    const destRelay = relays.find(rel => rel.relay_number === destSlot.relayNumber);
    await base44.entities.Registration.update(draggableId, {
      relay_id: destRelay?.id,
      relay_number: destSlot.relayNumber,
      lane_number: destSlot.lane,
    });

    if (existingInDest) {
      const srcRelay = relays.find(rel => rel.relay_number === srcSlot.relayNumber);
      await base44.entities.Registration.update(existingInDest.id, {
        relay_id: srcRelay?.id,
        relay_number: srcSlot.relayNumber,
        lane_number: srcSlot.lane,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['competition-registrations', competitionId] });
  };

  if (sortedRelays.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nuk ka ndërrime të planifikuara.</p>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
        {canDrag ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <GripVertical className="h-3.5 w-3.5" />
            Tërhiq garuesit për të ndryshuar pozicionin ose ndërrimin
          </p>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Ndryshimi i pozicioneve nuk është i lejuar për këtë llogari
          </p>
        )}
        {sortedRelays.map(relay => {
          const relayRegs = localRegs.filter(r => r.relay_number === relay.relay_number);

          return (
            <Card key={relay.id} className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {relay.relay_number}
                  </div>
                  Ndërrimi {relay.relay_number}
                  {relay.scheduled_time && (
                    <span className="text-sm font-normal text-muted-foreground">— ora {relay.scheduled_time}</span>
                  )}
                  <Badge variant="outline" className="ml-auto text-xs">{relayRegs.length} / 10 pozicione</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(lane => {
                    const reg = getRegForSlot(relay.relay_number, lane);
                    const droppableId = `relay-${relay.relay_number}-lane-${lane}`;

                    return (
                      <Droppable droppableId={droppableId} key={droppableId}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-2 rounded-lg border text-center min-h-[80px] transition-colors ${
                              snapshot.isDraggingOver
                                ? 'border-primary bg-primary/5'
                                : reg
                                  ? (reg.attendance_status === 'Mungon' ? 'opacity-40 bg-muted/20' : 'bg-muted/30')
                                  : 'bg-muted/10 border-dashed'
                            }`}
                          >
                            <p className="text-xs font-bold text-muted-foreground mb-1">Poz. {lane}</p>
                            {reg ? (
                              <Draggable draggableId={reg.id} index={lane} isDragDisabled={!canDrag}>
                                {(dragProvided, dragSnapshot) => (
                                  <div
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    className={`${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${dragSnapshot.isDragging ? 'opacity-70' : ''}`}
                                  >
                                    {canDrag && (
                                      <div className="flex justify-center mb-0.5">
                                        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                                      </div>
                                    )}
                                    <p className="text-xs font-medium truncate">{reg.member_name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{reg.club_name || '—'}</p>
                                    <Badge className={`text-[9px] mt-1 ${ATTENDANCE_COLORS[reg.attendance_status]}`}>
                                      {reg.attendance_status}
                                    </Badge>
                                  </div>
                                )}
                              </Draggable>
                            ) : (
                              <p className="text-xs text-muted-foreground/40 mt-4">—</p>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DragDropContext>
  );
}