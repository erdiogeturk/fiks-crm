import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

const STATUSES = [
  { key: "lead", label: "Lead", color: "#6366f1", bg: "#eef2ff" },
  { key: "proposal", label: "Teklif", color: "#f59e0b", bg: "#fffbeb" },
  { key: "negotiation", label: "Müzakere", color: "#3b82f6", bg: "#eff6ff" },
  { key: "won", label: "Kazanıldı", color: "#10b981", bg: "#ecfdf5" },
  { key: "lost", label: "Kaybedildi", color: "#ef4444", bg: "#fef2f2" },
  { key: "onhold", label: "Beklemede", color: "#8b5cf6", bg: "#f5f3ff" },
];

const PRIORITIES = [
  { key: "high", label: "Yüksek", color: "#ef4444", icon: "▲" },
  { key: "medium", label: "Orta", color: "#f59e0b", icon: "●" },
  { key: "low", label: "Düşük", color: "#6b7280", icon: "▼" },
];

const SEGMENTS = ["Kurumsal", "KOBİ", "Kamu", "Perakende", "Üretim", "Enerji"];
const SOURCES = ["Referans", "Web Sitesi", "Fuar", "Soğuk Arama", "Partner", "LinkedIn"];
const CURRENCIES = ["EUR", "USD", "TRY"];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const useExchangeRates = () => {
  const [rates, setRates] = useState({ EUR: 1, USD: 1, TRY: 1 });
  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/TRY")
      .then(r => r.json())
      .then(data => {
        setRates({ EUR: data.rates.EUR, USD: data.rates.USD, TRY: 1 });
      })
      .catch(() => setRates({ EUR: 0.026, USD: 0.028, TRY: 1 }));
  }, []);
  const toTRY = (amount, currency) => {
    if (currency === "TRY") return Number(amount);
    if (rates[currency]) return Number(amount) / rates[currency];
    return Number(amount);
  };
  return { rates, toTRY };
};

const formatCurrency = (amount, currency) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
};

const StatusBadge = ({ status }) => {
  const s = STATUSES.find((x) => x.key === status);
  if (!s) return null;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px", display: "inline-flex", alignItems: "center", gap: "4px", border: `1px solid ${s.color}22` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const p = PRIORITIES.find((x) => x.key === priority);
  if (!p) return null;
  return (
    <span style={{ color: p.color, fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
      {p.icon} {p.label}
    </span>
  );
};

const KPICard = ({ title, value, subtitle, color, icon, onClick }) => (
  <div onClick={onClick} style={{ background: "#fff", borderRadius: "14px", padding: "18px 20px", flex: 1, minWidth: 140, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #f0f0f0", position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default", transition: "all 0.2s" }} onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; } }} onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)"; }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ fontSize: "22px", opacity: 0.15 }}>{icon}</div>
    </div>
  </div>
);

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "24px 20px", width: "100%", maxWidth: wide ? "720px" : "540px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", width: 36, height: 36, cursor: "pointer", fontSize: "18px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
    <input {...props} style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", transition: "border 0.2s", fontFamily: "inherit", ...(props.style || {}) }} onFocus={(e) => (e.target.style.borderColor = "#6366f1")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
    <select {...props} style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", fontFamily: "inherit", background: "#fff", cursor: "pointer" }}>
      {options.map((o) => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", disabled, ...props }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none" },
    secondary: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
    success: { background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none" },
    danger: { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" },
  };
  return (
    <button {...props} disabled={disabled} style={{ padding: "11px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", letterSpacing: "0.3px", transition: "all 0.2s", opacity: disabled ? 0.6 : 1, ...styles[variant], ...(props.style || {}) }}>
      {children}
    </button>
  );
};

const FiksLogo = () => (
  <svg viewBox="0 0 120 40" style={{ width: 100, display: "block" }}>
    <polygon points="8,8 22,20 8,32 14,32 28,20 14,8" fill="#fff" />
    <polygon points="0,12 12,20 0,28 5,28 17,20 5,12" fill="rgba(255,255,255,0.5)" />
    <text x="34" y="30" fontFamily="'DM Sans', sans-serif" fontWeight="700" fontSize="28" fill="#fff" letterSpacing="-1">fiks</text>
  </svg>
);

const CustomerAvatar = ({ customer, logoUrl, size = 34 }) => {
  const [imgError, setImgError] = useState(false);
  const radius = size > 40 ? "12px" : "8px";
  const fs = size > 40 ? "18px" : "12px";
  if (logoUrl && !imgError) {
    return <img src={logoUrl} alt={customer} style={{ width: size, height: size, borderRadius: radius, objectFit: "contain", background: "#fff", border: "1px solid #e2e8f0", flexShrink: 0 }} onError={() => setImgError(true)} />;
  }
  return <div style={{ width: size, height: size, borderRadius: radius, background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: fs, flexShrink: 0 }}>{customer.slice(0, 2)}</div>;
};

// Mobile Project Card
const ProjectCard = ({ p, onClick, onEdit, onDelete }) => {
  const status = STATUSES.find(s => s.key === p.status);
  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", cursor: "pointer", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${status?.color || "#6366f1"}, ${status?.color || "#6366f1"}88)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CustomerAvatar customer={p.customer} logoUrl={p.logo_url} size={36} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{p.customer}</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: 1 }}>{p.contact || p.segment}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(p)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "13px", color: "#475569" }}>✎</button>
          <button onClick={() => onDelete(p.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "13px", color: "#ef4444" }}>✕</button>
        </div>
      </div>
      <div style={{ fontSize: "13px", color: "#475569", marginBottom: 10, fontWeight: 500 }}>{p.project}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{formatCurrency(p.amount, p.currency)}</div>
        <StatusBadge status={p.status} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 60, height: 5, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{ width: `${p.probability}%`, height: "100%", borderRadius: 3, background: p.probability >= 70 ? "#10b981" : p.probability >= 40 ? "#f59e0b" : "#94a3b8" }} />
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>%{p.probability}</span>
        </div>
        <PriorityBadge priority={p.priority} />
      </div>
      {p.next_action && (
        <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b" }}>
          📋 {p.next_action} {p.next_action_date && `· ${formatDate(p.next_action_date)}`}
        </div>
      )}
    </div>
  );
};

const emptyProject = { customer: "", project: "", amount: "", currency: "EUR", date: new Date().toISOString().slice(0, 10), status: "lead", priority: "medium", segment: "Kurumsal", source: "Referans", probability: 20, contact: "", email: "", phone: "", notes: "", next_action: "", next_action_date: "", logo_url: "" };

export default function CRMApp() {
  const { rates, toTRY } = useExchangeRates();
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyProject });
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectActivities, setProjectActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ type: "Toplantı", note: "" });
  const [draggedId, setDraggedId] = useState(null);

  const fetchProjects = useCallback(async () => {
    const { data, error } = await supabase.from("projects").select("*").order("date", { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }, []);

  const fetchActivities = useCallback(async (projectId) => {
    const { data, error } = await supabase.from("activities").select("*").eq("project_id", projectId).order("date", { ascending: true });
    if (!error && data) setProjectActivities(data);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const saveProject = async () => {
    if (!formData.customer || !formData.project) return;
    setSaving(true);
    const payload = {
      customer: formData.customer, project: formData.project,
      amount: Number(formData.amount) || 0, currency: formData.currency,
      date: formData.date, status: formData.status, priority: formData.priority,
      segment: formData.segment, source: formData.source,
      probability: Number(formData.probability) || 0,
      contact: formData.contact, email: formData.email, phone: formData.phone,
      notes: formData.notes, next_action: formData.next_action,
      next_action_date: formData.next_action_date || null,
      logo_url: formData.logo_url || "",
      updated_at: new Date().toISOString(),
    };
    if (editId) {
      await supabase.from("projects").update(payload).eq("id", editId);
    } else {
      await supabase.from("projects").insert(payload);
    }
    await fetchProjects();
    setShowForm(false);
    setSaving(false);
  };

  const deleteProject = async (id) => {
    await supabase.from("projects").delete().eq("id", id);
    await fetchProjects();
    setSelectedProject(null);
  };

  const updateStatus = async (id, newStatus) => {
    const prob = newStatus === "won" ? 100 : newStatus === "lost" ? 0 : undefined;
    const update = prob !== undefined ? { status: newStatus, probability: prob } : { status: newStatus };
    await supabase.from("projects").update(update).eq("id", id);
    await fetchProjects();
  };

  const addActivity = async () => {
    if (!newActivity.note || !selectedProject) return;
    await supabase.from("activities").insert({
      project_id: selectedProject.id,
      type: newActivity.type,
      note: newActivity.note,
      date: new Date().toISOString().slice(0, 10),
    });
    await fetchActivities(selectedProject.id);
    setNewActivity({ type: "Toplantı", note: "" });
  };

  const openDetail = async (p) => {
    setSelectedProject(p);
    await fetchActivities(p.id);
  };

  const openForm = (p = null) => {
    if (p) { setEditId(p.id); setFormData({ ...p }); }
    else { setEditId(null); setFormData({ ...emptyProject }); }
    setShowForm(true);
  };

  const goToStatus = (statusKey) => {
    setFilterStatus(statusKey);
    setView("list");
  };

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.customer.toLowerCase().includes(q) || p.project.toLowerCase().includes(q) || (p.contact || "").toLowerCase().includes(q));
    }
    if (filterStatus !== "all") list = list.filter((p) => p.status === filterStatus);
    if (filterSegment !== "all") list = list.filter((p) => p.segment === filterSegment);
    if (filterPriority !== "all") list = list.filter((p) => p.priority === filterPriority);
    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "date") { va = a.date; vb = b.date; }
      else if (sortBy === "amount") { va = Number(a.amount); vb = Number(b.amount); }
      else if (sortBy === "customer") { va = a.customer.toLowerCase(); vb = b.customer.toLowerCase(); }
      else if (sortBy === "project") { va = a.project.toLowerCase(); vb = b.project.toLowerCase(); }
      else if (sortBy === "probability") { va = a.probability; vb = b.probability; }
      else { va = a.date; vb = b.date; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [projects, search, filterStatus, filterSegment, filterPriority, sortBy, sortDir]);

  const stats = useMemo(() => {
    const won = projects.filter((p) => p.status === "won").reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
    const pipeline = projects.filter((p) => !["won", "lost"].includes(p.status)).reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
    const weighted = projects.filter((p) => !["won", "lost"].includes(p.status)).reduce((s, p) => s + (toTRY(p.amount, p.currency) * p.probability) / 100, 0);
    const closedCount = projects.filter((p) => ["won", "lost"].includes(p.status)).length;
    const winRate = closedCount > 0 ? Math.round((projects.filter((p) => p.status === "won").length / closedCount) * 100) : 0;
    return { won, pipeline, weighted, count: projects.length, winRate };
  }, [projects, toTRY]);

  const sideItems = [
    { key: "dashboard", label: "Dashboard", icon: "◐" },
    { key: "list", label: "Projeler", icon: "☰" },
    { key: "pipeline", label: "Pipeline", icon: "◧" },
  ];

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "#6366f1" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: 12 }}>⬡</div>
        <div style={{ fontWeight: 600 }}>Fiks CRM yükleniyor...</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: isMobile ? "column" : "row", height: "100vh", width: "100vw", background: "#f8fafc", color: "#1e293b", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <div style={{ width: 220, background: "linear-gradient(180deg, #1e1b4b, #312e81)", color: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "4px 8px", marginBottom: 6 }}><FiksLogo /></div>
          <div style={{ fontSize: "11px", color: "#a5b4fc", padding: "0 8px", marginBottom: 32 }}>CRM · Sales Pipeline Manager</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sideItems.map((item) => (
              <button key={item.key} onClick={() => setView(item.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "10px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: view === item.key ? 600 : 400, background: view === item.key ? "rgba(255,255,255,0.15)" : "transparent", color: view === item.key ? "#fff" : "#c7d2fe", transition: "all 0.2s", textAlign: "left" }}>
                <span style={{ fontSize: "16px", width: 22, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ marginTop: "auto", padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "11px", color: "#a5b4fc", marginBottom: 4 }}>Toplam Pipeline</div>
            <div style={{ fontSize: "20px", fontWeight: 700 }}>{formatCurrency(stats.pipeline, "TRY")}</div>
            <div style={{ fontSize: "11px", color: "#a5b4fc", marginTop: 2 }}>Ağırlıklı: {formatCurrency(stats.weighted, "TRY")}</div>
          </div>
        </div>
      )}

      {/* ── MOBILE TOP BAR ── */}
      {isMobile && (
        <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <FiksLogo />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#a5b4fc" }}>Pipeline</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{formatCurrency(stats.pipeline, "TRY")}</div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 80px" : "28px 36px" }}>

        {/* Desktop header */}
        {!isMobile && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 700, color: "#1e293b" }}>
                {view === "dashboard" ? "Dashboard" : view === "pipeline" ? "Pipeline Görünümü" : "Proje Listesi"}
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>{projects.length} proje · {formatDate(new Date().toISOString().slice(0, 10))}</p>
            </div>
            <Btn onClick={() => openForm()}>＋ Yeni Proje</Btn>
          </div>
        )}

        {/* Mobile header */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>
                {view === "dashboard" ? "Dashboard" : view === "pipeline" ? "Pipeline" : "Projeler"}
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{projects.length} proje</p>
            </div>
            <Btn onClick={() => openForm()} style={{ padding: "10px 16px", fontSize: "13px" }}>＋ Yeni</Btn>
          </div>
        )}

        {/* ═══ DASHBOARD ═══ */}
        {view === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              <KPICard title="Toplam" value={stats.count} subtitle="Proje" color="#6366f1" icon="📊" onClick={() => { setFilterStatus("all"); setView("list"); }} />
              <KPICard title="Kazanılan" value={formatCurrency(stats.won, "TRY")} subtitle={`${projects.filter((p) => p.status === "won").length} proje`} color="#10b981" icon="🏆" onClick={() => goToStatus("won")} />
              <KPICard title="Pipeline" value={formatCurrency(stats.pipeline, "TRY")} subtitle="Devam eden" color="#3b82f6" icon="🔄" onClick={() => { setFilterStatus("all"); setView("pipeline"); }} />
              <KPICard title="Kazanma" value={`%${stats.winRate}`} subtitle="Win Rate" color="#f59e0b" icon="📈" />
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 600, color: "#475569" }}>Durum Dağılımı</h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 10 }}>
                {STATUSES.map((s) => {
                  const count = projects.filter((p) => p.status === s.key).length;
                  const amt = projects.filter((p) => p.status === s.key).reduce((sum, p) => sum + toTRY(p.amount, p.currency), 0);
                  return (
                    <div key={s.key} onClick={() => goToStatus(s.key)} style={{ padding: "14px", borderRadius: "12px", background: s.bg, border: `1px solid ${s.color}22`, cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{count}</div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: s.color, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{formatCurrency(amt, "TRY")}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 600, color: "#475569" }}>Yaklaşan Aksiyonlar</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {projects.filter((p) => p.next_action && !["won", "lost"].includes(p.status)).sort((a, b) => (a.next_action_date || "").localeCompare(b.next_action_date || "")).slice(0, 5).map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "10px", background: "#f8fafc", cursor: "pointer" }} onClick={() => openDetail(p)}>
                    <CustomerAvatar customer={p.customer} logoUrl={p.logo_url} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.next_action}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.customer}</div>
                    </div>
                    {!isMobile && <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, flexShrink: 0 }}>{formatDate(p.next_action_date)}</div>}
                    <PriorityBadge priority={p.priority} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ LIST VIEW ═══ */}
        {view === "list" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center" }}>
              <div style={{ position: "relative", flex: isMobile ? "unset" : 1, minWidth: 200 }}>
                <input placeholder="Ara..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "11px 14px 11px 36px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>⌕</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ flex: 1, padding: "11px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", background: "#fff" }}>
                  <option value="all">Tüm Durumlar</option>
                  {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ flex: 1, padding: "11px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", background: "#fff" }}>
                  <option value="all">Tüm Öncelikler</option>
                  {PRIORITIES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
            </div>

            {/* Mobile: Cards */}
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map((p) => (
                  <ProjectCard key={p.id} p={p} onClick={() => openDetail(p)} onEdit={openForm} onDelete={deleteProject} />
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>Sonuç bulunamadı</div>
                )}
              </div>
            ) : (
              /* Desktop: Table */
              <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {[
                        { label: "Müşteri", key: "customer" },
                        { label: "Proje", key: "project" },
                        { label: "Tutar", key: "amount" },
                        { label: "Olasılık", key: "probability" },
                        { label: "Tarih", key: "date" },
                        { label: "Durum", key: null },
                        { label: "Öncelik", key: null },
                        { label: "Segment", key: null },
                        { label: "İşlem", key: null },
                      ].map((h) => (
                        <th key={h.label} onClick={() => { if (h.key) { if (sortBy === h.key) { setSortDir(sortDir === "desc" ? "asc" : "desc"); } else { setSortBy(h.key); setSortDir(h.key === "customer" || h.key === "project" ? "asc" : "desc"); } } }} style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: sortBy === h.key ? "#4f46e5" : "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #f0f0f0", cursor: h.key ? "pointer" : "default", userSelect: "none" }}>
                          {h.label}{sortBy === h.key ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} style={{ cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "")} onClick={() => openDetail(p)}>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <CustomerAvatar customer={p.customer} logoUrl={p.logo_url} size={34} />
                            <div><div style={{ fontWeight: 600 }}>{p.customer}</div><div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.contact}</div></div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", maxWidth: 200 }}><div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.project}</div></td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 48, height: 6, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}><div style={{ width: `${p.probability}%`, height: "100%", borderRadius: 3, background: p.probability >= 70 ? "#10b981" : p.probability >= 40 ? "#f59e0b" : "#94a3b8" }} /></div>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>%{p.probability}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", color: "#64748b" }}>{formatDate(p.date)}</td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}><StatusBadge status={p.status} /></td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}><PriorityBadge priority={p.priority} /></td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", color: "#64748b", fontSize: "12px" }}>{p.segment}</td>
                        <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openForm(p)} style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#475569" }}>✎</button>
                            <button onClick={() => deleteProject(p.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#ef4444" }}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Sonuç bulunamadı</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{filtered.length} / {projects.length} proje</div>
          </div>
        )}

        {/* ═══ PIPELINE VIEW ═══ */}
        {view === "pipeline" && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
            {STATUSES.filter((s) => s.key !== "lost").map((status) => {
              const items = projects.filter((p) => p.status === status.key);
              const total = items.reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
              return (
                <div key={status.key} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; e.currentTarget.style.background = status.bg; e.currentTarget.style.border = `2px dashed ${status.color}`; }} onDragLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid #f0f0f0"; }} onDrop={(e) => { e.preventDefault(); e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid #f0f0f0"; const id = Number(e.dataTransfer.getData("text/plain")); if (id) updateStatus(id, status.key); }} style={{ minWidth: isMobile ? 220 : 260, flex: isMobile ? "0 0 220px" : 1, background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>{status.label}</span>
                      <span style={{ background: status.bg, color: status.color, padding: "2px 7px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{items.length}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: 12 }}>{formatCurrency(total, "TRY")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
                    {items.map((p) => (
                      <div key={p.id} draggable onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(p.id)); e.dataTransfer.effectAllowed = "move"; setDraggedId(p.id); }} onDragEnd={() => setDraggedId(null)} onClick={() => { if (!draggedId) openDetail(p); }} style={{ padding: "12px", borderRadius: "10px", background: draggedId === p.id ? "#e2e8f0" : "#f8fafc", border: draggedId === p.id ? "2px dashed #94a3b8" : "1px solid #f0f0f0", cursor: "grab", transition: "all 0.15s", opacity: draggedId === p.id ? 0.5 : 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: 2 }}>{p.customer}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: 6 }}>{p.project}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: "13px", color: status.color }}>{formatCurrency(p.amount, p.currency)}</span>
                          <PriorityBadge priority={p.priority} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#e2e8f0", overflow: "hidden" }}><div style={{ width: `${p.probability}%`, height: "100%", borderRadius: 2, background: status.color }} /></div>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>%{p.probability}</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <div style={{ padding: 16, textAlign: "center", color: "#cbd5e1", fontSize: "12px" }}>Boş</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", boxShadow: "0 -4px 16px rgba(0,0,0,0.06)", zIndex: 100 }}>
          {sideItems.map((item) => (
            <button key={item.key} onClick={() => setView(item.key)} style={{ flex: 1, padding: "12px 8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: view === item.key ? "#6366f1" : "#94a3b8", fontFamily: "inherit", transition: "color 0.2s" }}>
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <span style={{ fontSize: "10px", fontWeight: view === item.key ? 700 : 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ═══ FORM MODAL ═══ */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? "Projeyi Düzenle" : "Yeni Proje Ekle"} wide>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <Input label="Müşteri Adı *" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} placeholder="Örn: VAKKO" />
          <Input label="Proje Adı *" value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} placeholder="Örn: S/4HANA Dönüşümü" />
          <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
            <Input label="Müşteri Logo URL" value={formData.logo_url || ""} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://logo.clearbit.com/vakko.com.tr" />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><Input label="Tutar" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0" /></div>
            <Select label="Para Birimi" options={CURRENCIES} value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
          </div>
          <Input label="Proje Tarihi" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          <Select label="Durum" options={STATUSES.map((s) => ({ value: s.key, label: s.label }))} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
          <Select label="Öncelik" options={PRIORITIES.map((p) => ({ value: p.key, label: p.label }))} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />
          <Select label="Segment" options={SEGMENTS} value={formData.segment} onChange={(e) => setFormData({ ...formData, segment: e.target.value })} />
          <Select label="Kaynak" options={SOURCES} value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
          <Input label="Kazanma Olasılığı (%)" type="number" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: e.target.value })} />
          <Input label="İletişim Kişisi" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} placeholder="Ad Soyad" />
          <Input label="E-posta" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ornek@firma.com" />
          <Input label="Telefon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+90 ..." />
          <Input label="Sonraki Aksiyon" value={formData.next_action} onChange={(e) => setFormData({ ...formData, next_action: e.target.value })} placeholder="Yapılacak iş" />
          <Input label="Aksiyon Tarihi" type="date" value={formData.next_action_date || ""} onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notlar</label>
          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} placeholder="Proje hakkında notlar..." />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => setShowForm(false)}>İptal</Btn>
          <Btn onClick={saveProject} disabled={saving}>{saving ? "Kaydediliyor..." : editId ? "Güncelle" : "Kaydet"}</Btn>
        </div>
      </Modal>

      {/* ═══ DETAIL MODAL ═══ */}
      <Modal open={!!selectedProject} onClose={() => { setSelectedProject(null); setProjectActivities([]); }} title="Proje Detayı" wide>
        {selectedProject && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CustomerAvatar customer={selectedProject.customer} logoUrl={selectedProject.logo_url} size={44} />
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 700 }}>{selectedProject.customer}</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>{selectedProject.project}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#6366f1" }}>{formatCurrency(selectedProject.amount, selectedProject.currency)}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
                  <StatusBadge status={selectedProject.status} />
                  <PriorityBadge priority={selectedProject.priority} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { l: "İletişim", v: selectedProject.contact || "—" },
                { l: "E-posta", v: selectedProject.email || "—" },
                { l: "Telefon", v: selectedProject.phone || "—" },
                { l: "Segment", v: selectedProject.segment },
                { l: "Kaynak", v: selectedProject.source },
                { l: "Olasılık", v: `%${selectedProject.probability}` },
                { l: "Proje Tarihi", v: formatDate(selectedProject.date) },
                { l: "Sonraki Aksiyon", v: selectedProject.next_action || "—" },
                { l: "Aksiyon Tarihi", v: formatDate(selectedProject.next_action_date) },
              ].map((item) => (
                <div key={item.l}>
                  <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{item.l}</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, wordBreak: "break-word" }}>{item.v}</div>
                </div>
              ))}
            </div>

            {selectedProject.notes && (
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px", marginBottom: 20, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Notlar</div>
                {selectedProject.notes}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, fontWeight: 600 }}>Hızlı Durum Güncelle</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {STATUSES.map((s) => (
                  <button key={s.key} onClick={async () => { await updateStatus(selectedProject.id, s.key); setSelectedProject({ ...selectedProject, status: s.key }); }} style={{ padding: "7px 12px", borderRadius: "8px", border: `1.5px solid ${selectedProject.status === s.key ? s.color : "#e2e8f0"}`, background: selectedProject.status === s.key ? s.bg : "#fff", color: selectedProject.status === s.key ? s.color : "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, fontWeight: 600 }}>Aktivite Geçmişi</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {projectActivities.slice().reverse().map((a) => (
                  <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500 }}>{a.note}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: 1 }}>{a.type} · {formatDate(a.date)}</div>
                    </div>
                  </div>
                ))}
                {projectActivities.length === 0 && <div style={{ color: "#94a3b8", fontSize: "13px" }}>Henüz aktivite yok</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <select value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })} style={{ padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit" }}>
                  {["Toplantı", "Telefon", "E-posta", "Teklif", "Sunum", "Not", "Kazanım", "Lead"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <input placeholder="Aktivite notu..." value={newActivity.note} onChange={(e) => setNewActivity({ ...newActivity, note: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addActivity()} style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "16px", fontFamily: "inherit", outline: "none" }} />
                <Btn onClick={addActivity} style={{ padding: "10px 16px" }}>Ekle</Btn>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
              <Btn variant="danger" onClick={() => deleteProject(selectedProject.id)}>Sil</Btn>
              <Btn variant="secondary" onClick={() => { openForm(selectedProject); setSelectedProject(null); }}>Düzenle</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
