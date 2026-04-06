import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
const CONTACT_TITLES = ["CEO", "CFO", "CIO", "IT Direktörü", "Proje Müdürü", "Satın Alma Müdürü", "SAP Yöneticisi", "Genel Müdür", "Diğer"];

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
      .then(data => setRates({ EUR: data.rates.EUR, USD: data.rates.USD, TRY: 1 }))
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
    <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", border: `1px solid ${s.color}22` }}>
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
  <div onClick={onClick} style={{ background: "#fff", borderRadius: "14px", padding: "18px 20px", flex: 1, minWidth: 140, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default", transition: "all 0.2s" }}
    onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; } }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
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
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "24px 20px", width: "100%", maxWidth: wide ? "760px" : "560px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
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
    {label && <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>}
    <input {...props} style={{ padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", transition: "border 0.2s", fontFamily: "inherit", ...(props.style || {}) }}
      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>}
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
    <button {...props} disabled={disabled} style={{ padding: "11px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", opacity: disabled ? 0.6 : 1, ...styles[variant], ...(props.style || {}) }}>
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

const CustomerAvatar = ({ name, logoUrl, size = 34 }) => {
  const [imgError, setImgError] = useState(false);
  const radius = size > 40 ? "12px" : "8px";
  const fs = size > 40 ? "18px" : "12px";
  const displayName = name || "?";
  if (logoUrl && !imgError) {
    return <img src={logoUrl} alt={displayName} style={{ width: size, height: size, borderRadius: radius, objectFit: "contain", background: "#fff", border: "1px solid #e2e8f0", flexShrink: 0 }} onError={() => setImgError(true)} />;
  }
  return <div style={{ width: size, height: size, borderRadius: radius, background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: fs, flexShrink: 0 }}>{displayName.slice(0, 2).toUpperCase()}</div>;
};

const CustomerSearch = ({ customers, value, onChange, onSelect, onCreateNew }) => {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    return customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [query, customers]);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  useEffect(() => { setQuery(value || ""); }, [value]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Müşteri *</label>
      <input value={query} onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        placeholder="Müşteri adı yazın veya arayın..."
        style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
      {open && query.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", zIndex: 999, marginTop: 4, overflow: "hidden" }}>
          {filtered.length > 0 && (
            <>
              <div style={{ padding: "8px 14px", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", background: "#f8fafc", borderBottom: "1px solid #f0f0f0" }}>Kayıtlı Müşteriler</div>
              {filtered.map(c => (
                <div key={c.id} onMouseDown={() => { onSelect(c); setQuery(c.name); setOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                  <CustomerAvatar name={c.name} logoUrl={c.logo_url} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{c.name}</div>
                    {c.sector && <div style={{ fontSize: "12px", color: "#94a3b8" }}>{c.sector}</div>}
                  </div>
                </div>
              ))}
            </>
          )}
          <div onMouseDown={onCreateNew}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer", background: "#f8fafc", borderTop: filtered.length > 0 ? "1px solid #f0f0f0" : "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>
            <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontWeight: 700, fontSize: "18px" }}>+</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#6366f1" }}>Yeni Müşteri Kaydı Oluştur</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>"{query}" için yeni kayıt ekle</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactCard = ({ contact, onEdit, onDelete, isPrimary }) => (
  <div style={{ background: isPrimary ? "#f0fdf4" : "#f8fafc", border: `1px solid ${isPrimary ? "#bbf7d0" : "#f0f0f0"}`, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: isPrimary ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
        {contact.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{contact.name}</span>
          {isPrimary && <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>Birincil</span>}
        </div>
        {contact.title && <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600, marginTop: 2 }}>{contact.title}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
          {contact.email && <a href={`mailto:${contact.email}`} style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>✉️ {contact.email}</a>}
          {contact.phone && <a href={`tel:${contact.phone}`} style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>📞 {contact.phone}</a>}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={() => onEdit(contact)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#475569" }}>✎</button>
      <button onClick={() => onDelete(contact.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#ef4444" }}>✕</button>
    </div>
  </div>
);

const ProjectCard = ({ p, customerName, onClick, onEdit, onDelete }) => {
  const status = STATUSES.find(s => s.key === p.status);
  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", cursor: "pointer", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${status?.color || "#6366f1"}, ${status?.color || "#6366f1"}88)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CustomerAvatar name={customerName || p.customer} logoUrl={p.logo_url} size={36} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{customerName || p.customer}</div>
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
    </div>
  );
};

const emptyProject = { customer: "", customer_id: null, project: "", amount: "", currency: "EUR", date: new Date().toISOString().slice(0, 10), status: "lead", priority: "medium", segment: "Kurumsal", source: "Referans", probability: 20, notes: "", next_action: "", next_action_date: "", logo_url: "" };
const emptyCustomer = { name: "", sector: "", website: "", logo_url: "", address: "", country: "Türkiye", notes: "" };
const emptyContact = { name: "", title: "CEO", email: "", phone: "", is_primary: false, notes: "" };

export default function CRMApp() {
  const { toTRY } = useExchangeRates();
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("dashboard");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({ ...emptyProject });
  const [selectedCustomerForProject, setSelectedCustomerForProject] = useState(null);
  const [projectContacts, setProjectContacts] = useState([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [customerForm, setCustomerForm] = useState({ ...emptyCustomer });
  const [pendingCustomerName, setPendingCustomerName] = useState("");
  const [returnToProjectForm, setReturnToProjectForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editContactId, setEditContactId] = useState(null);
  const [contactForm, setContactForm] = useState({ ...emptyContact });
  const [contactForCustomerId, setContactForCustomerId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectActivities, setProjectActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ type: "Toplantı", note: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailContacts, setCustomerDetailContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [draggedId, setDraggedId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");

  const fetchAll = useCallback(async () => {
    const [{ data: proj }, { data: cust }, { data: cont }] = await Promise.all([
      supabase.from("projects").select("*").order("date", { ascending: false }),
      supabase.from("customers").select("*").order("name"),
      supabase.from("contacts").select("*").order("is_primary", { ascending: false }),
    ]);
    if (proj) setProjects(proj);
    if (cust) setCustomers(cust);
    if (cont) setContacts(cont);
    setLoading(false);
  }, []);

  const fetchActivities = useCallback(async (projectId) => {
    const { data } = await supabase.from("activities").select("*").eq("project_id", projectId).order("date", { ascending: true });
    if (data) setProjectActivities(data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveCustomer = async () => {
    if (!customerForm.name) return null;
    setSaving(true);
    const payload = { ...customerForm, updated_at: new Date().toISOString() };
    let result;
    if (editCustomerId) {
      const { data } = await supabase.from("customers").update(payload).eq("id", editCustomerId).select().single();
      result = data;
    } else {
      const { data } = await supabase.from("customers").insert(payload).select().single();
      result = data;
    }
    await fetchAll();
    setShowCustomerForm(false);
    setSaving(false);
    return result;
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) return;
    await supabase.from("customers").delete().eq("id", id);
    await fetchAll();
    setSelectedCustomer(null);
  };

  const openCustomerForm = (c = null, pendingName = "", goBackToProject = false) => {
    if (c) { setEditCustomerId(c.id); setCustomerForm({ ...c }); }
    else { setEditCustomerId(null); setCustomerForm({ ...emptyCustomer, name: pendingName }); }
    setPendingCustomerName(pendingName);
    setReturnToProjectForm(goBackToProject);
    setShowCustomerForm(true);
  };

  const saveContact = async () => {
    if (!contactForm.name) return;
    setSaving(true);
    const payload = { ...contactForm, customer_id: contactForCustomerId };
    if (contactForm.is_primary) {
      await supabase.from("contacts").update({ is_primary: false }).eq("customer_id", contactForCustomerId);
    }
    if (editContactId) {
      await supabase.from("contacts").update(payload).eq("id", editContactId);
    } else {
      await supabase.from("contacts").insert(payload);
    }
    await fetchAll();
    if (selectedCustomer) {
      const { data } = await supabase.from("contacts").select("*").eq("customer_id", selectedCustomer.id).order("is_primary", { ascending: false });
      if (data) setCustomerDetailContacts(data);
    }
    setShowContactForm(false);
    setSaving(false);
  };

  const deleteContact = async (id) => {
    await supabase.from("contacts").delete().eq("id", id);
    await fetchAll();
    if (selectedCustomer) {
      const { data } = await supabase.from("contacts").select("*").eq("customer_id", selectedCustomer.id).order("is_primary", { ascending: false });
      if (data) setCustomerDetailContacts(data);
    }
  };

  const openContactForm = (customerId, contact = null) => {
    setContactForCustomerId(customerId);
    if (contact) { setEditContactId(contact.id); setContactForm({ ...contact }); }
    else { setEditContactId(null); setContactForm({ ...emptyContact }); }
    setShowContactForm(true);
  };

  const saveProject = async () => {
    if (!projectForm.customer || !projectForm.project) return;
    setSaving(true);
    const payload = {
      customer: projectForm.customer, customer_id: projectForm.customer_id || null,
      project: projectForm.project, amount: Number(projectForm.amount) || 0,
      currency: projectForm.currency, date: projectForm.date, status: projectForm.status,
      priority: projectForm.priority, segment: projectForm.segment, source: projectForm.source,
      probability: Number(projectForm.probability) || 0, contact: projectForm.contact || "",
      email: projectForm.email || "", phone: projectForm.phone || "", notes: projectForm.notes,
      next_action: projectForm.next_action, next_action_date: projectForm.next_action_date || null,
      logo_url: projectForm.logo_url || "", updated_at: new Date().toISOString(),
    };
    if (editProjectId) { await supabase.from("projects").update(payload).eq("id", editProjectId); }
    else { await supabase.from("projects").insert(payload); }
    await fetchAll();
    setShowProjectForm(false);
    setSaving(false);
  };

  const deleteProject = async (id) => {
    await supabase.from("projects").delete().eq("id", id);
    await fetchAll();
    setSelectedProject(null);
  };

  const updateStatus = async (id, newStatus) => {
    const prob = newStatus === "won" ? 100 : newStatus === "lost" ? 0 : undefined;
    const update = prob !== undefined ? { status: newStatus, probability: prob } : { status: newStatus };
    await supabase.from("projects").update(update).eq("id", id);
    await fetchAll();
  };

  const addActivity = async () => {
    if (!newActivity.note || !selectedProject) return;
    await supabase.from("activities").insert({ project_id: selectedProject.id, type: newActivity.type, note: newActivity.note, date: new Date().toISOString().slice(0, 10) });
    await fetchActivities(selectedProject.id);
    setNewActivity({ type: "Toplantı", note: "" });
  };

  const openProjectForm = (p = null) => {
    if (p) {
      setEditProjectId(p.id);
      const cust = customers.find(c => c.id === p.customer_id) || null;
      setSelectedCustomerForProject(cust);
      setProjectContacts(contacts.filter(c => c.customer_id === p.customer_id));
      setProjectForm({ ...p });
    } else {
      setEditProjectId(null);
      setSelectedCustomerForProject(null);
      setProjectContacts([]);
      setProjectForm({ ...emptyProject });
    }
    setShowProjectForm(true);
  };

  const handleCustomerSelect = (c) => {
    setSelectedCustomerForProject(c);
    const custContacts = contacts.filter(con => con.customer_id === c.id);
    setProjectContacts(custContacts);
    const primary = custContacts.find(con => con.is_primary) || custContacts[0];
    setProjectForm(prev => ({
      ...prev, customer: c.name, customer_id: c.id, logo_url: c.logo_url || "",
      segment: c.sector || prev.segment, contact: primary?.name || prev.contact,
      email: primary?.email || prev.email, phone: primary?.phone || prev.phone,
    }));
  };

  const openDetail = async (p) => { setSelectedProject(p); await fetchActivities(p.id); };

  const openCustomerDetail = async (c) => {
    setSelectedCustomer(c);
    const { data } = await supabase.from("contacts").select("*").eq("customer_id", c.id).order("is_primary", { ascending: false });
    if (data) setCustomerDetailContacts(data);
  };

  const goToStatus = (statusKey) => { setFilterStatus(statusKey); setView("list"); };

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.customer.toLowerCase().includes(q) || p.project.toLowerCase().includes(q)); }
    if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus);
    if (filterPriority !== "all") list = list.filter(p => p.priority === filterPriority);
    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "amount") { va = Number(a.amount); vb = Number(b.amount); }
      else if (sortBy === "customer") { va = a.customer.toLowerCase(); vb = b.customer.toLowerCase(); }
      else { va = a.date; vb = b.date; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [projects, search, filterStatus, filterPriority, sortBy, sortDir]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
  }, [customers, customerSearch]);

  const stats = useMemo(() => {
    const won = projects.filter(p => p.status === "won").reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
    const pipeline = projects.filter(p => !["won", "lost"].includes(p.status)).reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
    const weighted = projects.filter(p => !["won", "lost"].includes(p.status)).reduce((s, p) => s + (toTRY(p.amount, p.currency) * p.probability) / 100, 0);
    const closedCount = projects.filter(p => ["won", "lost"].includes(p.status)).length;
    const winRate = closedCount > 0 ? Math.round((projects.filter(p => p.status === "won").length / closedCount) * 100) : 0;
    return { won, pipeline, weighted, count: projects.length, winRate };
  }, [projects, toTRY]);

  const sideItems = [
    { key: "dashboard", label: "Dashboard", icon: "◐" },
    { key: "customers", label: "Müşteriler", icon: "🏢" },
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

      {!isMobile && (
        <div style={{ width: 220, background: "linear-gradient(180deg, #1e1b4b, #312e81)", color: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "4px 8px", marginBottom: 6 }}><FiksLogo /></div>
          <div style={{ fontSize: "11px", color: "#a5b4fc", padding: "0 8px", marginBottom: 32 }}>CRM · Sales Pipeline</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sideItems.map(item => (
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

      {isMobile && (
        <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <FiksLogo />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#a5b4fc" }}>Pipeline</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>{formatCurrency(stats.pipeline, "TRY")}</div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 14px 80px" : "28px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 16 : 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "26px", fontWeight: 700, color: "#1e293b" }}>
              {view === "dashboard" ? "Dashboard" : view === "customers" ? "Müşteriler" : view === "pipeline" ? "Pipeline" : "Projeler"}
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>
              {view === "customers" ? `${customers.length} müşteri` : `${projects.length} proje`}
            </p>
          </div>
          {view === "customers"
            ? <Btn onClick={() => openCustomerForm()} style={isMobile ? { padding: "10px 16px", fontSize: "13px" } : {}}>＋ {isMobile ? "Yeni" : "Yeni Müşteri"}</Btn>
            : <Btn onClick={() => openProjectForm()} style={isMobile ? { padding: "10px 16px", fontSize: "13px" } : {}}>＋ {isMobile ? "Yeni" : "Yeni Proje"}</Btn>
          }
        </div>

        {view === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              <KPICard title="Toplam" value={stats.count} subtitle="Proje" color="#6366f1" icon="📊" onClick={() => { setFilterStatus("all"); setView("list"); }} />
              <KPICard title="Müşteri" value={customers.length} subtitle="Kayıtlı" color="#8b5cf6" icon="🏢" onClick={() => setView("customers")} />
              <KPICard title="Kazanılan" value={formatCurrency(stats.won, "TRY")} subtitle={`${projects.filter(p => p.status === "won").length} proje`} color="#10b981" icon="🏆" onClick={() => goToStatus("won")} />
              <KPICard title="Win Rate" value={`%${stats.winRate}`} subtitle="Won/Closed" color="#f59e0b" icon="📈" />
            </div>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 600, color: "#475569" }}>Durum Dağılımı</h3>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 10 }}>
                {STATUSES.map(s => {
                  const count = projects.filter(p => p.status === s.key).length;
                  const amt = projects.filter(p => p.status === s.key).reduce((sum, p) => sum + toTRY(p.amount, p.currency), 0);
                  return (
                    <div key={s.key} onClick={() => goToStatus(s.key)} style={{ padding: "14px", borderRadius: "12px", background: s.bg, border: `1px solid ${s.color}22`, cursor: "pointer" }}>
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
                {projects.filter(p => p.next_action && !["won", "lost"].includes(p.status)).sort((a, b) => (a.next_action_date || "").localeCompare(b.next_action_date || "")).slice(0, 5).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: "10px", background: "#f8fafc", cursor: "pointer" }} onClick={() => openDetail(p)}>
                    <CustomerAvatar name={p.customer} logoUrl={p.logo_url} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.next_action}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.customer}</div>
                    </div>
                    {!isMobile && <div style={{ fontSize: "12px", color: "#64748b", flexShrink: 0 }}>{formatDate(p.next_action_date)}</div>}
                    <PriorityBadge priority={p.priority} />
                  </div>
                ))}
                {projects.filter(p => p.next_action).length === 0 && <div style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: 20 }}>Yaklaşan aksiyon yok</div>}
              </div>
            </div>
          </div>
        )}

        {view === "customers" && (
          <div>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input placeholder="Müşteri ara..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>⌕</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {filteredCustomers.map(c => {
                const custContacts = contacts.filter(con => con.customer_id === c.id);
                const primary = custContacts.find(con => con.is_primary) || custContacts[0];
                const projCount = projects.filter(p => p.customer_id === c.id).length;
                return (
                  <div key={c.id} onClick={() => openCustomerDetail(c)} style={{ background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <CustomerAvatar name={c.name} logoUrl={c.logo_url} size={44} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "15px" }}>{c.name}</div>
                          {c.sector && <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>{c.sector}</div>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openCustomerForm(c)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#475569" }}>✎</button>
                        <button onClick={() => deleteCustomer(c.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#ef4444" }}>✕</button>
                      </div>
                    </div>
                    {primary && (
                      <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "10px", marginBottom: 10 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{primary.name}</div>
                        {primary.title && <div style={{ fontSize: "12px", color: "#6366f1" }}>{primary.title}</div>}
                        {primary.email && <div style={{ fontSize: "12px", color: "#64748b", marginTop: 2 }}>✉️ {primary.email}</div>}
                        {primary.phone && <div style={{ fontSize: "12px", color: "#64748b" }}>📞 {primary.phone}</div>}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 12, fontSize: "12px", color: "#64748b" }}>
                      <span>👤 {custContacts.length} kontak</span>
                      <span>📁 {projCount} proje</span>
                      {c.country && <span>🌍 {c.country}</span>}
                    </div>
                  </div>
                );
              })}
              {filteredCustomers.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "32px", marginBottom: 12 }}>🏢</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Henüz müşteri kaydı yok</div>
                  <Btn onClick={() => openCustomerForm()}>İlk Müşteriyi Ekle</Btn>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "list" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <input placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px 11px 36px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>⌕</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ flex: 1, padding: "11px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", background: "#fff" }}>
                  <option value="all">Tüm Durumlar</option>
                  {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ flex: 1, padding: "11px 12px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", background: "#fff" }}>
                  <option value="all">Tüm Öncelikler</option>
                  {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </div>
            </div>
            {isMobile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filtered.map(p => {
                  const cust = customers.find(c => c.id === p.customer_id);
                  return <ProjectCard key={p.id} p={p} customerName={cust?.name || p.customer} onClick={() => openDetail(p)} onEdit={openProjectForm} onDelete={deleteProject} />;
                })}
                {filtered.length === 0 && <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>Sonuç bulunamadı</div>}
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {[{ label: "Müşteri", key: "customer" }, { label: "Proje", key: "project" }, { label: "Birincil Kontak", key: null }, { label: "Tutar", key: "amount" }, { label: "Tarih", key: "date" }, { label: "Durum", key: null }, { label: "Öncelik", key: null }, { label: "İşlem", key: null }].map(h => (
                        <th key={h.label} onClick={() => { if (h.key) { if (sortBy === h.key) setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortBy(h.key); setSortDir("desc"); } } }}
                          style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: sortBy === h.key ? "#4f46e5" : "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #f0f0f0", cursor: h.key ? "pointer" : "default", userSelect: "none" }}>
                          {h.label}{sortBy === h.key ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const cust = customers.find(c => c.id === p.customer_id);
                      const custContacts = contacts.filter(c => c.customer_id === p.customer_id);
                      const primary = custContacts.find(c => c.is_primary) || custContacts[0];
                      return (
                        <tr key={p.id} style={{ cursor: "pointer", transition: "background 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={e => (e.currentTarget.style.background = "")}
                          onClick={() => openDetail(p)}>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <CustomerAvatar name={cust?.name || p.customer} logoUrl={cust?.logo_url || p.logo_url} size={34} />
                              <div>
                                <div style={{ fontWeight: 600 }}>{cust?.name || p.customer}</div>
                                {cust?.sector && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{cust.sector}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", maxWidth: 180 }}><div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.project}</div></td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}>
                            {primary ? <div><div style={{ fontSize: "13px", fontWeight: 600 }}>{primary.name}</div><div style={{ fontSize: "11px", color: "#6366f1" }}>{primary.title}</div></div>
                              : p.contact ? <div style={{ fontSize: "13px", color: "#64748b" }}>{p.contact}</div>
                              : <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", color: "#64748b" }}>{formatDate(p.date)}</td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}><StatusBadge status={p.status} /></td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }}><PriorityBadge priority={p.priority} /></td>
                          <td style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => openProjectForm(p)} style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#475569" }}>✎</button>
                              <button onClick={() => deleteProject(p.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px", color: "#ef4444" }}>✕</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Sonuç bulunamadı</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{filtered.length} / {projects.length} proje</div>
          </div>
        )}

        {view === "pipeline" && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
            {STATUSES.filter(s => s.key !== "lost").map(status => {
              const items = projects.filter(p => p.status === status.key);
              const total = items.reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
              return (
                <div key={status.key}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = status.bg; e.currentTarget.style.border = `2px dashed ${status.color}`; }}
                  onDragLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid #f0f0f0"; }}
                  onDrop={e => { e.preventDefault(); e.currentTarget.style.background = "#fff"; e.currentTarget.style.border = "1px solid #f0f0f0"; const id = Number(e.dataTransfer.getData("text/plain")); if (id) updateStatus(id, status.key); }}
                  style={{ minWidth: isMobile ? 220 : 260, flex: isMobile ? "0 0 220px" : 1, background: "#fff", borderRadius: "14px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
                    <span style={{ fontWeight: 600, fontSize: "13px" }}>{status.label}</span>
                    <span style={{ background: status.bg, color: status.color, padding: "2px 7px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{items.length}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: 12 }}>{formatCurrency(total, "TRY")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
                    {items.map(p => (
                      <div key={p.id} draggable
                        onDragStart={e => { e.dataTransfer.setData("text/plain", String(p.id)); setDraggedId(p.id); }}
                        onDragEnd={() => setDraggedId(null)}
                        onClick={() => { if (!draggedId) openDetail(p); }}
                        style={{ padding: "12px", borderRadius: "10px", background: draggedId === p.id ? "#e2e8f0" : "#f8fafc", border: "1px solid #f0f0f0", cursor: "grab", opacity: draggedId === p.id ? 0.5 : 1 }}>
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

      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f0f0f0", display: "flex", boxShadow: "0 -4px 16px rgba(0,0,0,0.06)", zIndex: 100 }}>
          {sideItems.map(item => (
            <button key={item.key} onClick={() => setView(item.key)} style={{ flex: 1, padding: "10px 4px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: view === item.key ? "#6366f1" : "#94a3b8", fontFamily: "inherit" }}>
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span style={{ fontSize: "9px", fontWeight: view === item.key ? 700 : 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <Modal open={showProjectForm} onClose={() => setShowProjectForm(false)} title={editProjectId ? "Projeyi Düzenle" : "Yeni Proje Ekle"} wide>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CustomerSearch customers={customers} value={projectForm.customer}
            onChange={(val) => setProjectForm(prev => ({ ...prev, customer: val, customer_id: null }))}
            onSelect={handleCustomerSelect}
            onCreateNew={() => { setShowProjectForm(false); openCustomerForm(null, projectForm.customer, true); }} />
          {selectedCustomerForProject && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <CustomerAvatar name={selectedCustomerForProject.name} logoUrl={selectedCustomerForProject.logo_url} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{selectedCustomerForProject.name}</div>
                {selectedCustomerForProject.sector && <div style={{ fontSize: "12px", color: "#16a34a" }}>{selectedCustomerForProject.sector}</div>}
              </div>
              <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" }}>✓ Bağlandı</span>
            </div>
          )}
          {projectContacts.length > 0 && (
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>Kontak Seç</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projectContacts.map(c => (
                  <div key={c.id} onClick={() => setProjectForm(prev => ({ ...prev, contact: c.name, email: c.email || prev.email, phone: c.phone || prev.phone }))}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${projectForm.contact === c.name ? "#6366f1" : "#e2e8f0"}`, background: projectForm.contact === c.name ? "#eef2ff" : "#fff", cursor: "pointer" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.is_primary ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "13px" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{c.title}{c.email ? ` · ${c.email}` : ""}</div>
                    </div>
                    {c.is_primary && <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: 700 }}>Birincil</span>}
                    {projectForm.contact === c.name && <span style={{ color: "#6366f1" }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <Input label="Proje Adı *" value={projectForm.project} onChange={e => setProjectForm(prev => ({ ...prev, project: e.target.value }))} placeholder="Örn: S/4HANA Dönüşümü" />
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><Input label="Tutar" type="number" value={projectForm.amount} onChange={e => setProjectForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="0" /></div>
              <Select label="Para Birimi" options={CURRENCIES} value={projectForm.currency} onChange={e => setProjectForm(prev => ({ ...prev, currency: e.target.value }))} />
            </div>
            <Input label="Proje Tarihi" type="date" value={projectForm.date} onChange={e => setProjectForm(prev => ({ ...prev, date: e.target.value }))} />
            <Select label="Durum" options={STATUSES.map(s => ({ value: s.key, label: s.label }))} value={projectForm.status} onChange={e => setProjectForm(prev => ({ ...prev, status: e.target.value }))} />
            <Select label="Öncelik" options={PRIORITIES.map(p => ({ value: p.key, label: p.label }))} value={projectForm.priority} onChange={e => setProjectForm(prev => ({ ...prev, priority: e.target.value }))} />
            <Select label="Segment" options={SEGMENTS} value={projectForm.segment} onChange={e => setProjectForm(prev => ({ ...prev, segment: e.target.value }))} />
            <Select label="Kaynak" options={SOURCES} value={projectForm.source} onChange={e => setProjectForm(prev => ({ ...prev, source: e.target.value }))} />
            <Input label="Kazanma Olasılığı (%)" type="number" value={projectForm.probability} onChange={e => setProjectForm(prev => ({ ...prev, probability: e.target.value }))} />
            <Input label="Sonraki Aksiyon" value={projectForm.next_action} onChange={e => setProjectForm(prev => ({ ...prev, next_action: e.target.value }))} placeholder="Yapılacak iş" />
            <Input label="Aksiyon Tarihi" type="date" value={projectForm.next_action_date || ""} onChange={e => setProjectForm(prev => ({ ...prev, next_action_date: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notlar</label>
            <textarea value={projectForm.notes} onChange={e => setProjectForm(prev => ({ ...prev, notes: e.target.value }))} rows={3}
              style={{ width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} placeholder="Proje notları..." />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => setShowProjectForm(false)}>İptal</Btn>
          <Btn onClick={saveProject} disabled={saving || !projectForm.customer || !projectForm.project}>{saving ? "Kaydediliyor..." : editProjectId ? "Güncelle" : "Kaydet"}</Btn>
        </div>
      </Modal>

      <Modal open={showCustomerForm} onClose={() => setShowCustomerForm(false)} title={editCustomerId ? "Müşteriyi Düzenle" : "Yeni Müşteri Kaydı"} wide>
        {pendingCustomerName && !editCustomerId && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", marginBottom: 16, fontSize: "13px", color: "#92400e" }}>
            ⚠️ <strong>"{pendingCustomerName}"</strong> için kayıt bulunamadı. Yeni kayıt oluşturuluyor.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <Input label="Şirket Adı *" value={customerForm.name} onChange={e => setCustomerForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Örn: VAKKO Tekstil A.Ş." />
          <Input label="Sektör" value={customerForm.sector || ""} onChange={e => setCustomerForm(prev => ({ ...prev, sector: e.target.value }))} placeholder="Örn: Perakende" />
          <Input label="Web Sitesi" value={customerForm.website || ""} onChange={e => setCustomerForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://..." />
          <Input label="Logo URL" value={customerForm.logo_url || ""} onChange={e => setCustomerForm(prev => ({ ...prev, logo_url: e.target.value }))} placeholder="https://logo.clearbit.com/..." />
          <Input label="Ülke" value={customerForm.country || ""} onChange={e => setCustomerForm(prev => ({ ...prev, country: e.target.value }))} placeholder="Türkiye" />
          <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
            <Input label="Adres" value={customerForm.address || ""} onChange={e => setCustomerForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Şirket adresi..." />
          </div>
          <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Notlar</label>
            <textarea value={customerForm.notes || ""} onChange={e => setCustomerForm(prev => ({ ...prev, notes: e.target.value }))} rows={2}
              style={{ width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "16px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => { setShowCustomerForm(false); if (returnToProjectForm) setShowProjectForm(true); }}>İptal</Btn>
          <Btn onClick={async () => { const newCust = await saveCustomer(); if (newCust && returnToProjectForm) { handleCustomerSelect(newCust); setShowProjectForm(true); } }} disabled={saving || !customerForm.name}>{saving ? "Kaydediliyor..." : "Kaydet"}</Btn>
        </div>
      </Modal>

      <Modal open={showContactForm} onClose={() => setShowContactForm(false)} title={editContactId ? "Kontağı Düzenle" : "Yeni Kontak Ekle"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Ad Soyad *" value={contactForm.name} onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ad Soyad" />
          <Select label="Ünvan" options={CONTACT_TITLES} value={contactForm.title || CONTACT_TITLES[0]} onChange={e => setContactForm(prev => ({ ...prev, title: e.target.value }))} />
          <Input label="E-posta" type="email" value={contactForm.email || ""} onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))} placeholder="ornek@firma.com" />
          <Input label="Telefon" value={contactForm.phone || ""} onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+90 ..." />
          <Input label="Notlar" value={contactForm.notes || ""} onChange={e => setContactForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Kısa not..." />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", cursor: "pointer" }}
            onClick={() => setContactForm(prev => ({ ...prev, is_primary: !prev.is_primary }))}>
            <div style={{ width: 20, height: 20, borderRadius: "6px", border: `2px solid ${contactForm.is_primary ? "#6366f1" : "#e2e8f0"}`, background: contactForm.is_primary ? "#6366f1" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
              {contactForm.is_primary && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Birincil Kontak</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Bu kişi müşterinin ana iletişim noktasıdır</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn variant="secondary" onClick={() => setShowContactForm(false)}>İptal</Btn>
          <Btn onClick={saveContact} disabled={saving || !contactForm.name}>{saving ? "Kaydediliyor..." : editContactId ? "Güncelle" : "Ekle"}</Btn>
        </div>
      </Modal>

      <Modal open={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Müşteri Detayı" wide>
        {selectedCustomer && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <CustomerAvatar name={selectedCustomer.name} logoUrl={selectedCustomer.logo_url} size={56} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>{selectedCustomer.name}</div>
                {selectedCustomer.sector && <div style={{ fontSize: "14px", color: "#6366f1", fontWeight: 600 }}>{selectedCustomer.sector}</div>}
                {selectedCustomer.website && <a href={selectedCustomer.website} target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}>🌐 {selectedCustomer.website}</a>}
              </div>
              <Btn onClick={() => { openCustomerForm(selectedCustomer); setSelectedCustomer(null); }} variant="secondary" style={{ fontSize: "13px", padding: "8px 16px" }}>Düzenle</Btn>
            </div>
            {selectedCustomer.address && (
              <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "10px", marginBottom: 16, fontSize: "13px", color: "#64748b" }}>
                📍 {selectedCustomer.address}{selectedCustomer.country ? `, ${selectedCustomer.country}` : ""}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Kontaklar ({customerDetailContacts.length})</div>
                <button onClick={() => openContactForm(selectedCustomer.id)} style={{ background: "#eef2ff", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", color: "#6366f1", fontWeight: 600, fontFamily: "inherit" }}>+ Kontak Ekle</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {customerDetailContacts.map(c => (
                  <ContactCard key={c.id} contact={c} isPrimary={c.is_primary} onEdit={(c) => openContactForm(selectedCustomer.id, c)} onDelete={deleteContact} />
                ))}
                {customerDetailContacts.length === 0 && (
                  <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", background: "#f8fafc", borderRadius: "12px" }}>
                    <div style={{ marginBottom: 8 }}>Henüz kontak eklenmedi</div>
                    <button onClick={() => openContactForm(selectedCustomer.id)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" }}>İlk Kontağı Ekle</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                Projeler ({projects.filter(p => p.customer_id === selectedCustomer.id).length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.filter(p => p.customer_id === selectedCustomer.id).map(p => (
                  <div key={p.id} onClick={() => { setSelectedCustomer(null); openDetail(p); }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{p.project}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{formatDate(p.date)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>{formatCurrency(p.amount, p.currency)}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
                {projects.filter(p => p.customer_id === selectedCustomer.id).length === 0 && (
                  <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "13px" }}>Bu müşteriye ait proje yok</div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
              <Btn variant="danger" onClick={() => deleteCustomer(selectedCustomer.id)}>Sil</Btn>
              <Btn onClick={() => { setSelectedCustomer(null); openProjectForm(); setTimeout(() => handleCustomerSelect(selectedCustomer), 50); }}>+ Proje Ekle</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!selectedProject} onClose={() => { setSelectedProject(null); setProjectActivities([]); }} title="Proje Detayı" wide>
        {selectedProject && (() => {
          const cust = customers.find(c => c.id === selectedProject.customer_id);
          const custContacts = contacts.filter(c => c.customer_id === selectedProject.customer_id);
          const primary = custContacts.find(c => c.is_primary) || custContacts[0];
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CustomerAvatar name={cust?.name || selectedProject.customer} logoUrl={cust?.logo_url || selectedProject.logo_url} size={48} />
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>{cust?.name || selectedProject.customer}</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>{selectedProject.project}</div>
                    {cust?.sector && <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: 600 }}>{cust.sector}</div>}
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
              {(primary || selectedProject.contact) && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                    {(primary?.name || selectedProject.contact || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>{primary?.name || selectedProject.contact}</div>
                    {primary?.title && <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>{primary.title}</div>}
                    <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
                      {(primary?.email || selectedProject.email) && <a href={`mailto:${primary?.email || selectedProject.email}`} style={{ fontSize: "12px", color: "#475569", textDecoration: "none" }}>✉️ {primary?.email || selectedProject.email}</a>}
                      {(primary?.phone || selectedProject.phone) && <a href={`tel:${primary?.phone || selectedProject.phone}`} style={{ fontSize: "12px", color: "#475569", textDecoration: "none" }}>📞 {primary?.phone || selectedProject.phone}</a>}
                    </div>
                  </div>
                  {custContacts.length > 1 && <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600, textAlign: "center" }}>+{custContacts.length - 1}<br />kontak</div>}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[{ l: "Segment", v: selectedProject.segment }, { l: "Kaynak", v: selectedProject.source }, { l: "Olasılık", v: `%${selectedProject.probability}` }, { l: "Proje Tarihi", v: formatDate(selectedProject.date) }, { l: "Sonraki Aksiyon", v: selectedProject.next_action || "—" }, { l: "Aksiyon Tarihi", v: formatDate(selectedProject.next_action_date) }].map(item => (
                  <div key={item.l}>
                    <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{item.l}</div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{item.v}</div>
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
                  {STATUSES.map(s => (
                    <button key={s.key} onClick={async () => { await updateStatus(selectedProject.id, s.key); setSelectedProject({ ...selectedProject, status: s.key }); }}
                      style={{ padding: "7px 12px", borderRadius: "8px", border: `1.5px solid ${selectedProject.status === s.key ? s.color : "#e2e8f0"}`, background: selectedProject.status === s.key ? s.bg : "#fff", color: selectedProject.status === s.key ? s.color : "#64748b", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, fontWeight: 600 }}>Aktivite Geçmişi</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {projectActivities.slice().reverse().map(a => (
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
                  <select value={newActivity.type} onChange={e => setNewActivity({ ...newActivity, type: e.target.value })}
                    style={{ padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit" }}>
                    {["Toplantı", "Telefon", "E-posta", "Teklif", "Sunum", "Not", "Kazanım", "Lead"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input placeholder="Aktivite notu..." value={newActivity.note} onChange={e => setNewActivity({ ...newActivity, note: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && addActivity()}
                    style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "16px", fontFamily: "inherit", outline: "none" }} />
                  <Btn onClick={addActivity} style={{ padding: "10px 16px" }}>Ekle</Btn>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                <Btn variant="danger" onClick={() => deleteProject(selectedProject.id)}>Sil</Btn>
                <Btn variant="secondary" onClick={() => { openProjectForm(selectedProject); setSelectedProject(null); }}>Düzenle</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}