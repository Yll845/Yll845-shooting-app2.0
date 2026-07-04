import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Users, Building2, Crosshair } from 'lucide-react';
import * as XLSX from 'xlsx';

function downloadExcel(filename, headers, example, sheetName) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);

  // Gjerësia automatike e kolonave
  const colWidths = headers.map((h, i) => ({
    wch: Math.max(h.length, String(example[i] || '').length, 18)
  }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

const TEMPLATES = [
  {
    id: 'members',
    label: 'Anëtarët',
    icon: Users,
    filename: 'template_anetaret.xlsx',
    sheetName: 'Anëtarët',
    description: 'Template për importin e anëtarëve të federatës',
    headers: [
      'Emri', 'Mbiemri', 'Numri Personal', 'Data e Lindjes (DD/MM/YYYY)',
      'Gjinia (Mashkull/Femër)', 'Qyteti', 'Adresa', 'Telefoni', 'Email',
      'Emri i Klubit', 'Është Shenjëtar (true/false)', 'Kategoria (Pionier/Junior/Senior)',
      'Disiplina', 'Nr. Licencës', 'Licenca Deri Më (DD/MM/YYYY)', 'ISSF ID',
      'I Mitur (true/false)', 'Emri i Kujdestarit', 'Telefoni i Kujdestarit',
      'Pozitat në Klub', 'Pozitat në Federatë',
      'Emri i Bankës', 'IBAN', 'SWIFT',
      'Statusi (Aktiv/Joaktiv/I pezulluar/I transferuar)', 'Data e Regjistrimit (DD/MM/YYYY)', 'Shënime'
    ],
    example: [
      'Arben', 'Gashi', '1234567890', '15/05/1990',
      'Mashkull', 'Prishtinë', 'Rruga e Dibrës 12', '+38344123456', 'arben.gashi@email.com',
      'KS Prishtina', 'true', 'Senior',
      'Pushkë Ajrore 10m', 'LIC-001', '31/12/2026', '',
      'false', '', '',
      'Anëtar Kuvendi', 'Komisioner',
      'Raiffeisen Bank', 'XK051212012345678906', 'RBKOXKPR',
      'Aktiv', '01/01/2023', ''
    ],
    fieldNotes: [
      { field: 'Gjinia', note: 'Mashkull / Femër' },
      { field: 'Është Shenjëtar', note: 'true / false' },
      { field: 'Kategoria', note: 'Pionier / Junior / Senior' },
      { field: 'Statusi', note: 'Aktiv / Joaktiv / I pezulluar / I transferuar' },
      { field: 'Data e Lindjes / Licenca Deri Më / Data e Regjistrimit', note: 'Formati: DD/MM/YYYY (p.sh. 15/05/1990) — Data e Regjistrimit mund të jetë në të kaluarën (BETA)' },
      { field: 'Pozitat në Klub', note: 'Kryetar / Nënkryetar / Sekretar / Anëtar Këshillit Drejtues / Anëtar Kuvendi / Trajner — nëse ka shumë, ndaji me presje: "Kryetar,Trajner"' },
      { field: 'Pozitat në Federatë', note: 'Kryetar / Nënkryetar / Sekretar / Anëtar Komisioni Disiplinor / Komisioner / Trajner / Refer / etj. — nëse ka shumë, ndaji me presje: "Komisioner,Trajner"' },
      { field: 'Disiplina', note: 'Pushkë Ajrore 10m / Pistoletë Ajrore 10m / Pushkë e Vogël 50m / etj. — nëse ka shumë, ndaji me presje: "Pushkë Ajrore 10m,Pistoletë Ajrore 10m"' },
      { field: 'Emri i Bankës / IBAN / SWIFT', note: 'Opsionale. IBAN dhe SWIFT shkruhen me shkronja të mëdha, pa hapësira.' },
    ],
  },
  {
    id: 'clubs',
    label: 'Klubet',
    icon: Building2,
    filename: 'template_klubet.xlsx',
    sheetName: 'Klubet',
    description: 'Template për importin e klubeve sportive',
    headers: [
      'Emri i Klubit', 'Qyteti', 'Numri i Regjistrimit',
      'Emri i Kryetarit', 'Emri i Nënkryetarit', 'Emri i Sekretarit',
      'Adresa', 'Telefoni', 'Email',
      'Viti i Themelimit', 'Statusi (active/inactive/suspended)', 'Shënime'
    ],
    example: [
      'KS Prishtina', 'Prishtinë', 'REG-2001-001',
      'Arben Gashi', 'Blerim Hoxha', 'Vjosa Krasniqi',
      'Rruga UÇK nr. 5', '+38344111222', 'ks.prishtina@email.com',
      '2001', 'active', ''
    ],
    fieldNotes: [
      { field: 'Statusi', note: 'active / inactive / suspended' },
      { field: 'Viti i Themelimit', note: 'Vetëm viti (p.sh. 2001)' },
    ],
  },
  {
    id: 'weapons',
    label: 'Armët',
    icon: Crosshair,
    filename: 'template_armet.xlsx',
    sheetName: 'Armët',
    description: 'Template për importin e armëve',
    headers: [
      'Kodi i Inventarit', 'Lloji i Armës', 'Disiplina',
      'Marka', 'Modeli', 'Kalibri', 'Numri Serik',
      'Pronësia (Klub/Federatë/Personale)',
      'Emri i Klubit Pronar', 'Emri i Personit Pronar',
      'Statusi (Aktive/Joaktive/E dëmtuar/E hequr nga përdorimi)', 'Shënime'
    ],
    example: [
      'INV-001', 'Pushkë Ajrore', 'Pushkë Ajrore 10m',
      'Anschütz', '8002', '4.5mm', 'SN-12345678',
      'Klub', 'KS Prishtina', '',
      'Aktive', ''
    ],
    fieldNotes: [
      { field: 'Lloji i Armës', note: 'Pushkë Ajrore / Pistoletë Ajrore / Pushkë e Vogël / Pistoletë Standarde / Pushkë 300m' },
      { field: 'Pronësia', note: 'Klub / Federatë / Personale' },
      { field: 'Statusi', note: 'Aktive / Joaktive / E dëmtuar / E hequr nga përdorimi' },
    ],
  },
];

export default function TemplatesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">Template-t për Import</h1>
      <p className="text-muted-foreground mb-8">
        Shkarko template-t Excel (.xlsx), plotësoji me të dhëna, pastaj importoji nga faqja përkatëse.
      </p>

      <div className="space-y-6">
        {TEMPLATES.map(tpl => {
          const Icon = tpl.icon;
          return (
            <Card key={tpl.id} className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {tpl.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tpl.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Kolonat ({tpl.headers.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.headers.map(h => (
                      <span key={h} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{h}</span>
                    ))}
                  </div>
                </div>

                {tpl.fieldNotes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Vlerat e pranuara</p>
                    <ul className="space-y-1">
                      {tpl.fieldNotes.map(n => (
                        <li key={n.field} className="text-xs">
                          <span className="font-semibold text-primary">{n.field}</span>
                          <span className="text-muted-foreground"> → {n.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => downloadExcel(tpl.filename, tpl.headers, tpl.example, tpl.sheetName)}>
                  <Download className="h-4 w-4 mr-2" />
                  Shkarko Template Excel — {tpl.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">Udhëzime për import:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Shkarko template-n Excel dhe hape me Microsoft Excel ose Google Sheets.</li>
          <li>Rreshti i parë janë titujt e kolonave — <strong>mos i ndrysho</strong>.</li>
          <li>Rreshti i dytë është shembull — fshije dhe fut të dhënat tuaja.</li>
          <li>Ruaje skedarin si <strong>.xlsx</strong> para importit.</li>
          <li>Importoje nga faqja përkatëse duke klikuar butonin <strong>"Importo nga Excel"</strong>.</li>
        </ol>
      </div>
    </div>
  );
}