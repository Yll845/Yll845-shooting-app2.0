import React from 'react';

const problems = [
  { before: "Regjistrat me letër / Excel të shpërndarë", after: "Gjithçka e centralizuar dixhitalisht" },
  { before: "Të dhënat humbasin ose ngatërrohen", after: "Cloud — nuk humbasin kurrë" },
  { before: "Garat organizohen me email/WhatsApp", after: "Magjistar automatik i garave" },
  { before: "Financat pa kontroll dhe transparencë", after: "Raporte të plota financiare në çast" },
  { before: "Licencat skadojnë pa u vënë re", after: "Ndjekje automatike e skadimeve" },
  { before: "Nuk ka historik të sportistëve", after: "Profil i plotë me një klik" },
];

const modules = [
  { icon: "👥", title: "Anëtarët", desc: "Profil i plotë — foto, klub, role, licencë dhe historik transfertash.", features: ["Importim nga Excel", "Filtrim sipas rolit / klubit", "Profile individuale të plota"] },
  { icon: "🎯", title: "Garat", desc: "Magjistar hap-pas-hapi, caktim automatik ndërrimesh dhe pozicioneve.", features: ["Magjistar krijimi", "Caktim automatik pozicionesh", "Printim startlistash"] },
  { icon: "📄", title: "Licencat", desc: "Licenca për klube dhe sportistë, ndjekje skadimesh, konfirmim pagesash.", features: ["Licenca sportistësh & klubesh", "Ndjekje automatike skadimesh", "Raporte sezoni"] },
  { icon: "💶", title: "Financat", desc: "Fatura dhe pagesa hyrëse/dalëse, gjendja bankare, raporte Excel.", features: ["Fatura hyrëse/dalëse", "Gjendja bankare live", "Eksportim Excel i filtruar"] },
  { icon: "🔫", title: "Armët", desc: "Inventar i plotë, caktim tek sportistët, historiku dhe statusi.", features: ["Inventar i plotë", "Caktim tek sportistë", "Gjurmim statusi i çdo arme"] },
  { icon: "🏆", title: "Rezultatet", desc: "Regjistrim dhe publikim rezultatesh, statistika historike ndër sezone.", features: ["Regjistrim seriesh", "Renditje automatike", "Statistika historike"] },
];

export default function Prezantim() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page { page-break-after: always; break-after: page; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        <button
          onClick={() => window.print()}
          style={{ background: '#1a2744', color: '#f8d84a', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
        >
          🖨️ Printo / Ruaj si PDF
        </button>
      </div>

      {/* ══ FAQJA 1: KOPERTINË ══ */}
      <div className="page" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0c1830 0%,#1a2e5a 55%,#0c1830 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -140, right: -140, width: 560, height: 560, borderRadius: '50%', border: '1px solid rgba(248,216,74,0.1)', background: 'rgba(248,216,74,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -180, left: -180, width: 660, height: 660, borderRadius: '50%', border: '1px solid rgba(248,216,74,0.07)', background: 'rgba(248,216,74,0.02)' }} />

        <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'rgba(248,216,74,0.15)', border: '3px solid #f8d84a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, margin: '0 auto 36px', position: 'relative', zIndex: 1 }}>🎯</div>
        <div style={{ color: '#f8d84a', fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, position: 'relative', zIndex: 1 }}>OFERTË PROFESIONALE — MAJ 2026</div>
        <h1 style={{ color: '#fff', fontSize: 54, fontWeight: 800, lineHeight: 1.1, marginBottom: 22, position: 'relative', zIndex: 1 }}>
          Sistemi Dixhital i<br /><span style={{ color: '#f8d84a' }}>Shenjëtarisë Sportive</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 19, lineHeight: 1.65, marginBottom: 52, position: 'relative', zIndex: 1 }}>
          Platforma e menaxhimit të plotë për<br />
          <strong style={{ color: '#fff' }}>Federatën e Shenjëtarisë Sportive të Kosovës</strong>
        </p>

        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52, position: 'relative', zIndex: 1 }}>
          {[{ num: '56+', lbl: 'Anëtarë aktualë' }, { num: '10', lbl: 'Klube aktive' }, { num: '6', lbl: 'Module funksionale' }, { num: '100%', lbl: 'Cloud & dixhital' }].map(s => (
            <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 14, padding: '20px 32px', textAlign: 'center', minWidth: 120 }}>
              <div style={{ color: '#f8d84a', fontSize: 36, fontWeight: 800 }}>{s.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 28, color: 'rgba(255,255,255,0.5)', fontSize: 14, position: 'relative', zIndex: 1 }}>
          Drejtuar: <strong style={{ color: '#fff' }}>Z. Gëzim Hazrolli, Kryetar — FSHSK</strong> &nbsp;|&nbsp; Maj 2026
        </div>
      </div>

      {/* ══ FAQJA 2: PROBLEMI / ZGJIDHJA + MODULET ══ */}
      <div className="page" style={{ minHeight: '100vh', padding: 60, background: '#f5f7fc' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#1a2744', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>ÇFARË ZGJIDHIM</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Problemi i Sotëm → Zgjidhja</div>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 40 }}>Nga kaosi i Excel-it dhe letrës — tek sistemi profesional dixhital</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 48 }}>
          {problems.map((p, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: '0 1px 5px rgba(0,0,0,0.07)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>✕ TANI</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{p.before}</div>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 18, alignSelf: 'center', flexShrink: 0 }}>→</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#16a34a', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>✓ ME SISTEMIN</div>
                <div style={{ fontSize: 13, color: '#0f1c3d', fontWeight: 500 }}>{p.after}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#1a2744', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>MODULET</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>6 Module të Integruara</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {modules.map((m, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 26, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{m.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{m.title}</div>
              <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{m.desc}</div>
              {m.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', marginBottom: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#16a34a', fontWeight: 800, flexShrink: 0 }}>✓</div>
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ FAQJA 3: PAMJET E NDËRFAQES ══ */}
      <div className="page" style={{ minHeight: '100vh', padding: 60, background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: '#1a2744', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>PAMJET E VËRTETA</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Ndërfaqja e Sistemit</div>
          <p style={{ color: '#64748b', fontSize: 16 }}>Mock-up i saktë i moduleve kryesore</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
          {/* Members */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>👥</div>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>Anëtarët</div><div style={{ color: '#64748b', fontSize: 12 }}>Menaxhim i plotë</div></div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ background: '#f8f9fc', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div><div style={{ fontWeight: 800, fontSize: 20, color: '#0f1c3d' }}>Anëtarët</div><div style={{ color: '#64748b', fontSize: 12 }}>56 anëtarë</div></div>
                  <div style={{ background: '#1a2744', color: '#f8d84a', padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>+ Shto</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  {[['SI','Shefqet Ismajli','Dardania'],['AH','Afrim Hajdari','Zenel Hajdini'],['BI','Betim Ismajli','Hajvalia'],['AR','Arben Rrustemi','Policia e Kosovës']].map(([init,name,club],i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderBottom: i<3?'1px solid #f1f5f9':'none' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1a2744', color: '#f8d84a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{init}</div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div><div style={{ color: '#94a3b8', fontSize: 11 }}>{club}</div></div>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>Aktiv</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Finance */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>💶</div>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>Financat</div><div style={{ color: '#64748b', fontSize: 12 }}>Kontroll i plotë financiar</div></div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ background: '#f8f9fc', padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#0f1c3d', marginBottom: 4 }}>Financat</div>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>Fatura dhe pagesa hyrëse/dalëse</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[['Pagesa Hyrëse','€30,200','#16a34a'],['Pagesa Dalëse','€160','#dc2626'],['Arka','€500','#0f1c3d'],['NLB Banka','€45,182','#0f1c3d']].map(([lbl,val,col],i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4 }}>{lbl}</div>
                      <div style={{ color: col, fontWeight: 700, fontSize: 16 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#1a2744', color: '#f8d84a', textAlign: 'center', padding: 9, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>📊 Eksporto Raportin Excel</div>
              </div>
            </div>
          </div>

          {/* Weapons */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>🔫</div>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>Armët</div><div style={{ color: '#64748b', fontSize: 12 }}>Inventar dhe caktim</div></div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ background: '#f8f9fc', padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['Walther LG400','Pushkë Ajrore','SN: KBB9496'],['Walther LP500','Pistoletë Ajrore','SN: KHA3054']].map(([name,type,sn],i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: 14 }}>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Aktive</span>
                        <span style={{ background: '#eff6ff', color: '#3b4f8a', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{type}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{sn}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 5, padding: '4px 10px', fontSize: 10, fontWeight: 500 }}>Cakto</div>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 5, padding: '4px 10px', fontSize: 10, fontWeight: 500 }}>Historia</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>🎯</div>
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>Garat</div><div style={{ color: '#64748b', fontSize: 12 }}>Organizim i plotë</div></div>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ background: '#f8f9fc', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, color: '#0f1c3d' }}>Garat</div>
                  <div style={{ background: '#1a2744', color: '#f8d84a', padding: '5px 12px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>+ Krijo</div>
                </div>
                {[['Kampionati Kombëtar 2026','15 Qershor 2026','Kampionat','#eff6ff','#3b82f6','Planifikuar'],['Kupa e Kosovës 2026','20 Maj 2026','Kupë','#dcfce7','#16a34a','Përfunduar']].map(([name,date,type,bg,col,status],i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '12px 14px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div><div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div><div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>📅 {date} | {type}</div></div>
                      <span style={{ background: bg, color: col, fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ background: '#0f1c3d', borderRadius: 16, padding: '36px 40px' }}>
          <h3 style={{ color: '#f8d84a', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Përfitimet Kryesore</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[['☁️','Cloud — qasje nga çdo pajisje'],['🔒','Të dhëna të sigurta — pa humbje'],['📊','Raporte automatike Excel/PDF'],['👥','Role të ndryshme (admin/operator)'],['⚡','Pa instalim — hapet në shfletues'],['🔄','Azhurnime dhe veçori të reja falas']].map(([icon,text],i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FAQJA 4: FLOW DIAGRAM ══ */}
      <div className="page" style={{ minHeight: '100vh', padding: 60, background: '#f5f7fc' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#1a2744', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>ARKITEKTURA E SISTEMIT</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Si Funksionon Sistemi</div>
          <p style={{ color: '#64748b', fontSize: 16 }}>Lidhjet mes moduleve, lëvizja e të dhënave dhe rolet e përdoruesve</p>
        </div>

        {/* ROLET E PËRDORUESVE */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>👤 Rolet e Përdoruesve</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Admin */}
            <div style={{ background: '#1a2744', borderRadius: 14, padding: 24, color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f8d84a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👑</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Administrator</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Qasje e plotë në të gjitha modulet</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['✓ Menaxhon anëtarët','✓ Menaxhon klubet','✓ Krijon garat','✓ Regjistron rezultate','✓ Menaxhon financat','✓ Menaxhon licencat','✓ Menaxhon armët','✓ Shikon raporte të plota','✓ Fton përdorues të rinj','✓ Cakton role'].map((item,i) => (
                  <div key={i} style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, padding: '4px 0' }}>{item}</div>
                ))}
              </div>
            </div>
            {/* Operator */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧑‍💼</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f1c3d' }}>Operator / Zyrtar</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>Qasje e kufizuar sipas rolit</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {['✓ Shikon anëtarët','✓ Regjistron për gara','✓ Shikon rezultate','✓ Shikon licencat','✗ Nuk menaxhon financa','✗ Nuk fshin të dhëna','✗ Nuk fton përdorues','✗ Nuk ndryshon role'].map((item,i) => (
                  <div key={i} style={{ color: item.startsWith('✗') ? '#ef4444' : '#374151', fontSize: 12, padding: '4px 0' }}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FLOW I TË DHËNAVE */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>🔄 Lëvizja e të Dhënave mes Moduleve</div>

          {/* Central node */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

            {/* Top row: Klube + Anëtarë */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 0, justifyContent: 'center', width: '100%' }}>
              {[['🏛️','Klubet','Regjistron klube dhe zyrtarë'],['👥','Anëtarët','Regjistron shenjëtarë & zyrtarë']].map(([icon,title,desc],i) => (
                <div key={i} style={{ background: '#fff', border: '2px solid #1a2744', borderRadius: 12, padding: '16px 24px', textAlign: 'center', minWidth: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1c3d' }}>{title}</div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Arrows down */}
            <div style={{ display: 'flex', gap: 180, color: '#1a2744', fontSize: 22, lineHeight: 1, padding: '4px 0' }}>
              <span>↓</span><span>↓</span>
            </div>

            {/* Middle: Central DB */}
            <div style={{ background: 'linear-gradient(135deg,#1a2744,#1a3a6e)', borderRadius: 16, padding: '20px 48px', textAlign: 'center', color: '#fff', marginBottom: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 280 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🗄️</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#f8d84a' }}>Database Qendrore</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 }}>Cloud — Base44 Platform</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                {['Anëtarë','Klube','Gara','Rezultate','Financa','Armë','Licenca'].map(tag => (
                  <span key={tag} style={{ background: 'rgba(248,216,74,0.15)', border: '1px solid rgba(248,216,74,0.3)', color: '#f8d84a', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Arrows down to modules */}
            <div style={{ display: 'flex', gap: 60, color: '#1a2744', fontSize: 22, lineHeight: 1, padding: '4px 0' }}>
              {['↙','↓','↓','↘'].map((a,i) => <span key={i}>{a}</span>)}
            </div>

            {/* Bottom row: 4 output modules */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
              {[
                ['🎯','Garat','Regjistrim & caktim ndërrimesh','#eff6ff','#3b82f6'],
                ['📄','Licencat','Licenca & skadimet','#f0fdf4','#16a34a'],
                ['💶','Financat','Fatura & pagesa','#fff7ed','#f59e0b'],
                ['🔫','Armët','Inventar & caktim','#fdf2f8','#9333ea'],
              ].map(([icon,title,desc,bg,border],i) => (
                <div key={i} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '16px 20px', textAlign: 'center', minWidth: 160, flex: 1, maxWidth: 200 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f1c3d' }}>{title}</div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Arrow to Rezultatet */}
            <div style={{ color: '#1a2744', fontSize: 22, lineHeight: 1, padding: '4px 0' }}>↓</div>

            {/* Rezultatet */}
            <div style={{ background: '#fff', border: '2px solid #f8d84a', borderRadius: 12, padding: '16px 40px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>🏆</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1c3d' }}>Rezultatet & Raporte</div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>Renditje automatike • Statistika • Eksportim Excel/PDF</div>
            </div>
          </div>
        </div>

        {/* FLOW I GARËS — step by step */}
        <div style={{ background: '#0f1c3d', borderRadius: 16, padding: '28px 32px' }}>
          <div style={{ color: '#f8d84a', fontWeight: 700, fontSize: 15, marginBottom: 20, textAlign: 'center' }}>🎯 Flow i Plotë: Nga Regjistrimi deri tek Rezultati</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
            {[
              ['1','Shto Klubin','🏛️'],
              ['→','',''],
              ['2','Shto Anëtarin','👥'],
              ['→','',''],
              ['3','Lësho Licencën','📄'],
              ['→','',''],
              ['4','Krijo Garën','🎯'],
              ['→','',''],
              ['5','Regjistro Sportistët','📝'],
              ['→','',''],
              ['6','Cakto Ndërrimet','🔀'],
              ['→','',''],
              ['7','Regjistro Rezultatet','🏆'],
              ['→','',''],
              ['8','Eksporto Raportin','📊'],
            ].map(([num,label,icon],i) => (
              num === '→'
                ? <div key={i} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, margin: '0 4px' }}>→</div>
                : <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', textAlign: 'center', minWidth: 90 }}>
                    <div style={{ color: '#f8d84a', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Hapi {num}</div>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                    <div style={{ color: '#fff', fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
                  </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FAQJA 5: OFERTA ══ */}
      <div className="page" style={{ minHeight: '100vh', padding: 60, background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: '#1a2744', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>PROPOZIMI FINANCIAR</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>Oferta &amp; Implementimi</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
          {/* Pricing */}
          <div style={{ background: '#0f1c3d', borderRadius: 16, padding: 36, color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 14 }}>💎</div>
            <div style={{ color: '#f8d84a', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Paketa Kompleto</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 30 }}>Të gjitha modulet e integruara</div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, marginBottom: 22 }}>
              {['Të gjitha 6 modulet','Anëtarë të pakufizuar','Hostuese dhe mirëmbajtja','Azhurnime falas','Trajnim i stafit','Mbështetje teknike 6 muaj'].map((f,i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, padding: '7px 0', borderBottom: i<5?'1px solid rgba(255,255,255,0.06)':'none', textAlign: 'left' }}>✓ &nbsp;{f}</div>
              ))}
            </div>
            <div style={{ background: '#f8d84a', color: '#0f1c3d', borderRadius: 10, padding: '18px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>ÇMIMI VJETOR</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>___________ €</div>
              <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>negociueshëm sipas marrëveshjes</div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Plani i Implementimit</div>
            {[
              ['Java 1','#3b82f6','Konfigurim & Personalizim','Ngritja e sistemit me logon dhe të dhënat e federatës'],
              ['Java 2–3','#8b5cf6','Migrim i të Dhënave','Transferim i anëtarëve, klubeve dhe historikut ekzistues'],
              ['Java 4','#f59e0b','Trajnim i Stafit','2–3 sesione trajnimi për administratorët'],
              ['Muaji 2','#10b981','Periudha e Testimit','30 ditë mbështetje intensive falas'],
              ['Muaji 3+','#ef4444','Lançimi i Plotë','Sistemi aktiv — mbështetje e vazhdueshme'],
            ].map(([week,col,title,desc],i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 90, flexShrink: 0, textAlign: 'right' }}>
                  <span style={{ background: col, color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600 }}>{week}</span>
                </div>
                <div style={{ borderLeft: `3px solid ${col}`, paddingLeft: 16, paddingBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg,#1a2744,#0f3060)', borderRadius: 16, padding: 44, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>🤝</div>
          <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Gati për Demo të Drejtpërdrejtë?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 28 }}>Sistemi është aktiv dhe i gatshëm për t'u demonstruar në çdo kohë</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 580, margin: '0 auto' }}>
            {['📧 Email','📞 Telefon','📅 Takimi'].map((lbl,i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 16 }}>
                <div style={{ color: '#f8d84a', fontWeight: 600, fontSize: 12, marginBottom: 8 }}>{lbl}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>________________</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}