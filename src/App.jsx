import React, { useState } from "react";
import { MapPin, Layers, Droplets, Users, FileText, Lock, CheckCircle2, ArrowRight, Eye, BookOpen, Wrench, Bell, Send, AlertTriangle, Check, BarChart3 } from "lucide-react";

const INK = "#1E2A22";
const PAPER = "#EFF1E7";
const PANEL = "#FBFBF7";
const WATER = "#2B5A66";
const LATERITE = "#A6472B";
const OCHRE = "#B98A2E";
const MOSS = "#4C6B3F";
const MUTED = "#9CA39B";
const LINE = "#DDE1D4";
const ROW_ACTIVE = "#E4E9DE";

const LOCATIONS = [
  {
    id: "market", name: "Alajo Market Junction", events: 4, since: "2023",
    severity: "High", severityColor: LATERITE,
    rainfall: [18, 22, 14, 31, 40, 12], months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    drainage: "Undersized, partially blocked",
    terrain: "Flat, low elevation relative to surrounding streets",
    reports: 11, cause: "Blocked / inadequate drainage", confidence: 87,
    contributing: ["Heavy rainfall", "Waste accumulation", "Restricted surface-water flow"],
    road: "Alajo Market Road", corridor: "Local trading corridor, high pedestrian volume",
    options: [
      { name: "Clear blocked drainage", cost: "Low", feasibility: "High", benefit: "High", recommended: true,
        note: "Existing channel, no reconstruction needed. Fastest path to reduced flooding." },
      { name: "Major drainage reconstruction", cost: "High", feasibility: "Lower", benefit: "Potentially high", recommended: false,
        note: "Addresses root capacity issue but requires funding cycle and longer timeline." },
    ],
  },
  {
    id: "residential", name: "Alajo Roundabout Residential Block", events: 6, since: "2022",
    severity: "High", severityColor: LATERITE,
    rainfall: [20, 25, 16, 35, 44, 15], months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    drainage: "Adequate capacity, poor gradient",
    terrain: "Low-lying, below surrounding road level",
    reports: 8, cause: "Low-lying terrain with restricted surface-water pathways", confidence: 74,
    contributing: ["Heavy rainfall", "Inadequate surface grading", "Nearby drain overflow"],
    road: "Alajo Roundabout access road", corridor: "Residential access, connects to Kotobabi",
    options: [
      { name: "Improve surface-water pathways", cost: "Medium", feasibility: "Medium", benefit: "High", recommended: true,
        note: "Regrading and channel improvements targeted at the lowest-lying stretch." },
      { name: "Household-level flood barriers", cost: "Low", feasibility: "High", benefit: "Low", recommended: false,
        note: "Reduces property damage but doesn't address the underlying pooling." },
    ],
  },
  {
    id: "crossing", name: "Alajo-Kotobabi Road Crossing", events: 3, since: "2023",
    severity: "Medium", severityColor: OCHRE,
    rainfall: [15, 19, 12, 27, 33, 10], months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    drainage: "Culvert present, partially obstructed",
    terrain: "Moderate slope toward crossing point",
    reports: 5, cause: "Obstructed waterway (culvert blockage)", confidence: 81,
    contributing: ["Waste accumulation", "Heavy rainfall", "Undersized culvert opening"],
    road: "Kotobabi-Alajo link road", corridor: "Key transit route, public transport line",
    options: [
      { name: "Clear culvert obstruction", cost: "Low", feasibility: "High", benefit: "High", recommended: true,
        note: "Single-point fix, no excavation required. Restores existing capacity." },
      { name: "Widen culvert opening", cost: "Medium", feasibility: "Medium", benefit: "Medium", recommended: false,
        note: "Worth revisiting if clearing alone doesn't hold through the season." },
    ],
  },
];

const STEPS = ["evidence", "diagnose", "prioritize"];
const ALERTS = [
  { id:"A-001", date:"Sep 8, 2026", zone:"Alajo Market Junction", rain:82, intensity:"Heavy", duration:"4.5 hrs", vulnerability:92, probability:84, level:"High", residents:1248, delivered:1190, pending:58 },
  { id:"A-002", date:"Sep 9, 2026", zone:"Alajo Roundabout Residential Block", rain:61, intensity:"Heavy", duration:"3.0 hrs", vulnerability:86, probability:72, level:"Watch", residents:842, delivered:801, pending:41 },
  { id:"A-003", date:"Sep 10, 2026", zone:"Alajo-Kotobabi Road Crossing", rain:24, intensity:"Moderate", duration:"1.5 hrs", vulnerability:63, probability:28, level:"Low", residents:510, delivered:0, pending:0 },
];
const ALERT_LEVELS = {
  Low: { color:MOSS, bg:"#EEF3EA", label:"Low risk" }, Watch: { color:OCHRE, bg:"#F5F0E3", label:"Watch" },
  High: { color:LATERITE, bg:"#F7E9E4", label:"High flood risk" }, Critical: { color:"#7A2520", bg:"#F3D9D5", label:"Critical" },
};
const STEP_LABELS = { evidence: "Evidence", diagnose: "Diagnose", prioritize: "Prioritize" };

function SectionLabel({ children, color = WATER }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 3, height: 16, background: color }} />
      <span style={{ color: INK, fontSize: 13, fontWeight: 600 }}>{children}</span>
    </div>
  );
}

function Bar({ label, value, max, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <span style={{ width: 36, fontSize: 12, color: MUTED }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: "#E3E6DC" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color }} />
      </div>
      <span style={{ width: 34, fontSize: 12, textAlign: "right" }}>{value}mm</span>
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState(LOCATIONS[0].id);
  const [step, setStep] = useState("evidence");
  const [view, setView] = useState("intelligence");
  const [alertZone, setAlertZone] = useState(ALERTS[0].zone);
  const [alertSent, setAlertSent] = useState(false);
  const loc = LOCATIONS.find((l) => l.id === selectedId);

  const selectLocation = (id) => { setSelectedId(id); setStep("evidence"); setView("intelligence"); };
  const currentAlert = ALERTS.find(a => a.zone === alertZone) || ALERTS[0];
  const alertStyle = ALERT_LEVELS[currentAlert.level] || ALERT_LEVELS.High;

  return (
    <div style={{ background: PAPER, minHeight: "100vh", color: INK, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 60px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "Georgia, 'Iowan Old Style', serif", fontSize: 24, fontWeight: 700 }}>FloodGuard AI</div>
            <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>Recurring flood case log - Alajo, Accra</div>
          </div>
          <div style={{ fontSize: 11, color: MUTED, textAlign: "right", border: `1px solid ${MUTED}`, padding: "5px 10px" }}>
            Illustrative sample data<br />for demonstration purposes
          </div>
        </div>

        <div style={{ display:"flex", gap:4, borderTop:`1px solid ${LINE}`, borderBottom:`1px solid ${LINE}`, marginBottom:28, overflowX:"auto" }}>
          {[ ["intelligence","Flood Intelligence",BarChart3], ["alerts","Predictive Alerts",Bell], ["history","Alert History",FileText] ].map(([key,label,Icon]) => (
            <button key={key} onClick={() => setView(key)} style={{ display:"flex", alignItems:"center", gap:7, padding:"13px 16px", border:"none", borderBottom:view===key?`2px solid ${WATER}`:"2px solid transparent", background:view===key?ROW_ACTIVE:"transparent", color:view===key?INK:MUTED, fontFamily:"inherit", fontSize:13, fontWeight:view===key?700:500, cursor:"pointer", whiteSpace:"nowrap" }}><Icon size={15}/>{label}</button>
          ))}
        </div>

        {view === "alerts" && (
          <div style={{ background:PANEL, border:`1px solid ${LINE}`, padding:32 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap", marginBottom:24 }}>
              <div><SectionLabel color={LATERITE}>Predictive Alerts - upcoming rainfall</SectionLabel><div style={{ fontFamily:"Georgia, serif", fontSize:26, fontWeight:700 }}>Will the next rainfall cause flooding?</div><div style={{ color:MUTED, fontSize:13, marginTop:6, maxWidth:650 }}>FloodGuard combines known flood-prone locations with sample rainfall forecasts and vulnerability information to estimate the likelihood of flooding. Prototype logic only.</div></div>
              <div style={{ border:`1px solid ${LINE}`, padding:"8px 12px", fontSize:12, color:MUTED }}>Forecast dataset · illustrative</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:14, marginBottom:24 }}>
              <div style={{ border:`1px solid ${LINE}`, padding:18 }}><div style={{fontSize:11,color:MUTED}}>UPCOMING RAINFALL</div><div style={{fontSize:30,fontWeight:700,marginTop:5}}>{currentAlert.rain} mm</div><div style={{fontSize:12,color:MUTED}}>{currentAlert.intensity} · {currentAlert.duration}</div></div>
              <div style={{ border:`1px solid ${LINE}`, padding:18 }}><div style={{fontSize:11,color:MUTED}}>LOCATION VULNERABILITY</div><div style={{fontSize:30,fontWeight:700,marginTop:5}}>{currentAlert.vulnerability}%</div><div style={{fontSize:12,color:MUTED}}>Known flood-prone area</div></div>
              <div style={{ border:`2px solid ${alertStyle.color}`, background:alertStyle.bg, padding:18 }}><div style={{fontSize:11,color:alertStyle.color,fontWeight:700}}>PREDICTED FLOOD PROBABILITY</div><div style={{fontSize:30,fontWeight:700,color:alertStyle.color,marginTop:5}}>{currentAlert.probability}%</div><div style={{fontSize:12,color:alertStyle.color,fontWeight:700}}>{alertStyle.label}</div></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:24 }}>
              <div><SectionLabel color={WATER}>Forecast scenario</SectionLabel>
                <select value={alertZone} onChange={e=>{setAlertZone(e.target.value);setAlertSent(false)}} style={{width:"100%",padding:"11px 12px",border:`1px solid ${LINE}`,background:PAPER,font:"inherit",color:INK}}>{ALERTS.map(a=><option key={a.id}>{a.zone}</option>)}</select>
                <div style={{marginTop:18,border:`1px solid ${LINE}`,padding:18}}><div style={{fontSize:14,fontWeight:700,marginBottom:10}}>Prototype prediction logic</div><div style={{fontSize:13,lineHeight:1.7,color:MUTED}}>Rainfall amount + intensity/duration + known location vulnerability are combined into an illustrative flood-risk score. A score of 65% or higher generates a resident warning.</div></div>
                {currentAlert.probability >= 65 && <div style={{marginTop:16,padding:16,background:alertStyle.bg,border:`1px solid ${alertStyle.color}`}}><div style={{display:"flex",gap:8,alignItems:"center",color:alertStyle.color,fontWeight:700}}><AlertTriangle size={17}/> Resident warning generated</div><div style={{fontSize:13,marginTop:7}}>Heavy rainfall is forecast for {currentAlert.date}. FloodGuard estimates a {currentAlert.probability}% chance of flooding in {currentAlert.zone}.</div><button onClick={()=>setAlertSent(true)} style={{marginTop:14,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:"none",background:INK,color:"#fff",fontFamily:"inherit",fontWeight:700,cursor:"pointer"}}><Send size={14}/> {alertSent?"Alert sent to residents":"Send resident alert"}</button>{alertSent && <div style={{fontSize:12,color:MOSS,marginTop:10,display:"flex",gap:6,alignItems:"center"}}><Check size={14}/> Transmission receipt created</div>}</div>}
              </div>
              <div><SectionLabel color={WATER}>Resident transmission receipt</SectionLabel><div style={{border:`1px solid ${LINE}`,padding:18}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,fontSize:12.5}}><div><span style={{color:MUTED}}>Alert ID</span><br/><b>{currentAlert.id}</b></div><div><span style={{color:MUTED}}>Residents</span><br/><b>{currentAlert.residents.toLocaleString()}</b></div><div><span style={{color:MUTED}}>Delivered</span><br/><b>{alertSent?currentAlert.delivered.toLocaleString():"-"}</b></div><div><span style={{color:MUTED}}>Pending</span><br/><b>{alertSent?currentAlert.pending:"-"}</b></div><div><span style={{color:MUTED}}>Channels</span><br/><b>SMS · Voice Call</b></div><div><span style={{color:MUTED}}>Status</span><br/><b style={{color:alertSent?MOSS:OCHRE}}>{alertSent?"Delivered / logged":"Awaiting transmission"}</b></div></div><div style={{marginTop:18,paddingTop:14,borderTop:`1px solid ${LINE}`,fontSize:12,color:MUTED}}>Receipt confirms the prototype alert was transmitted to the selected resident group; it does not represent a live messaging service.</div></div></div>
            </div>
          </div>
        )}

        {view === "history" && (<div style={{background:PANEL,border:`1px solid ${LINE}`,padding:32}}><SectionLabel color={WATER}>Alert History - resident notifications</SectionLabel><div style={{fontFamily:"Georgia, serif",fontSize:25,fontWeight:700,marginBottom:18}}>Prediction and transmission log</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}><thead><tr>{["Date","Location","Rainfall","Flood probability","Risk","Residents","Delivery"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 8px",borderBottom:`1px solid ${LINE}`,color:MUTED,fontWeight:600}}>{h}</th>)}</tr></thead><tbody>{ALERTS.map(a=><tr key={a.id}>{[a.date,a.zone,`${a.rain} mm`,`${a.probability}%`,a.level,a.residents.toLocaleString(),a.probability>=65?`${a.delivered.toLocaleString()} delivered`:"No alert"].map((v,i)=><td key={i} style={{padding:"12px 8px",borderBottom:`1px solid ${LINE}`,fontWeight:i===4?700:400}}>{v}</td>)}</tr>)}</tbody></table></div></div>)}

        {view === "intelligence" && <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

          <div style={{ width: 300, flexShrink: 0 }}>
            <SectionLabel color={WATER}>Find - recurring flood locations</SectionLabel>
            <div style={{ background: PANEL, border: `1px solid ${LINE}` }}>
              {LOCATIONS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => selectLocation(l.id)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "14px 16px",
                    background: l.id === selectedId ? ROW_ACTIVE : "transparent",
                    border: "none", borderBottom: i < LOCATIONS.length - 1 ? `1px solid ${LINE}` : "none",
                    cursor: "pointer", font: "inherit", color: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</span>
                    <MapPin size={14} color={l.id === selectedId ? WATER : MUTED} />
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{l.events} events since {l.since}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.severityColor }} />
                    <span style={{ fontSize: 11, color: l.severityColor, fontWeight: 600 }}>{l.severity} severity</span>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 28 }}>
              <SectionLabel color={MUTED}>Pilot phase - not yet interactive</SectionLabel>
              <div style={{ borderLeft: `2px dashed ${MUTED}`, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { Icon: Wrench, label: "Act", desc: "Authority carries out the intervention" },
                  { Icon: Eye, label: "Verify", desc: "Compare flood conditions before/after" },
                  { Icon: BookOpen, label: "Learn", desc: "Outcome informs future recommendations" },
                ].map(({ Icon, label, desc }) => (
                  <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 8, opacity: 0.7 }}>
                    <Lock size={13} color={MUTED} style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 320, background: PANEL, border: `1px solid ${LINE}`, padding: 32 }}>
            <div style={{ fontFamily: "Georgia, 'Iowan Old Style', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{loc.name}</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>{loc.events} recurring flood events since {loc.since} · {loc.severity} severity</div>

            <div style={{ display: "flex", gap: 1, marginBottom: 24, borderBottom: `1px solid ${LINE}` }}>
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  style={{
                    padding: "8px 4px", marginRight: 28, background: "none", border: "none",
                    borderBottom: step === s ? `2px solid ${WATER}` : "2px solid transparent",
                    color: step === s ? INK : MUTED, fontSize: 14, fontWeight: step === s ? 600 : 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {i + 1}. {STEP_LABELS[s]}
                </button>
              ))}
            </div>

            {step === "evidence" && (
              <div>
                <SectionLabel color={WATER}>Rainfall - last 6 months</SectionLabel>
                <div style={{ marginBottom: 24 }}>
                  {loc.rainfall.map((v, i) => <Bar key={i} label={loc.months[i]} value={v} max={44} color={WATER} />)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <SectionLabel color={WATER}>Drainage condition</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}><Layers size={16} color={WATER} style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{loc.drainage}</span></div>
                  </div>
                  <div>
                    <SectionLabel color={WATER}>Terrain</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}><Droplets size={16} color={WATER} style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{loc.terrain}</span></div>
                  </div>
                  <div>
                    <SectionLabel color={WATER}>Community reports</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}><Users size={16} color={WATER} style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{loc.reports} validated reports in the last 12 months</span></div>
                  </div>
                  <div>
                    <SectionLabel color={WATER}>Transport link</SectionLabel>
                    <div style={{ display: "flex", gap: 8 }}><FileText size={16} color={WATER} style={{ marginTop: 2, flexShrink: 0 }} /><span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{loc.road} - {loc.corridor}</span></div>
                  </div>
                </div>
              </div>
            )}

            {step === "diagnose" && (
              <div>
                <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 128, height: 128, borderRadius: "50%", border: `3px solid ${LATERITE}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)", color: LATERITE, flexShrink: 0 }}>
                    <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{loc.confidence}%</div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", marginTop: 4 }}>CONFIDENCE</div>
                  </div>
                  <div>
                    <SectionLabel color={LATERITE}>Likely primary cause</SectionLabel>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{loc.cause}</div>
                    <div style={{ fontSize: 12.5, color: MUTED, maxWidth: 420, lineHeight: 1.5 }}>
                      Estimated from rainfall, terrain, drainage and historical flood data using a supervised classification model. This is an assessment, not a certainty - a technical team validates before any action is taken.
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 28 }}>
                  <SectionLabel color={WATER}>Contributing factors</SectionLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {loc.contributing.map((f) => <span key={f} style={{ fontSize: 13, padding: "6px 12px", background: ROW_ACTIVE, border: "1px solid #CFD5C5" }}>{f}</span>)}
                  </div>
                </div>
              </div>
            )}

            {step === "prioritize" && (
              <div>
                <SectionLabel color={WATER}>Intervention options</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {loc.options.map((o) => (
                    <div key={o.name} style={{ border: o.recommended ? `2px solid ${MOSS}` : `1px solid ${LINE}`, background: o.recommended ? "#EEF3EA" : "transparent", padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                        <span style={{ fontSize: 15.5, fontWeight: 700 }}>{o.name}</span>
                        {o.recommended && <span style={{ display: "flex", alignItems: "center", gap: 4, color: MOSS, fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={14} /> Recommended first</span>}
                      </div>
                      <div style={{ display: "flex", gap: 24, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12.5, color: MUTED }}>Cost: <b style={{ color: INK }}>{o.cost}</b></span>
                        <span style={{ fontSize: 12.5, color: MUTED }}>Feasibility: <b style={{ color: INK }}>{o.feasibility}</b></span>
                        <span style={{ fontSize: 12.5, color: MUTED }}>Expected benefit: <b style={{ color: INK }}>{o.benefit}</b></span>
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{o.note}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, padding: "12px 16px", background: ROW_ACTIVE }}>
                  <ArrowRight size={15} color={WATER} />
                  <span style={{ fontSize: 13 }}>Recommendation is routed to the responsible authority for validation - see the Pilot Plan for the Act → Verify → Learn continuation.</span>
                </div>
              </div>
            )}
          </div>
        </div>}
      </div>
    </div>
  );
}
