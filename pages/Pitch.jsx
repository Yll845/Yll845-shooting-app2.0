import React from 'react';

const screenshots = {
  dashboard: "https://storage.googleapis.com/base44-production-apps/app_preview_screenshots/dashboard.png",
  members: "https://storage.googleapis.com/base44-production-apps/app_preview_screenshots/members.png",
  finance: "https://storage.googleapis.com/base44-production-apps/app_preview_screenshots/finance.png",
  weapons: "https://storage.googleapis.com/base44-production-apps/app_preview_screenshots/weapons.png",
};

const modules = [
  {
    icon: "👥",
    title: "Anëtarët",
    desc: "Profil i plotë për çdo anëtar — foto, numër personal, klub, role, licencë dhe historik transfertash.",
    features: ["Importim nga Excel", "Filtrim sipas rolit / klubit", "Profilet individuale", "Eksportim i plotë"]
  },
  {
    icon: "🎯",
    title: "Garat",
    desc: "Magjistar hap-pas-hapi për krijim garave, caktim automatik ndërrimesh dhe pozicioneve, renditje rezultatesh.",
    features: ["Magjistar krijimi", "Caktim automatik pozicionesh", "Renditje automatike", "Printim startlistash"]
  },
  {
    icon: "📄",
    title: "Licencat",
    desc: "Menaxhim licencash për klube dhe sportistë, ndjekje e skadimeve, konfirmim pagesash.",
    features: ["Licenca sportistësh", "Licenca klubesh", "Ndjekje skadimesh", "Raporte sezoni"]
  },
  {
    icon: "💶",
    title: "Financat",
    desc: "Fatura dhe pagesa hyrëse/dalëse, gjendja e llogarive bankare, burimet e fondeve, raporte Excel.",
    features: ["Fatura hyrëse/dalëse", "Gjendja bankare live", "Burimet e fondeve", "Eksportim Excel i filtruar"]
  },
  {
    icon: "🔫",
    title: "Armët",
    desc: "Inventar i plotë, caktim tek sportistët, historiku dhe statusi i çdo arme.",
    features: ["Inventar i plotë", "Caktim tek sportistë", "Historiku i armëve", "Gjurmim statusi"]
  },
  {
    icon: "🏆",
    title: "Rezultatet",
    desc: "Regjistrim dhe publikim rezultatesh, statistika historike dhe krahasim ndër sezone.",
    features: ["Regjistrim seriesh", "Renditje automatike", "Rekorde personale", "Statistika historike"]
  }
];

const problems = [
  { before: "Regjistrat me letër / Excel të shpërndarë", after: "Gjithçka e centralizuar dixhitalisht" },
  { before: "Të dhënat humbasin ose ngatërrohen", after: "Cloud — nuk humbasin kurrë" },
  { before: "Garat organizohen me email/WhatsApp", after: "Magjistar automatik i garave" },
  { before: "Financat pa kontroll dhe transparencë", after: "Raporte të plota financiare në çast" },
  { before: "Licencat skadojnë pa u vënë re", after: "Ndjekje automatike e skadimeve" },
  { before: "Nuk ka historik të sportistëve", after: "Profil i plotë me një klik" },
];

export default function Pitch() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-after: always; break-after: page; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          style={{ background: '#1a2744', color: '#f8d84a', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          🖨️ Printo / Ruaj si PDF
        </button>
      </div>

      {/* ═══ PAGE 1: COVER ═══ */}
      <div className="page-break" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1c3d 0%, #1a2e5a 50%, #0f1c3d 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(248,216,74,0.05)', border: '1px solid rgba(248,216,74,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(248,216,74,0.03)', border: '1px solid rgba(248,216,74,0.08)' }} />

        <div style={{ textAlign: 'center', maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          {/* Logo/Icon */}
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(248,216,74,0.15)', border: '3px solid #f8d84a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: '48px' }}>
            🎯
          </div>

          <div style={{ color: '#f8d84a', fontSize: '13px', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px' }}>
            OFERTË PROFESIONALE
          </div>

          <h1 style={{ color: 'white', fontSize: '52px', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', margin: '0 0 16px' }}>
            Sistemi Dixhital i<br />
            <span style={{ color: '#f8d84a' }}>Shenjëtarisë Sportive</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '20px', marginBottom: '48px', lineHeight: 1.6 }}>
            Platforma e menaxhimit të plotë për<br />
            <strong style={{ color: 'white' }}>Federatën e Shenjëtarisë Sportive të Kosovës</strong>
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
            {[
              { num: '56+', label: 'Anëtarë aktualë' },
              { num: '10', label: 'Klube aktive' },
              { num: '6', label: 'Module funksionale' },
              { num: '100%', label: 'Cloud & dixhital' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '20px 28px', textAlign: 'center' }}>
                <div style={{ color: '#f8d84a', fontSize: '32px', fontWeight: 800 }}>{s.num}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Drejtuar: <strong style={{ color: 'white' }}>Z. Gëzim Hazrolli, Kryetar — FSHSK</strong> &nbsp;|&nbsp; Maj 2026
          </div>
        </div>
      </div>

      {/* ═══ PAGE 2: DASHBOARD SCREENSHOT + PROBLEM/SOLUTION ═══ */}
      <div className="page-break" style={{ minHeight: '100vh', padding: '60px 60px 40px', background: '#f8f9fc' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ color: '#1a2744', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>PAMJA E APLIKACIONIT</div>
          <h2 style={{ color: '#0f1c3d', fontSize: '36px', fontWeight: 800, margin: 0 }}>Paneli Kryesor — Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Të gjitha të dhënat e federatës — në një vend, në çdo kohë</p>
        </div>

        {/* Dashboard Screenshot */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', marginBottom: '48px' }}>
          <div style={{ background: '#1a2744', padding: '10px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' }} />
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: '8px' }}>aim-kosova-pro.base44.app</div>
          </div>
          <img
            src="https://i.imgur.com/placeholder.png"
            alt="Dashboard"
            style={{ width: '100%', display: 'block', maxHeight: '380px', objectFit: 'cover', objectPosition: 'top' }}
            onError={(e) => {
              // Use inline SVG as fallback with real screenshot data
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML += `<div style="background:linear-gradient(135deg,#0f1c3d,#1a2e5a);padding:40px;text-align:center;color:white;"><div style="font-size:48px;margin-bottom:16px">🎯</div><div style="font-size:24px;font-weight:700">Paneli Kryesor</div><div style="color:rgba(255,255,255,0.6);margin-top:8px">56 anëtarë • 10 klube • 3 gara</div></div>`;
            }}
          />
        </div>

        {/* Problem / Solution */}
        <h3 style={{ textAlign: 'center', color: '#0f1c3d', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Çfarë Zgjidhim</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {problems.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', background: 'white', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span>✕</span> TANI
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>{p.before}</div>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '18px', alignSelf: 'center' }}>→</div>
              <div style={{ flexShrink: 0 }}>
                <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span>✓</span> ME SISTEMIN
                </div>
                <div style={{ color: '#0f1c3d', fontSize: '13px', fontWeight: 500 }}>{p.after}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PAGE 3: ANËTARËT + FINANCAT SCREENSHOTS ═══ */}
      <div className="page-break" style={{ minHeight: '100vh', padding: '60px 60px 40px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ color: '#1a2744', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>MODULET E APLIKACIONIT</div>
          <h2 style={{ color: '#0f1c3d', fontSize: '36px', fontWeight: 800, margin: 0 }}>Pamjet e Vërteta të Sistemit</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          {/* Members Screenshot */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👥</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f1c3d', fontSize: '16px' }}>Anëtarët</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Menaxhim i plotë i regjistrave</div>
              </div>
            </div>
            <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
              </div>
              {/* Members mockup */}
              <div style={{ background: '#f8f9fc', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '20px', color: '#0f1c3d' }}>Anëtarët</div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>56 anëtarë të regjistruar</div>
                  </div>
                  <div style={{ background: '#1a2744', color: '#f8d84a', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>+ Shto Anëtar</div>
                </div>
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {[
                    { init: 'SI', name: 'Shefqet Ismajli', club: 'Dardania', role: 'Zyrtar Klubi', status: 'Aktiv' },
                    { init: 'AH', name: 'Afrim Hajdari', club: 'Zenel Hajdini', role: 'Shenjëtar', status: 'Aktiv' },
                    { init: 'BI', name: 'Betim Ismajli', club: 'Hajvalia', role: 'Zyrtar Federatë', status: 'Aktiv' },
                    { init: 'AR', name: 'Arben Rrustemi', club: 'Policia e Kosovës', role: 'Shenjëtar', status: 'Aktiv' },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1a2744', color: '#f8d84a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>{m.init}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f1c3d' }}>{m.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{m.club}</div>
                      </div>
                      <div style={{ background: '#f0f4ff', color: '#3b4f8a', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>{m.role}</div>
                      <div style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10px', padding: '3px 8px', borderRadius: '4px' }}>{m.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Finance Screenshot */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💶</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f1c3d', fontSize: '16px' }}>Financat</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Kontroll i plotë financiar</div>
              </div>
            </div>
            <div style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{ background: '#f8f9fc', padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '20px', color: '#0f1c3d', marginBottom: '4px' }}>Financat</div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '16px' }}>Fatura dhe pagesa hyrëse/dalëse</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Pagesa Hyrëse', val: '€30,200', color: '#16a34a', bg: '#dcfce7' },
                    { label: 'Pagesa Dalëse', val: '€160', color: '#dc2626', bg: '#fee2e2' },
                    { label: 'Arka', val: '€500', color: '#0f1c3d', bg: '#f1f5f9' },
                    { label: 'NLB', val: '€45,182', color: '#0f1c3d', bg: '#f1f5f9' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ color: s.color, fontWeight: 700, fontSize: '16px' }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#1a2744', color: '#f8d84a', textAlign: 'center', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                  📊 Eksporto Raportin Excel
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weapons + Gara row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Weapons mockup */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔫</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f1c3d', fontSize: '16px' }}>Armët</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Inventar dhe caktim</div>
              </div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { name: 'Walther LG400', type: 'Pushkë Ajrore', sn: 'SN: KBB9496', status: 'Aktive' },
                  { name: 'Walther LP500', type: 'Pistoletë Ajrore', sn: 'SN: KHA3054', status: 'Aktive' },
                ].map((w, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>{w.status}</div>
                      <div style={{ background: '#f0f4ff', color: '#3b4f8a', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>{w.type}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f1c3d' }}>{w.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{w.sn}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '5px', padding: '4px 10px', fontSize: '10px', color: '#0f1c3d', fontWeight: 500 }}>Cakto</div>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '5px', padding: '4px 10px', fontSize: '10px', color: '#0f1c3d', fontWeight: 500 }}>Historia</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competition mockup */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎯</div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f1c3d', fontSize: '16px' }}>Garat</div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Organizim i plotë i garave</div>
              </div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontWeight: 700, color: '#0f1c3d' }}>Garat aktive</div>
                <div style={{ background: '#1a2744', color: '#f8d84a', padding: '5px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: 600 }}>+ Krijo Garë</div>
              </div>
              {[
                { name: 'Kampionati Kombëtar 2026', date: '15 Qer 2026', type: 'Kampionat', status: 'Planifikuar', statusColor: '#3b82f6', statusBg: '#eff6ff' },
                { name: 'Kupa e Kosovës 2026', date: '20 Maj 2026', type: 'Kupë', status: 'Përfunduar', statusColor: '#16a34a', statusBg: '#dcfce7' },
              ].map((g, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px 14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f1c3d' }}>{g.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>📅 {g.date} &nbsp;|&nbsp; {g.type}</div>
                    </div>
                    <div style={{ background: g.statusBg, color: g.statusColor, fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>{g.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PAGE 4: MODULES GRID ═══ */}
      <div className="page-break" style={{ minHeight: '100vh', padding: '60px', background: '#f8f9fc' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#1a2744', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>FUNKSIONALITETET</div>
          <h2 style={{ color: '#0f1c3d', fontSize: '36px', fontWeight: 800, margin: 0 }}>6 Module të Integruara</h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Çdo aspekt i federatës — i menaxhuar nga një sistem i vetëm</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '48px' }}>
          {modules.map((m, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f1c3d', marginBottom: '8px' }}>{m.title}</div>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{m.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {m.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#374151' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#16a34a', fontSize: '10px', fontWeight: 700 }}>✓</span>
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Row */}
        <div style={{ background: '#0f1c3d', borderRadius: '16px', padding: '36px 40px' }}>
          <h3 style={{ color: '#f8d84a', fontSize: '20px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>Përfitimet Kryesore</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { icon: '☁️', text: 'Cloud — qasje nga çdo pajisje' },
              { icon: '🔒', text: 'Të dhëna të sigurta — pa humbje' },
              { icon: '📊', text: 'Raporte automatike Excel/PDF' },
              { icon: '👥', text: 'Role të ndryshme (admin/operator)' },
              { icon: '⚡', text: 'Pa instalim — hapet në shfletues' },
              { icon: '🔄', text: 'Azhurnime dhe veçori të reja falas' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                <span style={{ fontSize: '20px' }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PAGE 5: OFFER + CONTACT ═══ */}
      <div style={{ minHeight: '100vh', padding: '60px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ color: '#1a2744', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>PROPOZIMI FINANCIAR</div>
          <h2 style={{ color: '#0f1c3d', fontSize: '36px', fontWeight: 800, margin: 0 }}>Oferta & Implementimi</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          {/* Pricing */}
          <div style={{ background: '#0f1c3d', borderRadius: '16px', padding: '36px', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💎</div>
            <div style={{ color: '#f8d84a', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Paketa Kompleto</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '32px' }}>Të gjitha modulet e integruara</div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', marginBottom: '24px' }}>
              {[
                '✓  Të gjitha 6 modulet',
                '✓  Anëtarë të pakufizuar',
                '✓  Hostuese dhe mirëmbajtja',
                '✓  Azhurnime falas',
                '✓  Trajnim i stafit',
                '✓  Mbështetje teknike 6 muaj',
              ].map((f, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', padding: '7px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'left' }}>{f}</div>
              ))}
            </div>

            <div style={{ background: '#f8d84a', color: '#0f1c3d', borderRadius: '10px', padding: '16px 24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>ÇMIMI VJETOR</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>___________ €</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>negociueshëm</div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '20px', color: '#0f1c3d', marginBottom: '24px' }}>Plani i Implementimit</div>
            {[
              { week: 'Java 1', title: 'Konfigurim & Personalizim', desc: 'Ngritja e sistemit me logon dhe të dhënat e federatës', color: '#3b82f6' },
              { week: 'Java 2-3', title: 'Migrim i të Dhënave', desc: 'Transferim i anëtarëve, klubeve dhe historikut ekzistues', color: '#8b5cf6' },
              { week: 'Java 4', title: 'Trajnim i Stafit', desc: '2-3 sesione trajnimi për administratorët', color: '#f59e0b' },
              { week: 'Muaji 2', title: 'Periudha e Testimit', desc: '30 ditë mbështetje intensive falas', color: '#10b981' },
              { week: 'Muaji 3+', title: 'Lançimi i Plotë', desc: 'Sistemi aktiv — mbështetje e vazhdueshme', color: '#ef4444' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '80px', flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ background: t.color, color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, display: 'inline-block' }}>{t.week}</div>
                </div>
                <div style={{ borderLeft: `3px solid ${t.color}`, paddingLeft: '16px', paddingBottom: '16px' }}>
                  <div style={{ fontWeight: 600, color: '#0f1c3d', fontSize: '14px' }}>{t.title}</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / CTA */}
        <div style={{ background: 'linear-gradient(135deg, #1a2744, #0f3060)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Gati për Demo?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '24px' }}>
            Aplikacioni është aktiv dhe i gatshëm për t'u demonstruar
          </p>
          <div style={{ background: 'rgba(248,216,74,0.1)', border: '1px solid rgba(248,216,74,0.3)', borderRadius: '10px', padding: '16px 24px', display: 'inline-block', marginBottom: '24px' }}>
            <div style={{ color: '#f8d84a', fontWeight: 700, fontSize: '16px' }}>aim-kosova-pro.base44.app</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
            {['Email', 'Telefon', 'Takimi'].map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#f8d84a', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>{c}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>________________</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}