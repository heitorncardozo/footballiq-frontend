import { useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const API_URL = "https://footballiq-backend-production-089f.up.railway.app";
async function apiPost(endpoint, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(`${API_URL}${endpoint}`, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || "Erro desconhecido");
  return data;
}

const MOCK_ANALYSIS = [
  { id: 1, home_team: "Flamengo", away_team: "Palmeiras", liga: "Brasileirão Série A", data: "2026-03-20", home_goals_exp: 2.1, away_goals_exp: 1.4, probabilidades: { home_win: 0.536, draw: 0.210, away_win: 0.254, over_2_5: 0.679 }, value_bets: [{ mercado: "Over 2.5", odd: 1.65, prob_calc: 67.9, prob_impl: 60.6, ev: 0.121, is_vb: true }, { mercado: "Fora (2)", odd: 4.20, prob_calc: 25.4, prob_impl: 23.8, ev: 0.067, is_vb: true }, { mercado: "Casa (1)", odd: 1.78, prob_calc: 53.6, prob_impl: 56.2, ev: -0.046, is_vb: false }, { mercado: "Empate (X)", odd: 3.90, prob_calc: 21.0, prob_impl: 25.6, ev: -0.181, is_vb: false }] },
  { id: 2, home_team: "São Paulo", away_team: "Corinthians", liga: "Brasileirão Série A", data: "2026-03-20", home_goals_exp: 1.3, away_goals_exp: 1.3, probabilidades: { home_win: 0.368, draw: 0.264, away_win: 0.368, over_2_5: 0.482 }, value_bets: [{ mercado: "Casa (1)", odd: 2.54, prob_calc: 36.8, prob_impl: 39.4, ev: -0.066, is_vb: false }, { mercado: "Empate (X)", odd: 3.20, prob_calc: 26.4, prob_impl: 31.2, ev: -0.155, is_vb: false }, { mercado: "Under 2.5", odd: 1.85, prob_calc: 51.8, prob_impl: 54.1, ev: -0.042, is_vb: false }] },
  { id: 3, home_team: "Atlético-MG", away_team: "Fluminense", liga: "Brasileirão Série A", data: "2026-03-21", home_goals_exp: 1.8, away_goals_exp: 1.2, probabilidades: { home_win: 0.514, draw: 0.231, away_win: 0.254, over_2_5: 0.577 }, value_bets: [{ mercado: "Empate (X)", odd: 4.80, prob_calc: 23.1, prob_impl: 20.8, ev: 0.109, is_vb: true }, { mercado: "Fora (2)", odd: 4.45, prob_calc: 25.4, prob_impl: 22.5, ev: 0.130, is_vb: true }, { mercado: "Casa (1)", odd: 2.12, prob_calc: 51.4, prob_impl: 47.2, ev: 0.090, is_vb: true }] },
  { id: 4, home_team: "Santos", away_team: "Grêmio", liga: "Brasileirão Série A", data: "2026-03-21", home_goals_exp: 1.5, away_goals_exp: 1.8, probabilidades: { home_win: 0.323, draw: 0.228, away_win: 0.449, over_2_5: 0.640 }, value_bets: [{ mercado: "Casa (1)", odd: 3.37, prob_calc: 32.3, prob_impl: 29.7, ev: 0.088, is_vb: true }, { mercado: "Fora (2)", odd: 2.08, prob_calc: 44.9, prob_impl: 48.1, ev: -0.066, is_vb: false }, { mercado: "Over 2.5", odd: 1.58, prob_calc: 64.0, prob_impl: 63.3, ev: 0.011, is_vb: false }] },
];

const evColor = (ev) => ev > 0.05 ? "#00e5a0" : ev > 0 ? "#f59e0b" : "#ef4444";
const fmt = (n, d = 1) => typeof n === "number" ? n.toFixed(d) : "—";
const probBar = (p) => Math.round(p * 100);

// ── Auth ───────────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "register") {
        await apiPost("/auth/register", { name: form.name, email: form.email, password: form.password });
        setMode("login"); setError("✅ Conta criada! Faça login."); setLoading(false); return;
      }
      const data = await apiPost("/auth/login", { email: form.email, password: form.password });
      onLogin({ name: data.name, plan: data.plan, token: data.token, email: form.email, avatar: null });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-black text-white">FootballIQ</h1>
          <p className="text-sm text-zinc-500 mt-1">Análise estatística de futebol</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            {[["login","Entrar"],["register","Cadastrar"]].map(([m, l]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${mode === m ? "bg-emerald-900 text-emerald-300 border border-emerald-700" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{l}</button>
            ))}
          </div>
          <div className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Nome</label>
                <input type="text" placeholder="Seu nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-600 transition-colors" />
              </div>
            )}
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">E-mail</label>
              <input type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Senha</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handle()} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-600 transition-colors" />
            </div>
          </div>
          {error && <div className={`mt-3 text-xs px-3 py-2 rounded-xl ${error.startsWith("✅") ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"}`}>{error}</div>}
          <button onClick={handle} disabled={loading} className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold rounded-xl text-sm transition-all cursor-pointer">
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>
        <p className="text-center text-xs text-zinc-600 mt-4">Seus dados são protegidos e nunca compartilhados.</p>
      </div>
    </div>
  );
}

// ── Account Page ───────────────────────────────────────────────────────────────
function AccountPage({ user, onUpdateUser, onLogout, onBack }) {
  const [tab, setTab] = useState("perfil");
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef();

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(""), 2500);
  };

  const handleSaveName = () => {
    onUpdateUser({ ...user, name });
    showToast("✅ Nome atualizado!");
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("❌ Imagem muito grande (máx 2MB)", "err"); return; }
    const reader = new FileReader();
    reader.onload = () => { const updated = { ...user, avatar: reader.result }; onUpdateUser(updated); showToast("✅ Foto salva com sucesso!"); };
    reader.readAsDataURL(file);
  };

  const plans = [
    { id: "free", name: "Free", price: "R$ 0", features: ["5 análises/dia", "Brasileirão apenas", "Value bets básicos"] },
    { id: "pro", name: "Pro", price: "R$ 29,90/mês", features: ["50 análises/dia", "Todas as ligas", "Value bets real-time", "Histórico 90 dias"] },
    { id: "premium", name: "Premium", price: "R$ 79,90/mês", features: ["Ilimitado", "Todas as ligas", "Acesso à API", "Suporte prioritário"] },
  ];

  const stats = [
    { label: "Análises realizadas", value: "47" },
    { label: "Value bets encontrados", value: "12" },
    { label: "Ligas monitoradas", value: "1" },
    { label: "Membro desde", value: "Mar 2026" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 text-sm px-5 py-3 rounded-2xl border font-semibold shadow-xl ${toast.type === "err" ? "bg-red-950 border-red-700 text-red-300" : "bg-emerald-900 border-emerald-600 text-emerald-200"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold">
            ← Voltar
          </button>
          <span className="text-zinc-700">|</span>
          <span className="text-xl">⚽</span>
          <span className="font-black text-white">FootballIQ</span>
        </div>
        <button onClick={onLogout} className="text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer border border-zinc-800 px-3 py-1.5 rounded-lg hover:border-red-900">Sair da conta</button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Profile hero */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-900 border-2 border-emerald-700 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => fileRef.current.click()}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-black text-emerald-300">{user.name[0].toUpperCase()}</span>
              }
            </div>
            <button onClick={() => fileRef.current.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black text-xs cursor-pointer hover:bg-emerald-400 transition-colors">✎</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${user.plan === "pro" ? "bg-emerald-900 text-emerald-300" : user.plan === "premium" ? "bg-amber-900 text-amber-300" : "bg-zinc-700 text-zinc-300"}`}>
              {user.plan}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[["perfil","👤","Perfil"],["plano","💎","Meu Plano"],["seguranca","🔒","Segurança"]].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === id ? "bg-emerald-950 text-emerald-300 border border-emerald-900" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Perfil */}
        {tab === "perfil" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-black text-white">Informações pessoais</h3>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">E-mail</label>
              <input type="email" value={user.email} disabled
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
              <p className="text-[10px] text-zinc-600 mt-1">O e-mail não pode ser alterado.</p>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Foto de perfil</label>
              <button onClick={() => fileRef.current.click()}
                className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
                📷 {user.avatar ? "Trocar foto" : "Adicionar foto"}
              </button>
            </div>
            <button onClick={handleSaveName}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-all cursor-pointer">
              Salvar alterações
            </button>
          </div>
        )}

        {/* Tab: Plano */}
        {tab === "plano" && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-white">Plano atual</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Você está no plano <span className="text-emerald-400 font-bold">{user.plan}</span></p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${user.plan === "pro" ? "bg-emerald-900 text-emerald-300" : user.plan === "premium" ? "bg-amber-900 text-amber-300" : "bg-zinc-700 text-zinc-300"}`}>
                  {user.plan.toUpperCase()}
                </span>
              </div>
              {user.plan === "free" && (
                <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 text-sm text-zinc-300">
                  💡 Faça upgrade para o <span className="text-emerald-400 font-bold">Pro</span> e desbloqueie análises ilimitadas, todas as ligas e value bets em tempo real.
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {plans.map(p => (
                <div key={p.id} className={`rounded-2xl border p-5 flex flex-col gap-3 ${p.id === user.plan ? "border-emerald-600 bg-emerald-950/20" : "border-zinc-700 bg-zinc-900"}`}>
                  {p.id === user.plan && <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full w-fit">ATUAL</span>}
                  <div>
                    <p className="font-black text-white">{p.name}</p>
                    <p className="text-sm text-zinc-400 mt-0.5">{p.price}</p>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {p.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-xs text-zinc-400"><span className="text-emerald-500">✓</span>{f}</li>)}
                  </ul>
                  {p.id !== user.plan && (
                    <button onClick={() => showToast("🚀 Pagamentos em breve!")}
                      className="w-full py-2 rounded-xl text-xs font-bold bg-zinc-700 hover:bg-zinc-600 text-white transition-all cursor-pointer">
                      Em breve
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-600 text-center">Stripe (cartão) · Mercado Pago (Pix, boleto) — em breve</p>
          </div>
        )}

        {/* Tab: Segurança */}
        {tab === "seguranca" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-black text-white">Segurança</h3>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Senha atual</label>
              <input type="password" placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nova senha</label>
              <input type="password" placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Confirmar nova senha</label>
              <input type="password" placeholder="••••••••" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <button onClick={() => showToast("🔒 Senha atualizada!")}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 rounded-xl text-sm transition-all cursor-pointer">
              Atualizar senha
            </button>
            <div className="border-t border-zinc-800 pt-4 mt-2">
              <h4 className="text-sm font-bold text-red-400 mb-2">Zona de perigo</h4>
              <button onClick={() => showToast("❌ Funcionalidade em breve", "err")}
                className="text-xs text-red-500 border border-red-900 hover:bg-red-950 px-4 py-2 rounded-xl transition-colors cursor-pointer">
                Excluir minha conta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard Components ───────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  const s = { free: "bg-zinc-700 text-zinc-300", pro: "bg-emerald-900 text-emerald-300", premium: "bg-amber-900 text-amber-300" };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${s[plan]}`}>{plan}</span>;
}

function ProbBar({ label, value, color = "#00e5a0" }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-zinc-400 shrink-0">{label}</span>
      <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-10 text-right font-mono text-zinc-300">{value}%</span>
    </div>
  );
}

function MatchCard({ match, onClick, selected }) {
  const totalVbs = match.value_bets.filter(v => v.is_vb).length;
  const p = match.probabilidades;
  return (
    <button onClick={() => onClick(match)} className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer ${selected ? "border-emerald-600 bg-zinc-800/80" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-zinc-500 font-mono">{match.data}</span>
        {totalVbs > 0 && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">{totalVbs} value {totalVbs === 1 ? "bet" : "bets"}</span>}
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-white text-sm">{match.home_team}</span>
        <span className="text-xs text-zinc-600">vs</span>
        <span className="font-bold text-white text-sm">{match.away_team}</span>
      </div>
      <div className="flex gap-1.5 text-[11px]">
        {[["Casa", p.home_win], ["Empate", p.draw], ["Fora", p.away_win]].map(([l, v]) => (
          <div key={l} className="flex-1 text-center bg-zinc-800 rounded-lg py-1.5">
            <div className="text-zinc-500">{l}</div>
            <div className="font-bold text-white">{probBar(v)}%</div>
          </div>
        ))}
      </div>
    </button>
  );
}

function MatchDetail({ match }) {
  if (!match) return <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3"><span className="text-5xl">⚽</span><p className="text-sm">Selecione uma partida</p></div>;
  const p = match.probabilidades;
  const chartData = [
    { name: match.home_team.split(" ")[0], value: probBar(p.home_win), fill: "#00e5a0" },
    { name: "Empate", value: probBar(p.draw), fill: "#6366f1" },
    { name: match.away_team.split(" ")[0], value: probBar(p.away_win), fill: "#f59e0b" },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
        <p className="text-[10px] text-zinc-500 mb-2 font-mono">{match.data} · {match.liga}</p>
        <div className="flex items-center justify-between">
          <div className="text-center"><p className="text-lg font-black text-white">{match.home_team}</p><p className="text-xs text-zinc-500">{fmt(match.home_goals_exp)} gols esp. · Casa</p></div>
          <div className="text-2xl text-zinc-600">×</div>
          <div className="text-center"><p className="text-lg font-black text-white">{match.away_team}</p><p className="text-xs text-zinc-500">{fmt(match.away_goals_exp)} gols esp. · Fora</p></div>
        </div>
      </div>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
        <p className="text-xs text-zinc-400 mb-3 font-semibold uppercase tracking-widest">Probabilidades — Modelo Poisson</p>
        <div className="h-28 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v}%`, "Probabilidade"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          <ProbBar label="Over 2.5" value={probBar(p.over_2_5)} color="#6366f1" />
          <ProbBar label="Under 2.5" value={probBar(1 - p.over_2_5)} color="#52525b" />
        </div>
      </div>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
        <p className="text-xs text-zinc-400 mb-3 font-semibold uppercase tracking-widest">Análise de Mercados</p>
        <div className="grid grid-cols-5 text-[10px] text-zinc-500 px-2 mb-2"><span className="col-span-2">Mercado</span><span className="text-center">Odd</span><span className="text-center">P.Calc</span><span className="text-right">EV</span></div>
        <div className="space-y-1.5">
          {match.value_bets.map((vb, i) => (
            <div key={i} className={`grid grid-cols-5 items-center rounded-xl px-3 py-2.5 text-sm ${vb.is_vb ? "bg-emerald-950/60 border border-emerald-900" : "bg-zinc-800 border border-zinc-700"}`}>
              <span className={`col-span-2 font-medium ${vb.is_vb ? "text-emerald-300" : "text-zinc-300"}`}>{vb.is_vb ? "✦ " : ""}{vb.mercado}</span>
              <span className="text-center font-mono text-white">{fmt(vb.odd, 2)}</span>
              <span className="text-center text-zinc-400">{fmt(vb.prob_calc)}%</span>
              <span className="text-right font-mono font-bold" style={{ color: evColor(vb.ev) }}>{vb.ev > 0 ? "+" : ""}{fmt(vb.ev, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValueBetsPage() {
  const all = MOCK_ANALYSIS.flatMap(m => m.value_bets.filter(v => v.is_vb).map(v => ({ ...v, partida: `${m.home_team} vs ${m.away_team}`, data: m.data }))).sort((a, b) => b.ev - a.ev);
  return (
    <div>
      <h2 className="text-xl font-black text-white mb-1">Value Bets do Dia</h2>
      <p className="text-xs text-zinc-500 mb-6">Apostas onde a casa paga acima do valor justo calculado</p>
      <div className="space-y-3">
        {all.map((vb, i) => (
          <div key={i} className="rounded-2xl bg-emerald-950/30 border border-emerald-900/60 p-4 flex items-center justify-between gap-4">
            <div className="flex-1"><p className="text-xs text-zinc-500 font-mono mb-0.5">{vb.data}</p><p className="font-semibold text-white">{vb.partida}</p><p className="text-emerald-400 font-bold text-sm mt-1">✦ {vb.mercado}</p></div>
            <div className="text-center px-3"><p className="text-[10px] text-zinc-500 mb-0.5">Odd</p><p className="text-2xl font-black text-white">{fmt(vb.odd, 2)}</p></div>
            <div className="text-center px-3"><p className="text-[10px] text-zinc-500 mb-0.5">P.Calc</p><p className="text-xl font-bold text-emerald-300">{fmt(vb.prob_calc)}%</p></div>
            <div className="text-center px-3"><p className="text-[10px] text-zinc-500 mb-0.5">EV</p><p className="text-xl font-bold" style={{ color: evColor(vb.ev) }}>+{fmt(vb.ev, 3)}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlansPage() {
  const [toast, setToast] = useState(false);
  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 3000); };
  const plans = [
    { id: "free", name: "Free", price: "R$ 0", period: "", features: ["5 análises/dia", "Brasileirão apenas", "Value bets básicos"], cta: "Plano atual", disabled: true, highlight: false },
    { id: "pro", name: "Pro", price: "R$ 29,90", period: "/mês", features: ["50 análises/dia", "Todas as ligas", "Value bets real-time", "Histórico 90 dias"], cta: "Em breve", highlight: true },
    { id: "premium", name: "Premium", price: "R$ 79,90", period: "/mês", features: ["Ilimitado", "Todas as ligas", "Acesso à API", "Suporte prioritário"], cta: "Em breve", highlight: false },
  ];
  return (
    <div className="relative">
      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-emerald-900 border border-emerald-600 text-emerald-200 text-sm px-5 py-3 rounded-2xl shadow-xl z-50 font-semibold">🚀 Pagamentos em breve!</div>}
      <h2 className="text-xl font-black text-white mb-1">Planos</h2>
      <p className="text-xs text-zinc-500 mb-8">Escolha o plano ideal para sua estratégia</p>
      <div className="grid grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className={`rounded-2xl border p-6 flex flex-col gap-4 ${p.highlight ? "border-emerald-600 bg-emerald-950/20" : "border-zinc-700 bg-zinc-900"}`}>
            {p.highlight && <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full w-fit tracking-widest">MAIS POPULAR</span>}
            <div><p className="font-black text-white text-lg">{p.name}</p><p className="text-2xl font-black text-white mt-1">{p.price}<span className="text-sm font-normal text-zinc-500">{p.period}</span></p></div>
            <ul className="space-y-2 flex-1">{p.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-zinc-400"><span className="text-emerald-500 text-xs">✓</span>{f}</li>)}</ul>
            <button onClick={p.disabled ? undefined : showToast} className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${p.disabled ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : p.highlight ? "bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer" : "bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer"}`}>{p.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ user, onUpdateUser, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(MOCK_ANALYSIS[0]);
  const [filter, setFilter] = useState("all");
  const totalVbs = MOCK_ANALYSIS.flatMap(m => m.value_bets.filter(v => v.is_vb)).length;
  const filtered = filter === "value" ? MOCK_ANALYSIS.filter(m => m.value_bets.some(v => v.is_vb)) : MOCK_ANALYSIS;
  const nav = [["dashboard","⚡","Dashboard"],["valuebets","✦","Value Bets"],["historico","📊","Histórico"],["planos","💎","Planos"],["conta","👤","Minha Conta"]];

  if (page === "conta") return <AccountPage user={user} onUpdateUser={(u) => { onUpdateUser(u); }} onLogout={onLogout} onBack={() => setPage("dashboard")} />;

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-white overflow-hidden">
      <aside className="w-52 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950 h-full">
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2"><span className="text-xl">⚽</span><span className="font-black text-white tracking-tight">FootballIQ</span></div>
          <p className="text-[10px] text-zinc-600 mt-0.5 pl-7">Análise estatística</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(([id, icon, label]) => (
            <button key={id} onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${page === id ? "bg-emerald-950 text-emerald-300 font-semibold border border-emerald-900" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-zinc-800">
          <button onClick={() => setPage("conta")} className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center text-xs font-bold text-emerald-300 overflow-hidden">
              {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest ${user.plan === "pro" ? "bg-emerald-900 text-emerald-300" : "bg-zinc-700 text-zinc-300"}`}>{user.plan}</span>
            </div>
          </button>
          <button onClick={onLogout} className="w-full text-xs text-zinc-600 hover:text-red-400 transition-colors mt-2 text-left pl-1 cursor-pointer">Sair →</button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col bg-zinc-950">
        <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-black text-white text-base">{page === "dashboard" ? "Jogos de Hoje" : page === "valuebets" ? "Value Bets" : page === "historico" ? "Histórico" : "Planos"}</h1>
            <p className="text-xs text-zinc-500 font-mono">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
          </div>
          <div className="text-xs bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 font-mono text-zinc-400">{MOCK_ANALYSIS.length} jogos · {totalVbs} value bets</div>
        </header>

        <div className="flex-1 overflow-auto p-5">
          {page === "dashboard" && (
            <div className="flex gap-5 h-full min-h-0">
              <div className="w-72 shrink-0 flex flex-col gap-3 overflow-auto pr-1">
                <div className="flex gap-2 shrink-0">
                  {[["all","Todos"],["value","✦ Value"]].map(([f,l]) => (
                    <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${filter===f ? "bg-emerald-900 text-emerald-300 border border-emerald-700" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}>{l}</button>
                  ))}
                </div>
                {filtered.map(m => <MatchCard key={m.id} match={m} onClick={setSelected} selected={selected?.id === m.id} />)}
              </div>
              <div className="flex-1 overflow-auto"><MatchDetail match={selected} /></div>
            </div>
          )}
          {page === "valuebets" && <ValueBetsPage />}
          {page === "historico" && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <span className="text-5xl">📊</span>
              <h2 className="text-lg font-black text-white">Histórico</h2>
              <p className="text-sm text-zinc-500 max-w-xs">Disponível no plano Pro.</p>
              <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-4 py-2 rounded-full">Em breve</span>
            </div>
          )}
          {page === "planos" && <PlansPage />}
        </div>
      </main>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("footballiq_user")); } catch { return null; }
  });

  const handleLogin = (u) => { localStorage.setItem("footballiq_user", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("footballiq_user"); setUser(null); };
  const handleUpdateUser = (u) => { localStorage.setItem("footballiq_user", JSON.stringify(u)); setUser(u); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&family=DM+Mono&display=swap'); .font-mono{font-family:'DM Mono',monospace} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#3f3f46;border-radius:99px}`}</style>
      {user
        ? <Dashboard user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
        : <AuthPage onLogin={handleLogin} />
      }
    </div>
  );
}
