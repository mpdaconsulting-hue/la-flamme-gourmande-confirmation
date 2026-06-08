import { useState, useEffect } from "react";

/*
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  LA FLAMME GOURMANDE — Page restaurateur  /traiter                        │
  │                                                                           │
  │  Le restaurateur arrive ici depuis le bouton du mail (Scénario 1) :       │
  │    https://ton-app.vercel.app/traiter?ref=FG-3621&token=XXXXXXXX          │
  │                                                                           │
  │  Il voit la commande, puis ACCEPTE (en saisissant l'heure de retrait)     │
  │  ou REFUSE. La validation appelle Make, qui prévient le client.           │
  └─────────────────────────────────────────────────────────────────────────┘

  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  À RENSEIGNER : tes 2 webhooks Make                                         ║
  ╚═══════════════════════════════════════════════════════════════════════════╝

  1) FETCH — au chargement de la page. La page envoie { ref, token }.
     Make valide le token, lit la commande dans Airtable, et RÉPOND ce JSON
     (module "Webhook response", status 200) :

        {
          "ok": true,
          "reference": "FG-3621",
          "statut": "En attente",          // "En attente" | "Acceptée" | "Refusée"
          "nomClient": "De almeida",
          "telephone": "786995888",
          "note": "Sans oignon",            // chaîne vide si rien
          "total": 117.5,
          "articles": [
            { "nom": "Marguerita (33 cm)", "quantite": 2, "prixUnitaire": 11.5, "detail": "", "montantLigne": 23 }
          ]
        }
     Si le token est invalide :  { "ok": false, "error": "Lien invalide" }

  2) DECISION — quand le resto valide. La page envoie :
       Accepter : { ref, token, action: "accept", heureRetrait: "2026-06-07T19:00" }
       Refuser  : { ref, token, action: "refuse" }
     Make répond simplement { "ok": true }.

  Tant que les 2 URLs ci-dessous sont vides, la page tourne en MODE DÉMO
  (données fictives, aucun appel réseau) pour que tu puisses la tester.
*/

const FETCH_WEBHOOK_URL = "https://hook.eu2.make.com/x7ijm7qhe1fzhiuqneg931fd94592sgw";      
const DECISION_WEBHOOK_URL = "https://hook.eu2.make.com/y9uoo7fs2gt428rahlfl3jae3qyczomg";   

const DEMO_ORDER = {
  ok: true,
  reference: "FG-3621",
  statut: "En attente",
  nomClient: "De almeida",
  telephone: "786995888",
  note: "",
  total: 117.5,
  articles: [
    { nom: "Marguerita (33 cm)", quantite: 2, prixUnitaire: 11.5, detail: "", montantLigne: 23 },
    { nom: "Capri (26 cm)", quantite: 1, prixUnitaire: 10.5, detail: "", montantLigne: 10.5 },
    { nom: "Reinette (26 cm)", quantite: 6, prixUnitaire: 10.5, detail: "", montantLigne: 63 },
    { nom: "Flamme (26 cm)", quantite: 2, prixUnitaire: 10.5, detail: "", montantLigne: 21 },
  ],
};

const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

function defaultPickup() {
  const d = new Date(Date.now() + 25 * 60000);
  d.setSeconds(0, 0);
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function prettyPickup(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

.fg-root { --ink:#2a1d13; --muted:#8a7866; --cream:#f7f0e6; --card:#fffdf9;
  --line:#ece0cf; --flame:#e2590c; --flame-dark:#b8410a; --ember:#f59e0b;
  --ok:#2f7d4f; --ok-bg:#e7f3ec; --no:#b23a2e; --no-bg:#fbeae7;
  min-height:100vh; background:
    radial-gradient(120% 60% at 50% -10%, #2018110d, transparent),
    var(--cream);
  font-family:'Hanken Grotesk',ui-sans-serif,sans-serif; color:var(--ink);
  -webkit-font-smoothing:antialiased; display:flex; justify-content:center;
  padding:0 16px 48px; box-sizing:border-box; }
.fg-root *{box-sizing:border-box;}
.fg-shell{width:100%; max-width:480px;}

.fg-head{background:#1c130c; color:#f7f0e6; border-radius:0 0 22px 22px;
  margin:0 -16px 22px; padding:26px 26px 22px; position:relative; overflow:hidden;}
.fg-head::after{content:""; position:absolute; left:0; right:0; bottom:0; height:3px;
  background:linear-gradient(90deg,var(--flame),var(--ember),var(--flame));}
.fg-brand{display:flex; align-items:center; gap:11px;}
.fg-brand svg{flex:none;}
.fg-name{font-family:'Fraunces',serif; font-weight:600; font-size:23px; letter-spacing:.2px; line-height:1;}
.fg-tag{font-size:12.5px; color:#caa; letter-spacing:.16em; text-transform:uppercase; margin-top:7px;}
.fg-ref{margin-top:18px; display:flex; align-items:baseline; justify-content:space-between; gap:12px;}
.fg-ref b{font-family:'Fraunces',serif; font-size:21px; font-weight:600;}
.fg-pill{font-size:12px; font-weight:600; padding:5px 11px; border-radius:999px;
  background:#3a2a1c; color:var(--ember); letter-spacing:.04em;}

.fg-card{background:var(--card); border:1px solid var(--line); border-radius:18px; padding:20px; margin-bottom:16px;}
.fg-h{font-family:'Fraunces',serif; font-size:13px; font-weight:600; text-transform:uppercase;
  letter-spacing:.13em; color:var(--muted); margin:0 0 13px;}
.fg-client{font-weight:600; font-size:17px;}
.fg-sub{color:var(--muted); font-size:14px; margin-top:3px;}
.fg-note{margin-top:13px; background:#fff7ec; border-left:3px solid var(--ember);
  padding:10px 13px; border-radius:0 8px 8px 0; font-size:14px;}

.fg-line{display:flex; align-items:baseline; gap:10px; padding:11px 0; border-bottom:1px dashed var(--line);}
.fg-line:last-child{border-bottom:0;}
.fg-qty{font-family:'Fraunces',serif; font-weight:600; color:var(--flame); min-width:30px; font-size:15px;}
.fg-art{flex:1; font-weight:500;}
.fg-det{color:var(--muted); font-size:13px; font-weight:400; margin-top:2px;}
.fg-amt{font-variant-numeric:tabular-nums; font-weight:600; white-space:nowrap;}
.fg-total{display:flex; justify-content:space-between; align-items:center; margin-top:16px;
  padding-top:15px; border-top:2px solid var(--ink);}
.fg-total .l{font-family:'Fraunces',serif; font-weight:600; font-size:16px;}
.fg-total .v{font-family:'Fraunces',serif; font-weight:700; font-size:25px; color:var(--flame-dark); font-variant-numeric:tabular-nums;}

.fg-btn{width:100%; border:0; border-radius:13px; padding:16px; font-family:'Hanken Grotesk',sans-serif;
  font-size:16px; font-weight:700; cursor:pointer; transition:transform .06s ease, filter .15s ease;
  display:flex; align-items:center; justify-content:center; gap:9px;}
.fg-btn:active{transform:scale(.985);}
.fg-btn:disabled{opacity:.55; cursor:default;}
.fg-accept{background:var(--flame); color:#fff;}
.fg-accept:hover:not(:disabled){filter:brightness(1.06);}
.fg-refuse{background:transparent; color:var(--no); border:1.5px solid #e7c6c0;}
.fg-refuse:hover:not(:disabled){background:var(--no-bg);}
.fg-ghost{background:#efe6d7; color:var(--ink);}
.fg-row{display:flex; flex-direction:column; gap:11px; margin-top:4px;}

.fg-label{font-weight:600; font-size:14px; margin:0 0 8px; display:block;}
.fg-input{width:100%; padding:14px; border:1.5px solid var(--line); border-radius:12px;
  font-family:'Hanken Grotesk',sans-serif; font-size:16px; background:#fff; color:var(--ink);}
.fg-input:focus{outline:0; border-color:var(--flame); box-shadow:0 0 0 3px #e2590c22;}

.fg-state{text-align:center; padding:30px 8px 6px;}
.fg-badge{width:62px; height:62px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  margin:0 auto 16px;}
.fg-badge.ok{background:var(--ok-bg); color:var(--ok);}
.fg-badge.no{background:var(--no-bg); color:var(--no);}
.fg-st-title{font-family:'Fraunces',serif; font-size:22px; font-weight:600; margin:0 0 8px;}
.fg-st-text{color:var(--muted); font-size:15px; line-height:1.55; max-width:330px; margin:0 auto;}
.fg-when{display:inline-block; margin-top:14px; background:#fff7ec; border:1px solid #f3dcb5;
  color:var(--flame-dark); font-weight:600; padding:9px 15px; border-radius:11px; font-size:15px;}

.fg-foot{text-align:center; color:var(--muted); font-size:12px; margin-top:8px;}
.fg-spin{width:34px;height:34px;border-radius:50%;border:3px solid var(--line);
  border-top-color:var(--flame); animation:fgsp .8s linear infinite; margin:40px auto;}
@keyframes fgsp{to{transform:rotate(360deg);}}
.fg-fade{animation:fgfade .35s ease both;}
@keyframes fgfade{from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;}}
.fg-demo{background:#fff7ec;border:1px dashed #e8c48a;color:#9a6b13;font-size:12.5px;
  text-align:center;padding:8px;border-radius:10px;margin-bottom:14px;}
`;

const Flame = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5c1.6 3 .3 4.6-1 6-1.4 1.5-2.4 2.8-2.4 4.7A5.4 5.4 0 0 0 12 18a5.4 5.4 0 0 0 5.4-5.4c0-2.4-1.2-3.9-2.3-5.2.4 1.3.1 2.4-.8 3-.2-2.4-1-4.3-2.3-7.9Z"
      fill="#e2590c" />
    <path d="M12 9.5c.9 1.4.2 2.4-.5 3.2-.6.7-1 1.3-1 2.2A2.5 2.5 0 0 0 12 17a2.5 2.5 0 0 0 1.4-4.5c.1.7-.1 1.2-.6 1.5-.1-1.4-.3-2.5-.8-4.5Z"
      fill="#f59e0b" />
  </svg>
);

const Header = ({ order }) => {
  const statut = order?.statut || "—";
  return (
    <div className="fg-head">
      <div className="fg-brand">
        <Flame size={30} />
        <div>
          <div className="fg-name">La Flamme Gourmande</div>
          <div className="fg-tag">Pizzas au feu de bois</div>
        </div>
      </div>
      {order && (
        <div className="fg-ref">
          <b>{order.reference}</b>
          <span className="fg-pill">{statut}</span>
        </div>
      )}
    </div>
  );
};

export default function Traiter() {
  const [phase, setPhase] = useState("loading"); // loading|ready|accepting|error|done-accept|done-refuse|already
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [pickup, setPickup] = useState(defaultPickup());
  const [busy, setBusy] = useState(false);
  const [confirmRefuse, setConfirmRefuse] = useState(false);

  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const ref = params.get("ref") || "";
  const token = params.get("token") || "";
  const demo = !FETCH_WEBHOOK_URL || (!ref && !token);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let data;
        if (demo) {
          await new Promise((r) => setTimeout(r, 550));
          data = DEMO_ORDER;
        } else {
          const res = await fetch(FETCH_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref, token }),
          });
          data = await res.json();
        }
        if (!alive) return;
        if (!data || data.ok === false) {
          setError(data?.error || "Commande introuvable.");
          setPhase("error");
          return;
        }
        setOrder(data);
        setPhase(data.statut && data.statut !== "En attente" ? "already" : "ready");
      } catch (e) {
        if (!alive) return;
        setError("Connexion impossible. Réessaie dans un instant.");
        setPhase("error");
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line

  async function sendDecision(payload) {
    setBusy(true);
    try {
      if (!demo && DECISION_WEBHOOK_URL) {
        await fetch(DECISION_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref, token, ...payload }),
        });
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      return true;
    } catch {
      setError("L'envoi a échoué. Vérifie ta connexion et réessaie.");
      setPhase("error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept() {
    if (!pickup) return;
    const ok = await sendDecision({ action: "accept", heureRetrait: pickup });
    if (ok) setPhase("done-accept");
  }

  async function handleRefuse() {
    const ok = await sendDecision({ action: "refuse" });
    if (ok) setPhase("done-refuse");
  }

  return (
    <div className="fg-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="fg-shell">
        <Header order={phase === "loading" || phase === "error" ? null : order} />

        {demo && phase !== "loading" && (
          <div className="fg-demo">Mode démo — renseigne tes webhooks Make pour passer en réel.</div>
        )}

        {phase === "loading" && <div className="fg-spin" />}

        {phase === "error" && (
          <div className="fg-card fg-fade">
            <div className="fg-state">
              <div className="fg-badge no" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9.2"/></svg>
              </div>
              <h2 className="fg-st-title">Oups</h2>
              <p className="fg-st-text">{error}</p>
            </div>
          </div>
        )}

        {(phase === "ready" || phase === "accepting") && order && (
          <div className="fg-fade">
            <div className="fg-card">
              <p className="fg-h">Client</p>
              <div className="fg-client">{order.nomClient}</div>
              <div className="fg-sub">{order.telephone}</div>
              {order.note ? <div className="fg-note"><b>Note :</b> {order.note}</div> : null}
            </div>

            <div className="fg-card">
              <p className="fg-h">Commande</p>
              {order.articles.map((a, i) => (
                <div className="fg-line" key={i}>
                  <span className="fg-qty">{a.quantite}×</span>
                  <span className="fg-art">
                    {a.nom}
                    {a.detail ? <span className="fg-det">{a.detail}</span> : null}
                  </span>
                  <span className="fg-amt">{euro(a.montantLigne)}</span>
                </div>
              ))}
              <div className="fg-total">
                <span className="l">Total</span>
                <span className="v">{euro(order.total)}</span>
              </div>
            </div>

            {phase === "ready" && !confirmRefuse && (
              <div className="fg-row">
                <button className="fg-btn fg-accept" onClick={() => setPhase("accepting")}>
                  Accepter la commande
                </button>
                <button className="fg-btn fg-refuse" onClick={() => setConfirmRefuse(true)}>
                  Refuser
                </button>
              </div>
            )}

            {phase === "ready" && confirmRefuse && (
              <div className="fg-card fg-fade" style={{ borderColor: "#e7c6c0" }}>
                <p className="fg-h" style={{ color: "var(--no)" }}>Refuser cette commande ?</p>
                <p className="fg-st-text" style={{ margin: "0 0 16px", textAlign: "left" }}>
                  Le client sera prévenu que sa commande ne peut pas être préparée.
                </p>
                <div className="fg-row">
                  <button className="fg-btn fg-refuse" onClick={handleRefuse} disabled={busy}>
                    {busy ? "Envoi…" : "Oui, refuser"}
                  </button>
                  <button className="fg-btn fg-ghost" onClick={() => setConfirmRefuse(false)} disabled={busy}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {phase === "accepting" && (
              <div className="fg-card fg-fade">
                <label className="fg-label" htmlFor="pickup">Heure de retrait proposée</label>
                <input id="pickup" className="fg-input" type="datetime-local"
                  value={pickup} onChange={(e) => setPickup(e.target.value)} />
                <div className="fg-row" style={{ marginTop: 16 }}>
                  <button className="fg-btn fg-accept" onClick={handleAccept} disabled={busy || !pickup}>
                    {busy ? "Envoi…" : "Confirmer et prévenir le client"}
                  </button>
                  <button className="fg-btn fg-ghost" onClick={() => setPhase("ready")} disabled={busy}>
                    Retour
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "already" && order && (
          <div className="fg-card fg-fade">
            <div className="fg-state">
              <div className="fg-badge ok" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h2 className="fg-st-title">Déjà traitée</h2>
              <p className="fg-st-text">Cette commande est au statut « {order.statut} ». Aucune action supplémentaire n'est nécessaire.</p>
            </div>
          </div>
        )}

        {phase === "done-accept" && (
          <div className="fg-card fg-fade">
            <div className="fg-state">
              <div className="fg-badge ok" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h2 className="fg-st-title">Commande acceptée</h2>
              <p className="fg-st-text">Le client va recevoir une notification pour confirmer le retrait.</p>
              <span className="fg-when">Retrait : {prettyPickup(pickup)}</span>
            </div>
          </div>
        )}

        {phase === "done-refuse" && (
          <div className="fg-card fg-fade">
            <div className="fg-state">
              <div className="fg-badge no" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </div>
              <h2 className="fg-st-title">Commande refusée</h2>
              <p className="fg-st-text">Le client a été informé. Merci.</p>
            </div>
          </div>
        )}

        <p className="fg-foot">La Flamme Gourmande · Vagney</p>
      </div>
    </div>
  );
}
