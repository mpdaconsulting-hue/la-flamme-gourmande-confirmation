import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingBag, Plus, Minus, X, Clock, MapPin, Phone,
  Flame, ChevronLeft, ChevronRight, Sparkles, Store, Check,
} from "lucide-react";

/* ============================================================
   PALETTE
   ============================================================ */
const C = {
  bg: "#fbf6ee", surface: "#ffffff", ink: "#231a13", inkSoft: "#6f6356",
  line: "#ece0d0", ember: "#e0531c", emberDark: "#b73e0c",
  gold: "#e2a32f", cream: "#f6ecdc", green: "#2f7d4f",
};

/* ============================================================
   DONNÉES (carte à emporter laflammegourmande.fr)
   ============================================================ */
const SIZES = [
  { label: "Dégustation", cm: "26 cm" },
  { label: "Normale", cm: "29 cm" },
  { label: "Gourmande", cm: "33 cm" },
];

const PIZZAS = [
  ["Marguerita", "tomate, mozzarella, olives, fromage, herbes", [8.0, 10.0, 11.5]],
  ["Capri", "tomate, jambon, crème fraîche, mozzarella, herbes", [10.5, 12.0, 13.5]],
  ["Reinette", "tomate, jambon, champignons frais, mozzarella, herbes", [10.5, 12.0, 13.5]],
  ["Tout feu", "tomate, jambon, lardons, oignons, crème, mozzarella", [11.0, 12.5, 14.0]],
  ["Tout pizz'", "crème, lardons, oignons, jambon cru, p. de terre, mozza", [11.0, 12.5, 14.0]],
  ["Paysanne", "tomate, lardons, œuf, oignons, mozzarella, herbes", [10.5, 12.0, 13.5]],
  ["Flamme", "crème fraîche, lardons, oignons, mozzarella, herbes", [10.5, 12.0, 13.5]],
  ["Montagnarde", "crème, lardons, oignons, p. de terre, munster, mozza", [11.5, 13.0, 14.5]],
  ["Savoyarde", "crème, lardons, oignons, p. de terre, reblochon, salade", [11.5, 13.0, 14.5]],
  ["Nordique", "crème, asperges, saumon, beurre d'escargot, oignons, œuf", [12.5, 14.0, 15.5]],
  ["Saint-Jacques", "crème, St-Jacques, crevettes, beurre d'escargot, oignons", [13.5, 15.0, 16.5]],
  ["Fruit de mer", "tomate, fruits de mer, beurre d'escargot, olives, mozza", [12.0, 13.5, 15.0]],
  ["Sicilienne", "tomate, anchois, câpres, olives, mozzarella, herbes", [10.5, 12.0, 13.5]],
  ["Bourguignonne", "tomate, escargots, beurre persillé, champignons, œuf, crème", [12.0, 13.5, 15.0]],
  ["Exotique", "tomate, volaille marinée, ananas, mozza, crème, herbes", [11.0, 12.5, 14.0]],
  ["Parma", "tomate, jambon, champignons, jambon cru, crème, mozza", [11.0, 12.5, 14.0]],
  ["Végétarienne", "tomate, artichauts, asperges, poivrons, aubergines, œuf", [11.5, 13.0, 14.5]],
  ["Américaine", "tomate, bœuf haché, oignons, poivrons, crème, œuf, mozza", [11.5, 13.0, 14.5]],
  ["Espagnole", "tomate, chorizo, poivrons, œuf, oignons, mozzarella", [11.0, 12.5, 14.0]],
  ["Aveyronnaise", "tomate, volaille marinée, bleu, crème fraîche, mozza", [11.5, 13.0, 14.5]],
  ["4 fromages", "tomate, chèvre, munster, bleu, mozza, olives, herbes", [11.5, 13.0, 14.5]],
  ["Provençale", "pesto, aubergines, courgettes, poivrons, tomates séchées, jambon cru", [12.0, 13.5, 15.0]],
  ["Chèvre", "tomate, chèvre, lardons, oignons, crème, mozza, miel", [11.0, 12.5, 14.0]],
  ["Voinraude", "crème moutarde, volaille, champignons, olives, mozzarella", [11.5, 13.0, 14.5]],
  ["Méditerranéenne", "tomate, jambon, aubergines, poivrons, crème, olives, mozza", [11.5, 13.0, 14.5]],
  ["Hawaïenne", "crème, crevettes, crabe, ananas, olives, beurre d'escargot", [11.5, 13.0, 14.5]],
  ["Guédonne", "crème moutarde, oignons, andouille, lardons, tomate fraîche", [11.5, 13.0, 14.5]],
  ["Ajolaise", "crème moutarde, oignons, p. de terre, andouille, cancoillotte", [11.5, 13.0, 14.5]],
  ["Pêcheur", "crème, épinards, saumon, olives, oignons, mozzarella", [12.5, 14.0, 15.5]],
  ["Gourmande", "crème, épinards, chèvre, jambon cru, oignons, mozza", [12.0, 13.5, 15.0]],
  ["Kebab", "crème au curry, viande kebab, oignons, tomate, poivrons", [11.5, 13.0, 14.5]],
  ["Pesto", "pesto, tomate fraîche, jambon cru, olives, parmesan, mozza", [11.5, 13.0, 14.5]],
  ["Burrata", "tomate, jambon cru, tomates séchées, crème balsamique, burrata, roquette", [13.5, 15.0, 16.5]],
  ["Bambino", "béchamel, jambon, mozzarella, fromage, herbes", [10.5, 12.0, 13.5], true],
  ["Vera Margherita", "tomate, huile d'olive, mozzarella fiordilatte, parmesan, basilic", [10.5, 12.0, 13.5], true],
  ["Burger", "sauce burger, bœuf haché, cheddar, pickles, bacon, tomates, oignons crispy", [12.5, 14.0, 15.5], true],
  ["Thono", "tomates, thon, crevettes, crème, mozzarella, aneth, pesto", [11.0, 12.5, 14.0], true],
];

const PIZZAS_SUCREES = [
  ["Réunionnaise", "crème anglaise, banane, ananas, noix de coco, chocolat", [8.5, 10.0, 11.5]],
  ["Calvados", "crème anglaise, pomme, cannelle, flambée au Calvados", [8.5, 10.0, 11.5]],
];

const PATES = [
  ["Lasagnes façon Mama", "bolognaise, sauce blanche, jambon, champignons, gratinées", 14.5],
  ["Lasagnes saumon crevettes", "sauce tomate basilic, saumon, sauce blanche, gratinée", 16.5],
  ["Tagliatelles carbonara", "crème, lardons, oignons, œuf", 14.5],
  ["Tagliatelles bolognaise", "bœuf haché, sauce bolognaise, crème", 14.5, true],
  ["Tagliatelles pesto & jambon cru", "pesto, crème, parmesan, chiffonnade de jambon cru", 15.5],
  ["Tagliatelles St-Jacques", "noix de St-Jacques, sauce safranée, parmesan", 17.5],
  ["Raviolis ricotta épinards", "roquette, sauce Parmigiano, parmesan", 15.0],
  ["Raviolis saumon", "saumon fumé, sauce safranée, parmesan", 15.0],
  ["Gnocchis", "sauce Parmigiano, parmesan, jambon cru", 15.0],
];

const SALADES = [
  ["Salade Meli mélo", "salade, St-Jacques & crevettes poêlées, gambas rôties", 16.0, true],
  ["Salade périgourdine", "foie gras, gésiers confits, magret fumé, tomates, chutney", 17.0],
  ["Salade de nos montagnes", "pdt, lardons, crème, cromesquis de munster, œuf parfait", 13.5],
  ["Salade de chèvre chaud", "lardons, tomates, noix, toast chèvre, œuf parfait", 12.0],
  ["Salade vosgienne", "pdt, lardons, croûtons, crème, œuf parfait", 12.0],
  ["Salade César", "poulet pané, tomates séchées, anchois, parmesan, sauce césar", 13.5],
  ["Salade Maraîchère", "légumes confits du moment, tomates, pickles", 12.0],
];

const VIANDES = [
  ["Entrecôte grillée", "frites ou légumes du jour", 24.0],
  ["Pièce du boucher", "frites ou légumes du jour", 23.0],
  ["Burger du pêcheur", "pain curry, escalope de saumon, sauce, frites", 20.0, true],
  ["Burger poulet", "tender poulet, tomates séchées, oignons confits, cheddar, frites", 20.0],
  ["Burger vosgien", "steak haché, lard grillé, munster, crème de munster, frites", 20.0],
  ["Burger végétarien", "galette de légumes, burrata, tomates, frites, salade", 19.0],
  ["Dos de cabillaud", "risotto crémeux aux champignons", 20.0],
];

const DESSERTS = [
  ["Tiramisu Speculoos", "mascarpone, speculoos, coulis noisette", 6.8],
  ["Moelleux fondant chocolat", "fondant chocolat, crème anglaise", 6.8],
  ["Panna cotta", "vanille, coulis framboise", 6.2],
  ["Île flottante", "blanc en neige, crème anglaise, amandes, caramel", 5.8],
  ["Assiette de fromages", "sélection du moment", 6.5],
];

const BOISSONS = [
  ["Coca-Cola 33 cl", "canette", 2.5],
  ["Eau minérale 50 cl", "plate ou pétillante", 2.0],
  ["Ice Tea 33 cl", "canette", 2.5],
  ["Jus de fruits", "abricot, pomme, orange", 2.5],
];

const CATEGORIES = [
  { id: "pizzas", label: "Pizzas", emoji: "🍕", type: "pizza", cat: "Pizza", items: PIZZAS },
  { id: "sucrees", label: "Pizzas sucrées", emoji: "🍫", type: "pizza-sweet", cat: "Pizza sucrée", items: PIZZAS_SUCREES },
  { id: "pates", label: "Pâtes", emoji: "🍝", type: "plat", cat: "Pâtes", items: PATES },
  { id: "salades", label: "Salades", emoji: "🥗", type: "plat", cat: "Salade", items: SALADES },
  { id: "viandes", label: "Viandes & poissons", emoji: "🥩", type: "plat", cat: "Viande", items: VIANDES },
  { id: "desserts", label: "Desserts", emoji: "🍮", type: "plat", cat: "Dessert", items: DESSERTS },
  { id: "boissons", label: "Boissons", emoji: "🥤", type: "plat", cat: "Boisson", items: BOISSONS },
];

/* URL du webhook Make (scénario 1 — réception de la demande) */
const WEBHOOK_URL = "https://hook.eu2.make.com/fl5y3b278z1crtiqu73fpdktwdocknk6";

/* Plats qui demandent une cuisson */
const CUISSON_ITEMS = new Set(["Entrecôte grillée", "Pièce du boucher"]);
const CUISSONS = ["Bleu", "Saignant", "À point", "Bien cuit"];

/* Suppléments pizzas */
const SUPP = ["Jambon", "Champignons", "Oignons", "Lardons", "Œuf", "Chèvre",
  "Chorizo", "Poivrons", "Ananas", "Crème fraîche", "Mozzarella", "Olives"];
const SUPP_PREMIUM = ["Saint-Jacques", "Saumon"];
const suppPrice = (s) => (SUPP_PREMIUM.includes(s) ? 3.5 : 2.0);

const eur = (n) => n.toFixed(2).replace(".", ",") + " €";

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [cart, setCart] = useState([]);       // {uid, name, detail, unit, qty}
  const [catIndex, setCatIndex] = useState(0);
  const [pizzaModal, setPizzaModal] = useState(null);   // {name, desc, prices, customizable}
  const [cuissonModal, setCuissonModal] = useState(null); // {name, price}
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState("menu");   // menu | checkout | done
  const [form, setForm] = useState({ nom: "", tel: "", email: "", note: "" });
  const [orderNo, setOrderNo] = useState(null);
  const [sending, setSending] = useState(false);

  const pagerRef = useRef(null);
  const tabsRef = useRef([]);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.unit * i.qty, 0);
  const anyModal = pizzaModal || cuissonModal;

  const addItem = (name, detail, unit, categorie) => {
    const uid = name + "|" + (detail || "");
    setCart((c) => {
      const ex = c.find((i) => i.uid === uid);
      if (ex) return c.map((i) => (i.uid === uid ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { uid, name, detail: detail || "", unit, qty: 1, categorie: categorie || "" }];
    });
  };
  const changeQty = (uid, d) =>
    setCart((c) => c.map((i) => (i.uid === uid ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));

  const go = (i) => {
    const n = Math.max(0, Math.min(CATEGORIES.length - 1, i));
    const el = pagerRef.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
    setCatIndex(n);
  };
  const onPagerScroll = () => {
    const el = pagerRef.current; if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== catIndex) setCatIndex(i);
  };
  useEffect(() => {
    const t = tabsRef.current[catIndex];
    if (t) t.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [catIndex]);

  const onAddClick = (cat, name, desc, price) => {
    if (cat.type === "pizza") setPizzaModal({ name, desc, prices: price, customizable: true, categorie: cat.cat });
    else if (cat.type === "pizza-sweet") setPizzaModal({ name, desc, prices: price, customizable: false, categorie: cat.cat });
    else if (cat.id === "viandes" && CUISSON_ITEMS.has(name)) setCuissonModal({ name, price, categorie: cat.cat });
    else addItem(name, "", price, cat.cat);
  };

  const placeOrder = async () => {
    const ref = "FG-" + Math.floor(1000 + Math.random() * 9000);
    const payload = {
      reference: ref,
      client: { nom: form.nom, telephone: form.tel, email: form.email, note: form.note },
      total: Number(total.toFixed(2)),
      articles: cart.map((i) => ({
        article: i.name,
        categorie: i.categorie || "",
        quantite: i.qty,
        prix_unitaire: i.unit,
        detail: i.detail || "",
      })),
    };
    setSending(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // En démo, la donnée part vers Make même si la lecture de la réponse échoue (CORS).
    }
    setSending(false);
    setOrderNo(ref);
    setStep("done");
  };

  return (
    <div style={{ background: C.bg, color: C.ink, fontFamily: "'DM Sans',sans-serif" }}
         className="w-full flex justify-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box} ::-webkit-scrollbar{height:0;width:0}
        .disp{font-family:'Fraunces',serif}
        .pop{animation:pop .25s ease}@keyframes pop{0%{transform:scale(.96);opacity:.4}100%{transform:scale(1);opacity:1}}
        .sheet{animation:up .3s cubic-bezier(.2,.8,.2,1)}@keyframes up{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>

      <div className="w-full flex flex-col relative" style={{ maxWidth: 480, height: "100vh" }}>
        {/* ===== HEADER ===== */}
        <header style={{ background: `linear-gradient(150deg,#2a1c12,#4a2410 60%,${C.emberDark})` }}
                className="relative px-5 pt-5 pb-4 text-white overflow-hidden shrink-0">
          <div style={{ position: "absolute", right: -30, top: -30, width: 150, height: 150,
            borderRadius: "50%", background: "radial-gradient(circle,#e0531c66,transparent 70%)" }} />
          <div className="flex items-center gap-2 mb-1">
            <Flame size={18} color={C.gold} fill={C.gold} />
            <span className="text-[11px] tracking-widest uppercase" style={{ color: C.gold }}>
              Pizzeria au feu de bois · Vagney
            </span>
          </div>
          <h1 className="disp" style={{ fontSize: 28, lineHeight: 1.05, fontWeight: 900 }}>
            La Flamme Gourmande
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[11px]" style={{ color: "#e9d8c4" }}>
            <span className="flex items-center gap-1"><Store size={12} /> À emporter</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> 2 rue Robert Claudel</span>
            <span className="flex items-center gap-1"><Phone size={12} /> 03 29 26 70 70</span>
          </div>
        </header>

        {/* ===== TABS ===== */}
        <nav className="px-3 py-2 flex gap-2 overflow-x-auto shrink-0"
             style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
          {CATEGORIES.map((cat, i) => {
            const on = catIndex === i;
            return (
              <button key={cat.id} ref={(el) => (tabsRef.current[i] = el)} onClick={() => go(i)}
                className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition"
                style={{ background: on ? C.ember : C.surface, color: on ? "#fff" : C.inkSoft,
                  border: `1px solid ${on ? C.ember : C.line}` }}>
                <span className="mr-1">{cat.emoji}</span>{cat.label}
              </button>
            );
          })}
        </nav>

        {/* ===== PAGER (swipe gauche/droite) ===== */}
        <div ref={pagerRef} onScroll={onPagerScroll}
             className="flex-1 flex overflow-x-auto overflow-y-hidden"
             style={{ scrollSnapType: "x mandatory" }}>
          {CATEGORIES.map((cat) => (
            <section key={cat.id} className="h-full overflow-y-auto px-4 pb-28 pt-4"
                     style={{ flex: "0 0 100%", scrollSnapAlign: "start" }}>
              <h2 className="disp flex items-center gap-2" style={{ fontSize: 23, fontWeight: 700 }}>
                <span>{cat.emoji}</span> {cat.label}
              </h2>
              {(cat.type === "pizza" || cat.type === "pizza-sweet") && (
                <p className="text-xs mb-3 mt-0.5" style={{ color: C.inkSoft }}>
                  3 tailles · {SIZES.map((s) => `${s.label} ${s.cm}`).join(" · ")}
                  {cat.type === "pizza" && " · personnalisable"}
                </p>
              )}
              {cat.id === "viandes" && (
                <p className="text-xs mb-3 mt-0.5" style={{ color: C.gold }}>
                  Entrecôte &amp; pièce du boucher : choix de la cuisson
                </p>
              )}
              {cat.id === "boissons" && (
                <p className="text-xs mb-3 mt-0.5" style={{ color: C.gold }}>
                  Prix indicatifs — à confirmer avec la carte du restaurant
                </p>
              )}

              <div className="flex flex-col gap-2.5 mt-3">
                {cat.items.map((it) => {
                  const isPizza = cat.type === "pizza" || cat.type === "pizza-sweet";
                  const [name, desc, price, nouveau] = it;
                  const from = isPizza ? price[0] : price;
                  return (
                    <article key={name} className="rounded-2xl p-3.5 flex items-start justify-between gap-3"
                             style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold" style={{ fontSize: 15.5 }}>{name}</h3>
                          {nouveau && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                                  style={{ background: C.cream, color: C.emberDark }}>
                              <Sparkles size={9} /> NEW
                            </span>
                          )}
                          {cat.id === "viandes" && CUISSON_ITEMS.has(name) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ background: "#f3e6cf", color: C.gold }}>CUISSON</span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: C.inkSoft }}>{desc}</p>
                        <div className="mt-2 font-bold" style={{ color: C.emberDark, fontSize: 14 }}>
                          {isPizza ? `dès ${eur(from)}` : eur(from)}
                        </div>
                      </div>
                      <button onClick={() => onAddClick(cat, name, desc, price)}
                        className="shrink-0 rounded-xl flex items-center justify-center pop"
                        style={{ width: 40, height: 40, background: C.ember, color: "#fff" }}
                        aria-label={"Ajouter " + name}><Plus size={20} /></button>
                    </article>
                  );
                })}
              </div>

              {cat.type === "pizza" && (
                <p className="text-center text-[11px] mt-5" style={{ color: C.inkSoft }}>
                  Suppléments : +2,00 € · Saint-Jacques / Saumon : +3,50 €
                </p>
              )}
            </section>
          ))}
        </div>

        {/* ===== FLÈCHES ===== */}
        {!anyModal && !cartOpen && (
          <>
            {catIndex > 0 && (
              <button onClick={() => go(catIndex - 1)} aria-label="Précédent"
                className="absolute rounded-full flex items-center justify-center pop"
                style={{ left: 6, top: "55%", width: 36, height: 36, background: "#ffffffee",
                  border: `1px solid ${C.line}`, color: C.ember, boxShadow: "0 4px 12px #0002" }}>
                <ChevronLeft size={20} />
              </button>
            )}
            {catIndex < CATEGORIES.length - 1 && (
              <button onClick={() => go(catIndex + 1)} aria-label="Suivant"
                className="absolute rounded-full flex items-center justify-center pop"
                style={{ right: 6, top: "55%", width: 36, height: 36, background: "#ffffffee",
                  border: `1px solid ${C.line}`, color: C.ember, boxShadow: "0 4px 12px #0002" }}>
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}

        {/* ===== BOUTON PANIER ===== */}
        {count > 0 && step === "menu" && !cartOpen && !anyModal && (
          <div className="absolute bottom-0 left-0 right-0 z-30 p-3"
               style={{ background: `linear-gradient(transparent,${C.bg} 40%)` }}>
            <button onClick={() => setCartOpen(true)}
              className="w-full rounded-2xl px-5 py-3.5 flex items-center justify-between text-white font-bold pop"
              style={{ background: C.ember, boxShadow: "0 10px 30px #e0531c55" }}>
              <span className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-sm" style={{ background: "#ffffff33" }}>{count}</span>
                Voir le panier
              </span>
              <span className="flex items-center gap-1">{eur(total)} <ShoppingBag size={18} /></span>
            </button>
          </div>
        )}

        {/* ===== MODAL PIZZA ===== */}
        {pizzaModal && (
          <PizzaModal data={pizzaModal} onClose={() => setPizzaModal(null)}
            onAdd={(label, detail, unit) => { addItem(label, detail, unit, pizzaModal.categorie); setPizzaModal(null); }} />
        )}

        {/* ===== MODAL CUISSON ===== */}
        {cuissonModal && (
          <Overlay onClose={() => setCuissonModal(null)}>
            <div className="sheet rounded-t-3xl p-5" style={{ background: C.surface }}>
              <Grab />
              <h3 className="disp text-2xl font-bold">{cuissonModal.name}</h3>
              <p className="text-sm mb-4" style={{ color: C.inkSoft }}>Choisissez la cuisson</p>
              <div className="flex flex-col gap-2">
                {CUISSONS.map((cu) => (
                  <button key={cu}
                    onClick={() => { addItem(cuissonModal.name, "Cuisson : " + cu, cuissonModal.price, cuissonModal.categorie); setCuissonModal(null); }}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-semibold"
                    style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                    {cu}<span style={{ color: C.emberDark }}>{eur(cuissonModal.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </Overlay>
        )}

        {/* ===== PANIER / CHECKOUT ===== */}
        {cartOpen && (
          <Overlay onClose={() => { if (step !== "done") setCartOpen(false); }}>
            <div className="sheet rounded-t-3xl flex flex-col" style={{ background: C.surface, maxHeight: "88vh" }}>
              <div className="p-5 pb-3 shrink-0" style={{ borderBottom: `1px solid ${C.line}` }}>
                <Grab />
                <div className="flex items-center justify-between">
                  {step === "checkout" ? (
                    <button onClick={() => setStep("menu")} className="flex items-center gap-1 text-sm font-semibold"
                            style={{ color: C.inkSoft }}><ChevronLeft size={18} /> Panier</button>
                  ) : <span className="disp text-2xl font-bold">
                        {step === "done" ? "Demande envoyée" : "Votre commande"}</span>}
                  {step !== "done" && (
                    <button onClick={() => setCartOpen(false)} style={{ color: C.inkSoft }}><X size={22} /></button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto p-5 flex-1">
                {step === "menu" && (
                  <div className="flex flex-col gap-3.5">
                    {cart.map((i) => (
                      <div key={i.uid} className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{i.name}</div>
                          {i.detail && <div className="text-xs italic" style={{ color: C.inkSoft }}>{i.detail}</div>}
                          <div className="text-xs" style={{ color: C.inkSoft }}>{eur(i.unit)}</div>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-full px-1.5 py-1"
                             style={{ border: `1px solid ${C.line}` }}>
                          <button onClick={() => changeQty(i.uid, -1)} style={{ color: C.ember }}><Minus size={16} /></button>
                          <span className="font-bold text-sm w-4 text-center">{i.qty}</span>
                          <button onClick={() => changeQty(i.uid, 1)} style={{ color: C.ember }}><Plus size={16} /></button>
                        </div>
                        <div className="font-bold text-sm w-16 text-right">{eur(i.unit * i.qty)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {step === "checkout" && (
                  <div className="flex flex-col gap-3.5">
                    <Field label="Nom *" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} placeholder="Votre nom" />
                    <Field label="Téléphone *" value={form.tel} type="tel" onChange={(v) => setForm({ ...form, tel: v })} placeholder="06 ..." />
                    <Field label="E-mail *" value={form.email} type="email" onChange={(v) => setForm({ ...form, email: v })} placeholder="vous@email.fr" />
                    <div>
                      <label className="text-xs font-semibold" style={{ color: C.inkSoft }}>Note (optionnel)</label>
                      <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                        rows={2} placeholder="Allergies, précisions…"
                        className="w-full mt-1 rounded-xl px-3 py-2.5 text-sm"
                        style={{ background: C.bg, border: `1px solid ${C.line}`, color: C.ink }} />
                    </div>
                    <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: C.cream, color: C.emberDark }}>
                      Votre demande sera étudiée par le restaurant. Vous recevrez un <b>e-mail</b> avec le <b>créneau de retrait proposé</b> : il vous suffira de cliquer pour le confirmer. Paiement sur place au retrait.
                    </div>
                  </div>
                )}

                {step === "done" && (
                  <div className="text-center py-4">
                    <div className="mx-auto mb-4 rounded-full flex items-center justify-center"
                         style={{ width: 64, height: 64, background: C.gold }}><Clock size={32} color="#fff" /></div>
                    <p className="disp text-xl font-bold">Demande envoyée, merci {form.nom || ""} !</p>
                    <p className="text-sm mt-1" style={{ color: C.inkSoft }}>
                      Demande <b style={{ color: C.ink }}>{orderNo}</b> · en attente de validation</p>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: C.inkSoft }}>
                      Le restaurant va l'étudier et vous enverra un e-mail à <b style={{ color: C.ink }}>{form.email}</b> avec le créneau de retrait à confirmer.</p>
                    <div className="text-left rounded-2xl p-4 mt-5" style={{ background: C.bg }}>
                      {cart.map((i) => (
                        <div key={i.uid} className="flex justify-between text-sm py-0.5">
                          <span>{i.qty}× {i.name}{i.detail ? ` (${i.detail})` : ""}</span><span>{eur(i.unit * i.qty)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold mt-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                        <span>Total estimé</span><span>{eur(total)}</span></div>
                    </div>
                    <button onClick={() => { setCart([]); setStep("menu"); setCartOpen(false); setForm({ nom: "", tel: "", email: "", note: "" }); }}
                      className="mt-5 w-full rounded-2xl py-3 font-bold text-white" style={{ background: C.ember }}>
                      Nouvelle commande</button>
                  </div>
                )}
              </div>

              {step !== "done" && (
                <div className="p-5 pt-3 shrink-0" style={{ borderTop: `1px solid ${C.line}` }}>
                  <div className="flex justify-between mb-3 font-bold">
                    <span>Total</span><span style={{ color: C.emberDark }}>{eur(total)}</span></div>
                  {step === "menu" ? (
                    <button onClick={() => setStep("checkout")}
                      className="w-full rounded-2xl py-3.5 font-bold text-white" style={{ background: C.ember }}>Commander</button>
                  ) : (
                    <button onClick={placeOrder} disabled={!form.nom || !form.tel || !form.email || sending}
                      className="w-full rounded-2xl py-3.5 font-bold text-white"
                      style={{ background: !form.nom || !form.tel || !form.email || sending ? "#cbb9a6" : C.green }}>
                      {sending ? "Envoi en cours…" : `Envoyer ma demande · ${eur(total)}`}</button>
                  )}
                </div>
              )}
            </div>
          </Overlay>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MODAL PIZZA PERSONNALISABLE
   ============================================================ */
function PizzaModal({ data, onClose, onAdd }) {
  const { name, desc, prices, customizable } = data;
  const base = desc.split(", ");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [removed, setRemoved] = useState([]);
  const [extras, setExtras] = useState([]);

  const toggle = (arr, set, v) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const unit = prices[sizeIdx] + extras.reduce((s, e) => s + suppPrice(e), 0);

  const submit = () => {
    const label = `${name} (${SIZES[sizeIdx].cm})`;
    const parts = [];
    if (removed.length) parts.push("Sans " + removed.join(", "));
    if (extras.length) parts.push("+ " + extras.join(", "));
    onAdd(label, parts.join(" · "), unit);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="sheet rounded-t-3xl flex flex-col" style={{ background: C.surface, maxHeight: "88vh" }}>
        <div className="p-5 pb-3 shrink-0" style={{ borderBottom: `1px solid ${C.line}` }}>
          <Grab />
          <h3 className="disp text-2xl font-bold">{name}</h3>
          <p className="text-xs" style={{ color: C.inkSoft }}>{desc}</p>
        </div>

        <div className="overflow-y-auto p-5 flex-1 flex flex-col gap-5">
          {/* Taille */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.inkSoft }}>Taille</p>
            <div className="flex flex-col gap-2">
              {SIZES.map((s, i) => {
                const on = sizeIdx === i;
                return (
                  <button key={s.cm} onClick={() => setSizeIdx(i)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ background: on ? C.cream : C.bg, border: `1px solid ${on ? C.ember : C.line}` }}>
                    <span className="text-left flex items-center gap-2">
                      <span className="rounded-full flex items-center justify-center" style={{ width: 18, height: 18,
                        border: `2px solid ${on ? C.ember : "#cbb9a6"}`, background: on ? C.ember : "transparent" }}>
                        {on && <Check size={11} color="#fff" />}</span>
                      <span><span className="font-bold block">{s.label}</span>
                        <span className="text-xs" style={{ color: C.inkSoft }}>{s.cm}</span></span>
                    </span>
                    <span className="font-bold" style={{ color: C.emberDark }}>{eur(prices[i])}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {customizable && (
            <>
              {/* Retirer */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.inkSoft }}>
                  Retirer des ingrédients</p>
                <div className="flex flex-wrap gap-2">
                  {base.map((ing) => {
                    const off = removed.includes(ing);
                    return (
                      <button key={ing} onClick={() => toggle(removed, setRemoved, ing)}
                        className="rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{ background: off ? "#fbe9e3" : C.bg,
                          border: `1px solid ${off ? C.ember : C.line}`,
                          color: off ? C.emberDark : C.ink,
                          textDecoration: off ? "line-through" : "none" }}>
                        {off ? "✕ " : ""}{ing}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ajouter */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.inkSoft }}>
                  Ajouter un supplément</p>
                <div className="flex flex-wrap gap-2">
                  {[...SUPP, ...SUPP_PREMIUM].map((s) => {
                    const on = extras.includes(s);
                    return (
                      <button key={s} onClick={() => toggle(extras, setExtras, s)}
                        className="rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{ background: on ? C.ember : C.bg, color: on ? "#fff" : C.ink,
                          border: `1px solid ${on ? C.ember : C.line}` }}>
                        {on ? "✓ " : "+ "}{s} <span style={{ opacity: .8, fontSize: 11 }}>({eur(suppPrice(s))})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 pt-3 shrink-0" style={{ borderTop: `1px solid ${C.line}` }}>
          <button onClick={submit}
            className="w-full rounded-2xl py-3.5 font-bold text-white flex items-center justify-center gap-2"
            style={{ background: C.ember }}>
            <Plus size={18} /> Ajouter · {eur(unit)}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/* ============================================================
   UTILITAIRES
   ============================================================ */
function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: "#00000066" }} onClick={onClose}>
      <div className="w-full" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
function Grab() {
  return <div className="mx-auto mb-3 rounded-full" style={{ width: 40, height: 4, background: "#d8c9b6" }} />;
}
function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-semibold" style={{ color: "#6f6356" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full mt-1 rounded-xl px-3 py-2.5 text-sm"
        style={{ background: "#fbf6ee", border: "1px solid #ece0d0", color: "#231a13" }} />
    </div>
  );
}
