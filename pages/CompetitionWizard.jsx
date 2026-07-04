import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import WizardStep1Basics from '@/components/competition-wizard/WizardStep1Basics';
import WizardStep2Events from '@/components/competition-wizard/WizardStep2Events';
import WizardStep3Relays from '@/components/competition-wizard/WizardStep3Relays';
import WizardStep4Officials from '@/components/competition-wizard/WizardStep4Officials';
import WizardStepReview from '@/components/competition-wizard/WizardStepReview';

const STEPS = [
  { id: 1, label: 'Të dhënat bazë' },
  { id: 2, label: 'Eventet' },
  { id: 3, label: 'Ndërrimet' },
  { id: 4, label: 'Organet' },
  { id: 5, label: 'Verifikimi' },
];

export default function CompetitionWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [basics, setBasics] = useState({
    name: '', organizer: '', location: '', city: '',
    date_start: '', date_end: '', registration_deadline: '',
    type: '', description: '', status: 'Draft',
  });
  const [events, setEvents] = useState([]);
  const [relays, setRelays] = useState([]);
  const [officials, setOfficials] = useState([]);

  const canGoNext = () => {
    if (step === 1) return basics.name && basics.date_start;
    if (step === 2) return events.length > 0;
    if (step === 3) return relays.length > 0;
    if (step === 4) return true;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Krijo garën
      const comp = await base44.entities.Competition.create(basics);

      // Krijo eventet
      for (const ev of events) {
        await base44.entities.CompetitionEvent.create({
          ...ev,
          competition_id: comp.id,
          competition_name: comp.name,
        });
      }

      // Krijo ndërrimet
      for (const relay of relays) {
        await base44.entities.CompetitionRelay.create({
          ...relay,
          competition_id: comp.id,
        });
      }

      // Krijo organet
      for (const off of officials) {
        await base44.entities.CompetitionOfficial.create({
          ...off,
          competition_id: comp.id,
        });
      }

      navigate(`/competitions/${comp.id}`);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/competitions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Kthehu
        </Button>
        <h1 className="text-2xl font-display font-bold mt-4">Krijo Garë të Re</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center shrink-0">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                ${step > s.id ? 'bg-primary border-primary text-primary-foreground' :
                  step === s.id ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${step === s.id ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mt-[-10px] ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 1 && <WizardStep1Basics data={basics} onChange={setBasics} />}
        {step === 2 && <WizardStep2Events events={events} onChange={setEvents} />}
        {step === 3 && <WizardStep3Relays relays={relays} onChange={setRelays} />}
        {step === 4 && <WizardStep4Officials officials={officials} onChange={setOfficials} />}
        {step === 5 && (
          <WizardStepReview
            basics={basics}
            events={events}
            relays={relays}
            officials={officials}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />Prapa
        </Button>
        {step < STEPS.length ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()}>
            Tjetër<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={saving}>
            {saving ? 'Duke ruajtur...' : <><Check className="h-4 w-4 mr-2" />Krijo Garën</>}
          </Button>
        )}
      </div>
    </div>
  );
}