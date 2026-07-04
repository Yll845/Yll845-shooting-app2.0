import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Building2, Users, Upload, Trophy,
  Medal, FileCheck, Shield, ChevronDown, ChevronUp, BookOpen,
  AlertTriangle, Info, CheckCircle2
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 1,
    icon: LayoutDashboard,
    title: 'Paneli Kryesor',
    badge: 'Hyrje',
    badgeColor: 'bg-blue-100 text-blue-800',
    summary: 'Pamja e parë që shfaqet pas hyrjes në sistem.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/8eb27d224_generated_image.png',
    sections: [
      {
        title: 'Çfarë shfaq Paneli?',
        items: [
          { label: 'Statistika kryesore', desc: 'Numri total i anëtarëve, klubeve aktive, garave dhe rezultateve të regjistruara.' },
          { label: 'Garat e ardhshme', desc: 'Lista e garave të planifikuara, me datë dhe vendndodhje.' },
          { label: 'Anëtarët e fundit', desc: 'Anëtarët e shtuar më së fundmi në sistem.' },
          { label: 'Rezultatet e fundit', desc: 'Rezultatet e regjistruara në garat e kaluara.' },
        ],
      },
      {
        title: 'Navigimi i sistemit',
        items: [
          { label: 'Shiriti i majtë (Sidebar)', desc: 'Klikimi mbi çdo ikonë apo emër moduli të shpie direkt te faqja e dëshiruar.' },
          { label: 'Minimizimi i shiritit', desc: 'Butonin me shigjetë në fund të shiritit e minimizon atë për hapësirë më të madhe pune.' },
          { label: 'Versioni mobil', desc: 'Në ekrane të vogla, shiriti hapet/mbyllet me butonin ☰ në këndin lart-majtas.' },
        ],
      },
    ],
    notes: [
      { type: 'info', text: 'Paneli rifresohet automatikisht — gjithmonë pasqyron gjendjen aktuale të sistemit pa pasur nevojë të shtypësh F5.' },
    ],
  },
  {
    id: 2,
    icon: Building2,
    title: 'Menaxhimi i Klubeve',
    badge: 'Hapi 1',
    badgeColor: 'bg-amber-100 text-amber-800',
    summary: 'Regjistro klubet sportive — duhet bërë PARA regjistrimit të anëtarëve.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/32e1f503c_generated_image.png',
    sections: [
      {
        title: 'Si të shtosh një klub të ri',
        items: [
          { label: 'Hapi 1.1', desc: 'Shko te moduli "Klubet" nga shiriti i majtë.' },
          { label: 'Hapi 1.2', desc: 'Kliko butonin "Shto Klub" (këndi lart-djathtas).' },
          { label: 'Hapi 1.3 – Të dhënat bazë', desc: 'Plotëso: Emri i Klubit (i detyrueshëm), Qyteti (i detyrueshëm), Numri i Regjistrimit, Viti i Themelimit.' },
          { label: 'Hapi 1.4 – Kontakti', desc: 'Shto adresën, numrin e telefonit dhe emailin e klubit.' },
          { label: 'Hapi 1.5 – Udhëheqja', desc: 'Cakto Kryetarin, Nënkryetarin dhe Sekretarin duke zgjedhur nga lista e anëtarëve. KUJDES: kjo bëhet pasi anëtarët janë regjistruar.' },
          { label: 'Hapi 1.6 – Trajnerët', desc: 'Mund të caktosh një ose shumë trajnerë nga lista e anëtarëve.' },
          { label: 'Hapi 1.7', desc: 'Kliko "Ruaj" — klubi shfaqet menjëherë në listën e klubeve.' },
        ],
      },
      {
        title: 'Redaktimi dhe fshirja e klubit',
        items: [
          { label: 'Redaktim', desc: 'Kliko ikonën e lapsit (✏️) pranë klubit në listë. Hapet e njëjta formë me të dhënat ekzistuese.' },
          { label: 'Fshirje', desc: 'Kliko ikonën e koshit (🗑️). Do të kërkohet konfirmim. KUJDES: fshirja e klubit nuk fshin anëtarët, por i lë pa klub.' },
          { label: 'Detajet e klubit', desc: 'Kliko ikonën e syrit (👁️) ose emrin e klubit për të parë profilin e plotë: anëtarët, shenjëtarët, historikun e garave.' },
        ],
      },
      {
        title: 'Statuset e klubit',
        items: [
          { label: 'active (Aktiv)', desc: 'Klubi është aktiv dhe anëtarët e tij mund të garojnë.' },
          { label: 'inactive (Joaktiv)', desc: 'Klubi nuk është aktiv — anëtarët shfaqen por nuk mund të regjistrohen në gara.' },
          { label: 'suspended (I pezulluar)', desc: 'Klubi është pezulluar me vendim të federatës.' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Klubet DUHET të regjistrohen para anëtarëve! Çdo anëtar lidhet me një klub gjatë regjistrimit — pa klub nuk mund të krijohet anëtar.' },
      { type: 'info', text: 'Udhëheqja e klubit (Kryetar, Nënkryetar etj.) mund të caktohet edhe pas regjistrimit të anëtarëve, duke redaktuar klubin.' },
    ],
  },
  {
    id: 3,
    icon: Users,
    title: 'Menaxhimi i Anëtarëve',
    badge: 'Hapi 2',
    badgeColor: 'bg-amber-100 text-amber-800',
    summary: 'Regjistro anëtarët, shenjëtarët dhe zyrtarët — plotëso TË GJITHA të dhënat e detyrueshme.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/91c1c520d_generated_image.png',
    sections: [
      {
        title: 'Të dhënat e detyrueshme (pa to, regjistrimi NUK mund të bëhet)',
        items: [
          { label: 'Emri dhe Mbiemri', desc: 'Emri dhe mbiemri i plotë i anëtarit — të dyja janë të detyrueshme.' },
          { label: 'Numri Personal', desc: 'Numri unik identifikues (p.sh. numri i ID-së).' },
          { label: 'Data e lindjes', desc: 'Formati: YYYY-MM-DD (p.sh. 1990-05-15).' },
          { label: 'Gjinia', desc: 'Zgjidh "Mashkull" ose "Femër" nga lista rënëse.' },
          { label: 'Qyteti', desc: 'Qyteti i vendbanimit.' },
          { label: 'Telefoni', desc: 'Numri i telefonit të kontaktit.' },
          { label: 'Email adresa', desc: 'Adresa e emailit personal.' },
          { label: 'Klubi', desc: 'Zgjidh klubin nga lista — duhet të ekzistojë paraprakisht.' },
          { label: 'Statusi', desc: 'Zgjidh statusin: Aktiv, Joaktiv, I pezulluar ose I transferuar.' },
          { label: 'Të paktën një pozitë në klub', desc: 'Duhet të zgjidhet minimalisht një rol në klub (p.sh. Anëtar Kuvendi). Pa këtë, butoni "Shto" nuk aktivizohet.' },
        ],
      },
      {
        title: 'Nëse anëtari është shenjëtar (garues)',
        items: [
          { label: 'Hapi 3.1', desc: 'Aktivizo opsionin "Është shenjëtar (garues)" duke klikuar kutinë e zgjedhjes.' },
          { label: 'Hapi 3.2 – Kategoria', desc: 'Zgjidh kategorinë e moshës: Pionier, Junior ose Senior.' },
          { label: 'Hapi 3.3 – Disiplinat', desc: 'Zgjidh një ose shumë disiplina (p.sh. Pushkë Ajrore 10m, Pistoletë Ajrore 10m). Mund të zgjidhen shumë njëherësh.' },
          { label: 'Hapi 3.4 – Licenca', desc: 'Plotëso numrin e licencës dhe datën e skadimit (opsionale, por e rekomanduar).' },
        ],
      },
      {
        title: 'Pozitat zyrtare',
        items: [
          { label: 'Pozitat në Klub', desc: 'Zgjidh një ose shumë: Kryetar, Nënkryetar, Sekretar, Anëtar Këshillit Drejtues, Anëtar Kuvendi, Trajner.' },
          { label: 'Pozitat në Federatë', desc: 'Opsionale: Kryetar, Nënkryetar, Sekretar, Komisioner, Trajner, Refer, Anëtar Komisioni Disiplinor, etj.' },
          { label: 'Role të shumëfishta', desc: 'Një anëtar mund të jetë njëkohësisht p.sh. Kryetar i Klubit DHE Shenjëtar DHE Anëtar i Komisionit të Federatës.' },
        ],
      },
      {
        title: 'Të dhëna bankare',
        items: [
          { label: 'Emri i Bankës', desc: 'Emri i institucionit bankar (p.sh. Raiffeisen Bank, ProCredit Bank). Fushë opsionale.' },
          { label: 'IBAN', desc: 'Numri ndërkombëtar i llogarisë bankare. Shkruhet me shkronja të mëdha, pa hapësira (p.sh. XK051212012345678906).' },
          { label: 'SWIFT / BIC', desc: 'Kodi ndërkombëtar i bankës (p.sh. RBKOXKPR). Shkruhet me shkronja të mëdha. Opsionale.' },
        ],
      },
      {
        title: 'Filtrimi dhe kërkimi',
        items: [
          { label: 'Kërkim me emër/licencë', desc: 'Fusha e kërkimit në krye të listës filtron automatikisht ndërkohë që shkruash.' },
          { label: 'Filter sipas rolit', desc: 'Zgjidh "Shenjëtarë", "Zyrtarë Klubi" ose "Zyrtarë Federatë".' },
          { label: 'Filter sipas klubit', desc: 'Zgjidh një klub specifik për të parë vetëm anëtarët e tij.' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Nëse ndonjë fushë e detyrueshme është e zbrazët OSE nuk është zgjedhur asnjë pozitë në klub, butoni "Shto" mbetet joaktiv dhe shfaqet mesazh gabimi me fushat që mungojnë.' },
      { type: 'info', text: 'ISSF ID është opsionale dhe plotësohet vetëm për sportistë të regjistruar në sistemin ndërkombëtar ISSF.' },
      { type: 'info', text: 'Për të mitur (nën 18 vjeç) aktivizo opsionin "I Mitur" dhe plotëso emrin dhe telefonin e kujdestarit ligjor.' },
    ],
  },
  {
    id: 4,
    icon: Upload,
    title: 'Import nga Excel',
    badge: 'Alternativë',
    badgeColor: 'bg-purple-100 text-purple-800',
    summary: 'Importo dhjetëra ose qindra rekorde njëherësh — alternativë ndaj shtimit manual.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/8524f89a9_generated_image.png',
    sections: [
      {
        title: 'Shkarkimi dhe plotësimi i template-s',
        items: [
          { label: 'Hapi 4.1', desc: 'Shko te "Tabelat për Import" nga shiriti i majtë.' },
          { label: 'Hapi 4.2', desc: 'Kliko "Shkarko Template Excel" për modulin e dëshiruar (Anëtarë, Klube ose Armë).' },
          { label: 'Hapi 4.3', desc: 'Hape skedarin në Microsoft Excel ose Google Sheets.' },
          { label: 'Hapi 4.4 – KRITIKE', desc: 'Rreshti i PARË janë titujt e kolonave — MOS I NDRYSHO asnjë titull, përndryshe importi dështon.' },
          { label: 'Hapi 4.5', desc: 'Rreshti i dytë është shembull — fshije dhe fillo të dhënat tuaja nga rreshti 2.' },
          { label: 'Hapi 4.6', desc: 'Ruaje skedarin si .xlsx (jo .csv apo .ods).' },
        ],
      },
      {
        title: 'Importimi i skedarit',
        items: [
          { label: 'Hapi 4.7', desc: 'Shko te faqja përkatëse (p.sh. "Anëtarët") dhe kliko "Importo nga Excel".' },
          { label: 'Hapi 4.8', desc: 'Kliko zonën e ngarkimit ose tërhiq skedarin mbi të.' },
          { label: 'Hapi 4.9 – Parapamja', desc: 'Sistemi shfaq 5 rreshtat e parë si parapamje — kontrolloji para se të konfirmosh.' },
          { label: 'Hapi 4.10', desc: 'Kliko "Importo N rekorde" — sistemi i ruan njëra pas tjetrës dhe tregon numrin e suksesshmëve/dështimeve.' },
        ],
      },
      {
        title: 'Rregulla për vlera speciale',
        items: [
          { label: 'Vlera booleane', desc: '"Është Shenjëtar" dhe "I Mitur": shkruaj true ose false (me shkronja të vogla).' },
          { label: 'Data', desc: 'Formati i vetëm i pranuar: YYYY-MM-DD  (p.sh. 1990-05-15).' },
          { label: 'Pozitat e shumëfishta', desc: 'Ndaji me presje pa hapësirë para: p.sh. "Kryetar,Anëtar Kuvendi" ose "Kryetar, Anëtar Kuvendi".' },
          { label: 'Disiplinat e shumëfishta', desc: 'Ngjashëm: "Pushkë Ajrore 10m,Pistoletë Ajrore 10m".' },
          { label: 'Fushat bosh', desc: 'Lëri bosh — sistemi i injoron automatikisht.' },
          { label: 'Të dhënat bankare', desc: 'Kolonat "Emri i Bankës", "IBAN" dhe "SWIFT" mund të plotësohen opsionalisht në Excel. IBAN-i dhe SWIFT-i konvertohen automatikisht në shkronja të mëdha.' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Për importin e anëtarëve, klubi i referuar në kolonën "Emri i Klubit" duhet të ekzistojë tashmë në sistem. Importi i anëtarëve PARA klubeve shkakton gabime.' },
      { type: 'info', text: 'Importi i shumëfishtë është kumulativ — çdo import shton rekorde të reja. Nëse bën import dy herë me të njëjtët të dhëna, do të krijohen duplikate.' },
    ],
  },
  {
    id: 5,
    icon: Trophy,
    title: 'Krijimi dhe Menaxhimi i Garave',
    badge: 'Hapi 3',
    badgeColor: 'bg-amber-100 text-amber-800',
    summary: 'Krijo garë me magjistar 5-hapësh dhe menaxho statusin e saj gjatë gjithë procesit.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/705a4f6cd_generated_image.png',
    sections: [
      {
        title: 'Magjistari i krijimit (5 hapa)',
        items: [
          { label: 'Hapi 1 – Bazat', desc: 'Emri i garës (i detyrueshëm), lloji (Kampionat Kombëtar, Kupë, Garë Miqësore etj.), organizatori, datat e fillimit/mbarimit, afati i regjistrimit, vendndodhja dhe qyteti.' },
          { label: 'Hapi 2 – Eventet', desc: 'Shto eventet: zgjidh Disiplinën + Gjininë + Kategorinë e Moshës dhe kliko "Shto Event". Mund të shtosh shumë evente (p.sh. Pushkë Ajrore 10m – Meshkuj – Senior, Pistoletë – Femra – Junior etj.).' },
          { label: 'Hapi 3 – Ndërrimet', desc: 'Shto ndërrimet (relay) me orarin e planifikuar të secilit. Çdo ndërrim mund të strehojë numër të caktuar garuesish sipas pistave të disponueshme.' },
          { label: 'Hapi 4 – Zyrtarët', desc: 'Cakto: Kryesuesin e Garës, Referin Kryesor, Referët Ndihmës dhe 3 anëtarët e Komisionit të Ankesave. Të gjitha pozitat kërkohen.' },
          { label: 'Hapi 5 – Rishikim', desc: "Kontrollo të gjitha të dhënat. Nëse duhet ndryshim, kliko \"Mbrapa\" për t'u kthyer." },
          { label: 'Përfundim', desc: 'Kliko "Krijo Garën" — gara krijohet me statusin "Planifikuar" dhe shfaqet në listë.' },
        ],
      },
      {
        title: 'Çfarë është Eventi dhe si krijohet',
        items: [
          { label: 'Përkufizimi i Eventit', desc: 'Eventi është kombinimi unik i Disiplinës + Gjinisë + Kategorisë së Moshës (p.sh. "Pushkë Ajrore 10m – Meshkuj – Senior"). Çdo event ka listën e vet të garuesve dhe rezultateve.' },
          { label: 'Disiplina', desc: 'Zgjidhni disiplinën e shënjetarisë: Pushkë Ajrore Serike 10m, Pushkë Ajrore Standarde 10m, Pistoletë Ajrore 10m, Pushkë e Vogël 50m, Pistoletë 25m, etj.' },
          { label: 'Gjinia', desc: 'Zgjidhni "Meshkuj" ose "Femra" — garuesit duhet të përputhen me gjininë e eventit.' },
          { label: 'Kategoria e moshës', desc: 'Zgjidhni "Pionier" (nën 16 vjeç), "Junior" (16-20 vjeç) ose "Senior" (21+ vjeç) — sistemi llogarit automatikisht moshën e secilit garues nga data e lindjes.' },
          { label: 'Si të shtosh Event', desc: 'Gjatë krijimit të garës (Hapi 2) ose në faqen e detajeve → skeda "Eventet": zgjidh vlerat dhe kliko "Shto Event".' },
          { label: 'Shumë evente', desc: 'Mund të ketë shumë evente brenda një gare. P.sh.: (1) Pushkë Ajrore – Meshkuj – Senior, (2) Pushkë Ajrore – Femra – Senior, (3) Pistoletë – Meshkuj – Junior.' },
        ],
      },
      {
        title: 'Si të ndryshosh statusin e garës',
        items: [
          { label: 'Ku ndodhet butoni', desc: 'Hyr te "Garat" → kliko emrin e garës për të hapur faqen e detajeve. Në këndin lart-djathtas të kartës kryesore do të gjesh butonin e tranzicionit (p.sh. "Hap Regjistrimin", "Fillo Garën", "Finalizo Garën").' },
          { label: 'Konfirmim para ndryshimit', desc: "Pasi të klikosh butonin, hapet një dritare konfirmimi që tregon kushtet e plotësuara dhe kushtet që mungojnë. Mund të vazhdosh edhe nëse disa kushte nuk janë plotësuar, por rekomandohet t'i rregullosh fillimisht." },
          { label: 'Sinjalizues vizual', desc: 'Nëse butoni ka ikonën ⚠️ (trekëndësh i verdhë), do të thotë se jo të gjitha kushtet janë plotësuar për kalimin në atë status.' },
        ],
      },
      {
        title: 'Statuset e garës — radhitja',
        items: [
          { label: '1 → Planifikuar', desc: 'Statusi fillestar kur krijohet gara. Regjistrimi i pjesëmarrësve NUK është i hapur ende.' },
          { label: '2 → Regjistrimi i hapur', desc: 'Klikoni "Hap Regjistrimin" në faqen e detajeve. Kërkon: të paktën 1 event, 1 ndërrim, dhe Kryesuesin + Referin Kryesor të caktuar.' },
          { label: '3 → Në zhvillim', desc: 'Klikoni "Fillo Garën". Kërkon: të paktën 1 garues të regjistruar dhe të gjithë garuesit me ndërrim/pozicion të caktuar.' },
          { label: '4 → Përfunduar', desc: 'Klikoni "Finalizo Garën". Kërkon: të gjitha rezultatet të jenë me status "Final".' },
          { label: '5 → Anuluar', desc: 'Klikoni "Anulo Garën" (buton me kufi të kuq). Mund të bëhet nga çdo status.' },
        ],
      },
      {
        title: 'Regjistrimi i garuesve — hap pas hapi',
        items: [
          { label: 'Kur lejohet regjistrimi', desc: 'Regjistrimi i garuesve LEJOHET VETËM kur statusi i garës është "Regjistrimi i hapur". Nëse statusi është "Planifikuar", fillimisht duhet të klikosh butonin "Hap Regjistrimin".' },
          { label: 'Ku bëhet regjistrimi', desc: 'Shko te detajet e garës → skeda "Garuesit" → kliko butonin "Shto garues".' },
          { label: 'Hapi 1 – Zgjidh Eventin', desc: 'Fillimisht zgjidh eventin (p.sh. "Pushkë Ajrore 10m / Meshkuj / Senior") nga lista rënëse. Pa zgjedhur eventin, nuk mund të zgjidhësh sportisin.' },
          { label: 'Hapi 2 – Zgjidh Sportisin', desc: 'Lista e sportistëve filtrohet AUTOMATIKISHT: shfaqen VETËM sportistët që plotësojnë TË GJITHA këto kushte: (1) kanë armë aktive për disiplinën e eventit, (2) gjinia përputhet, (3) kategoria e moshës përputhet.' },
          { label: 'Shembull praktik', desc: 'Nëse eventi është "Pushkë Ajrore 10m – Meshkuj – Junior", shfaqen vetëm meshkujt me moshë 16-20 vjeç që kanë armë aktive të disiplinës "Pushkë Ajrore".' },
          { label: 'Kliko "Shto"', desc: 'Pasi të zgjidhësh eventin dhe sportisin, kliko butonin "Shto" — sportisti shfaqet menjëherë në listën e garuesve.' },
        ],
      },
      {
        title: 'Kushtet e përshtatshmërisë për regjistrim',
        items: [
          { label: 'Arma aktive', desc: 'Sportisti DUHET të ketë armë aktive të caktuar për disiplinën e eventit. Shko te "Armët" → "Cakto armë" nëse mungon.' },
          { label: 'Disiplina e armës', desc: 'Disiplina e armës (Pushkë Ajrore, Pistoletë Ajrore, etj.) duhet të përputhet me disiplinën e eventit.' },
          { label: 'Gjinia', desc: 'Gjinia e sportistit (Mashkull/Femër) duhet të përputhet me gjininë e eventit (Meshkuj/Femra).' },
          { label: 'Kategoria e moshës', desc: 'Mosha e sportistit llogaritet automatikisht nga data e lindjes: Pionier (<16), Junior (16-20), Senior (21+). Kategoria duhet të përputhet me atë të eventit.' },
          { label: 'Sportist i regjistruar tashmë?', desc: 'Nëse sportisti është regjistruar tashmë në atë event, nuk shfaqet më në listë — nuk lejohet regjistrim i dyfishtë.' },
        ],
      },
      {
        title: 'Nëse nuk shfaqen sportistë në listë',
        items: [
          { label: 'Kontrollo armët', desc: 'Shko te moduli "Armët" dhe verifiko nëse sportistëve u është caktuar armë aktive për disiplinën përkatëse.' },
          { label: 'Kontrollo gjininë', desc: 'Sigurohu që sportisti është regjistruar me gjininë e saktë (Mashkull/Femër) në profilin e tij.' },
          { label: 'Kontrollo datën e lindjes', desc: 'Nëse sportisti duhet të jetë Junior por shfaqet si Senior, ndoshta data e lindjes është gabim — korrigjo te "Anëtarët".' },
          { label: 'Mesazhi i sistemit', desc: 'Nëse nuk ka sportistë të përshtatshëm, sistemi shfaq mesazhin: "Nuk ka sportistë të përshtatshëm (Disiplina / Gjinia / Kategoria)".' },
        ],
      },
      {
        title: 'Prezenca dhe menaxhimi pas regjistrimit',
        items: [
          { label: 'Statuset e prezencës', desc: 'Çdo garues ka statusin: "Regjistruar" (fillestar), "Prezent" (konfirmuar ditën e garës), "Mungon" (nuk u paraqit).' },
          { label: 'Konfirmo prezencën', desc: 'Ditën e garës, kliko ikonën ✓ (jeshile) pranë secilit garues për ta shënuar si "Prezent".' },
          { label: 'Shëno mungesën', desc: 'Kliko ikonën ✗ (e kuqe) për ta shënuar si "Mungon" — garuesi mbetet në listë por nuk merr pikë.' },
          { label: 'Konfirmo të gjithë', desc: 'Butoni "Konfirmo prezencën" i shënon si "Prezent" të gjithë garuesit njëherësh.' },
          { label: 'Hiq garusin', desc: 'Nëse është regjistruar gabimisht, kliko ikonën e koshit 🗑️ për ta hequr nga lista.' },
        ],
      },
      {
        title: 'Seeding automatik dhe rregullim manual (Drag & Drop)',
        items: [
          { label: 'Seeding automatik', desc: 'Butoni "Seeding automatik" (këndi lart-djathtas i faqes së garës) shpërndan të gjithë garuesit automatikisht nëpër ndërrime dhe pozicione, sipas prioritetit të disiplinës.' },
          { label: 'Kur të përdoret Seeding', desc: 'Rekomandohet të bëhet pasi të jenë regjistruar të gjithë garuesit dhe të jenë krijuar ndërrimet. Seeding-u rishkruan caktimet ekzistuese.' },
          { label: 'Rregullim manual — Drag & Drop', desc: 'Pas seeding-ut automatik, shko tek skeda "Ndërrimet". Çdo garues ka ikonën ☰ (grip) — kliko dhe tërhiqe drejt pozicionit ose ndërrimit të dëshiruar.' },
          { label: 'Shkëmbim automatik', desc: 'Nëse pozicioni i destinacionit është i zënë, sistemi i shkëmben automatikisht dy garuesit mes veti — nuk humbet asnjë caktim.' },
          { label: 'Ruajtje automatike', desc: 'Çdo lëvizje me drag & drop ruhet menjëherë në databazë — nuk nevojitet buton "Ruaj".' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Regjistrimi i garuesve lejohet VETËM kur statusi i garës është "Regjistrimi i hapur". Nëse butoni "Shto garues" nuk shfaqet, sigurohu që e ke hapur regjistrimin.' },
      { type: 'warning', text: "Sportisti DUHET të ketë armë aktive të disiplinës së eventit për t'u shfaqur në listën e sportistëve të disponueshëm." },
      { type: 'warning', text: 'Statusi i garës ndryshon MANUALISHT — sistemi nuk e ndryshon automatikisht bazuar në datë. Butoni ndodhet në këndin lart-djathtas të faqes së detajeve.' },
      { type: 'info', text: 'Eventet mund të shtohen/ndryshohen edhe pas krijimit të garës, nëse statusi është ende "Planifikuar" ose "Regjistrimi i hapur".' },
      { type: 'info', text: 'Zyrtarët e garës (referët etj.) duhet të jenë anëtarë të regjistruar në sistem me rol "Refer" ose "Komisioner" në federatë.' },
      { type: 'info', text: 'Seeding automatik + Drag & Drop janë komplementare: bëj seeding fillimisht, pastaj rregulloje manualisht çdo ndryshim specifik.' },
    ],
  },
  {
    id: 6,
    icon: Medal,
    title: 'Vendosja e Rezultateve',
    badge: 'Hapi 4',
    badgeColor: 'bg-amber-100 text-amber-800',
    summary: 'Regjistro, kontrollo dhe finalizo rezultatet e garave.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/cc230a579_generated_image.png',
    sections: [
      {
        title: 'Si të vendosësh rezultate',
        items: [
          { label: 'Hapi 6.1', desc: 'Hyr në detajet e garës dhe kliko skedën "Rezultatet".' },
          { label: 'Hapi 6.2', desc: 'Zgjidh eventin nga lista rënëse (disiplina + gjinia + kategoria) — sistemi adapton automatikisht numrin e raundeve dhe fushat sipas disiplinës.' },
          { label: 'Hapi 6.3', desc: 'Plotëso pikët e serisë për secilin pjesëmarrës. Totali llogaritet automatikisht.' },
          { label: 'Hapi 6.4', desc: 'Rezultati ruhet me status "Provizor" — mund të ndryshohet derisa të finalizohet.' },
          { label: 'Hapi 6.5 – Finalizim', desc: 'Pasi të gjitha rezultatet janë korrektuara, kliko "Finalizo Eventin". Renditja gjenerohet automatikisht dhe rezultatet bllokohen.' },
        ],
      },
      {
        title: 'Rregullat sipas disiplinës',
        items: [
          { label: 'Pushkë Ajrore Serike 10m', desc: '5 raunde. Pa dhjetore (numra të plotë). Pa kolonë X.' },
          { label: 'Pushkë Ajrore Standarde 10m', desc: '6 raunde. Lejohen dhjetoret (p.sh. 104.5). Pa kolonë X.' },
          { label: 'Pistoletë Ajrore Standarde 10m', desc: '6 raunde. Pa dhjetore. Kërkohet numri i X-ave (qendrave).' },
          { label: 'Pushkë e Vogël Standarde 50m', desc: '6 raunde. Lejohen dhjetoret. Pa kolonë X.' },
          { label: 'Pistoletë Standarde 25m', desc: '6 raunde. Pa dhjetore. Kërkohet numri i X-ave (qendrave).' },
          { label: 'Pushkë 300m / Trap / Skeet', desc: '6 raunde. Pa dhjetore. Pa kolonë X.' },
        ],
      },
      {
        title: 'Statuset e rezultateve',
        items: [
          { label: 'Provizor', desc: 'Rezultati është vendosur por mund të ndryshohet. Nuk është zyrtar ende.' },
          { label: 'Final', desc: 'Rezultati është finalizuar. NUK mund të ndryshohet pa autorizim special. Renditja është zyrtare.' },
        ],
      },
      {
        title: 'Shikimi i rezultateve nga moduli "Rezultatet"',
        items: [
          { label: 'Filtrim sipas garës', desc: 'Zgjidh garën nga lista rënëse për të parë vetëm rezultatet e saj.' },
          { label: 'Kërkim', desc: 'Kërko sipas emrit të sportistit ose klubit.' },
          { label: 'Renditja', desc: 'Rezultatet renditen automatikisht nga pikët më të larta tek më të ulëtat. Vendi i parë, i dytë dhe i tretë shfaqen me ngjyrë të veçantë.' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Pasi rezultati finalizohet, nuk mund të ndryshohet. Kontrollo me kujdes para se të klikosh "Finalizo".' },
      { type: 'info', text: 'Nëse shenjëtari nuk ka armë aktive të caktuar, sistemi tregon paralajmërim. Cakto armën nga moduli "Armët" → "Cakto armë" para se të finalizosh rezultatin.' },
    ],
  },
  {
    id: 7,
    icon: FileCheck,
    title: 'Licencimi',
    badge: 'Shtesë',
    badgeColor: 'bg-green-100 text-green-800',
    summary: 'Menaxho licencat vjetore të klubeve dhe sportistëve sipas sezonit.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/c10216eec_generated_image.png',
    sections: [
      {
        title: 'Licencat e Klubeve',
        items: [
          { label: 'Hapi 7.1', desc: 'Shko te "Licencimi" → skeda "Licencat e Klubeve".' },
          { label: 'Hapi 7.2', desc: 'Kliko "Shto Licencë të Re" dhe zgjidh klubin.' },
          { label: 'Hapi 7.3', desc: 'Cakto stinosin (p.sh. 2026), datën nga/deri të vlefshmërisë.' },
          { label: 'Hapi 7.4', desc: 'Shëno nëse tarifa është paguar (Po/Jo) dhe datën e pagesës.' },
          { label: 'Statusi', desc: 'Aktive = e vlefshme / Skaduar = ka kaluar data / I pezulluar = pezulluar me vendim.' },
        ],
      },
      {
        title: 'Licencat e Sportistëve',
        items: [
          { label: 'Hapi 7.5', desc: 'Shko te skeda "Licencat e Sportistëve".' },
          { label: 'Hapi 7.6', desc: 'Kliko "Shto Licencë" dhe zgjidh anëtarin (sportistin).' },
          { label: 'Hapi 7.7', desc: 'Cakto disiplinën specifike (p.sh. Pushkë Ajrore 10m), stinosin, klubi licencues dhe datat.' },
          { label: 'Hapi 7.8', desc: 'Shëno pagesën dhe ruaj.' },
        ],
      },
      {
        title: 'Monitorimi i licencave',
        items: [
          { label: 'Licencat e skaduara', desc: "Shfaqen automatikisht me ngjyrë të kuqe/portokalli — e lehtë për t'i identifikuar." },
          { label: 'Rinovimi', desc: 'Shto licencë të re për sezonin e ri (sistemi ruan historikun e të gjitha licencave të mëparshme).' },
          { label: 'Filtrimi', desc: 'Mund të filtrosh licencat sipas sezonit, klubit ose statusit.' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Licencat e klubeve dhe sportistëve janë të ndara — klubi mund të ketë licencë aktive por sportisti jo, dhe anasjelltas.' },
      { type: 'info', text: 'Rekomandohet të lëshohen licencat e reja të sezonit para datës 1 janar të çdo viti.' },
    ],
  },
  {
    id: 8,
    icon: Shield,
    title: 'Menaxhimi i Përdoruesve',
    badge: 'Admin',
    badgeColor: 'bg-red-100 text-red-800',
    summary: 'Kontrollo aksesin dhe rolet e përdoruesve të sistemit — vetëm për Admin.',
    image: 'https://media.base44.com/images/public/69df9fccf32cf3a985485ff9/b0c8aa73a_generated_image.png',
    sections: [
      {
        title: 'Rolet dhe aksesi',
        items: [
          { label: 'Super Admin', desc: 'Akses i plotë: mund të menaxhojë çdo modul, të ftojë çdo rol dhe të ndryshojë rolet e të gjithë përdoruesve.' },
          { label: 'Admin', desc: 'Akses gati i plotë: mund të ftojë "Administrator Gare" dhe "Club User". Nuk mund të krijojë Super Admin tjetër (vetëm nëse nuk ekziston asnjë).' },
          { label: 'Administrator i Garës', desc: 'Mund të menaxhojë garat, rezultatet dhe regjistrimet. Nuk ka akses te moduli i Përdoruesve.' },
          { label: 'Club User', desc: 'Akses i kufizuar — mund të shohë të dhënat por ka mundësi të kufizuara editimi.' },
        ],
      },
      {
        title: 'Si të ftosh një përdorues të ri',
        items: [
          { label: 'Hapi 8.1', desc: 'Shko te "Përdoruesit" nga shiriti i majtë (shfaqet vetëm për Admin dhe Super Admin).' },
          { label: 'Hapi 8.2', desc: 'Kliko "Fto përdorues" në këndin lart-djathtas.' },
          { label: 'Hapi 8.3', desc: 'Shkruaj emailin e personit dhe zgjidh rolin e duhur.' },
          { label: 'Hapi 8.4', desc: 'Kliko "Dërgo ftesën" — personi merr email automatik me lidhje aktivizimi.' },
          { label: 'Hapi 8.5', desc: 'Personi i ftuar klikon lidhjen në email, krijon fjalëkalimin dhe mund të hyjë në sistem.' },
        ],
      },
      {
        title: 'Ndryshimi i roleve',
        items: [
          { label: 'Ndryshim roli', desc: 'Super Admin mund të ndryshojë rolin e çdo përdoruesi duke klikuar listën rënëse pranë emrit të tij.' },
          { label: 'Degradim', desc: 'Mund të ul rolin e një Admin në "Club User" nëse nevojitet.' },
          { label: 'Fshirje', desc: 'Aktualisht, fshirja e përdoruesve bëhet nga paneli i administratorit të platformës.' },
        ],
      },
    ],
    notes: [
      { type: 'warning', text: 'Sistemi kërkon të paktën një Super Admin aktiv gjithmonë. Nëse je i vetmi Super Admin, nuk mund ta ulësh rolin tënd.' },
      { type: 'warning', text: 'Fto vetëm persona të besuar — "Super Admin" dhe "Admin" kanë akses të gjerë, përfshirë fshirjen e të dhënave.' },
    ],
  },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function NoteBox({ type, text }) {
  if (type === 'warning') {
    return (
      <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <span><strong>Kujdes:</strong> {text}</span>
      </div>
    );
  }
  return (
    <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
      <span><strong>Info:</strong> {text}</span>
    </div>
  );
}

function StepSection({ section }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground border-b pb-1">{section.title}</p>
      <ul className="space-y-2">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">{item.label}:</strong>{' '}
              <span className="text-foreground/80">{item.desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function DoracakPage() {
  const [expanded, setExpanded] = useState(null);
  const toggle = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Doracak i Sistemit</h1>
          <p className="text-muted-foreground text-sm">Udhëzues i detajuar hap-pas-hapi për platformën FSHSK</p>
        </div>
      </div>

      {/* Intro */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 mt-6 text-sm text-foreground/80">
        <strong>Si të përdoret ky doracak:</strong> Kliko mbi çdo modul për të zgjeruar udhëzimet e detajuara.
        Modulet janë renditur sipas radhës së rekomanduar të punës — fillimi me klubet, pastaj anëtarët, mandej garat.
        Seksionet e shënuara me <AlertTriangle className="inline h-3.5 w-3.5 text-amber-600 mx-0.5" /> janë të rëndësishme dhe duhen lexuar me kujdes.
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isOpen = expanded === step.id;
          return (
            <Card key={step.id} className={`border overflow-hidden transition-shadow duration-200 ${isOpen ? 'shadow-md' : 'shadow-sm'}`}>
              <button className="w-full text-left" onClick={() => toggle(step.id)}>
                <div className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{step.title}</span>
                      <Badge className={`text-[10px] ${step.badgeColor}`}>{step.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.summary}</p>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </button>

              {isOpen && (
                <CardContent className="border-t bg-muted/10 px-4 pb-6 pt-4">
                  <div className="grid md:grid-cols-5 gap-6">
                    <div className="md:col-span-3 space-y-5">
                      {step.sections.map((section, si) => (
                        <StepSection key={si} section={section} />
                      ))}
                      {step.notes && step.notes.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {step.notes.map((note, ni) => (
                            <NoteBox key={ni} type={note.type} text={note.text} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Ilustrim</p>
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full rounded-xl border shadow-sm object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Federata e Shënjetarisë Sportive e Kosovës — Sistem i Menaxhimit</p>
        <p className="mt-1">Për ndihmë teknike, kontaktoni administratorin e sistemit.</p>
      </div>
    </div>
  );
}