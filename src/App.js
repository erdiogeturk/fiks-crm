import { useState, useMemo, useRef, useEffect, useCallback, createContext } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────
const supabase = createClient(
  "https://yevlpkvsqbsxesyuctry.supabase.co",
  "sb_publishable_ywb-WTThx7OqaEwfjFNasw_L_b-Db3l"
);

// ─────────────────────────────────────────────
// i18n — Translations
// ─────────────────────────────────────────────
const translations = {
  tr: {
    dir: "ltr",
    appName: "Fiks CRM",
    subtitle: "Satış Pipeline Yönetimi",
    dashboard: "Dashboard",
    projects: "Projeler",
    pipeline: "Pipeline",
    customers: "Müşteriler",
    language: "Dil",
    search: "Ara...",
    addProject: "Yeni Proje",
    editProject: "Proje Düzenle",
    addCustomer: "Yeni Müşteri",
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    close: "Kapat",
    customer: "Müşteri",
    project: "Proje",
    amount: "Tutar",
    currency: "Para Birimi",
    date: "Tarih",
    status: "Durum",
    priority: "Öncelik",
    segment: "Segment",
    source: "Kaynak",
    probability: "Olasılık",
    contact: "İletişim Kişisi",
    email: "E-posta",
    phone: "Telefon",
    notes: "Notlar",
    nextAction: "Sonraki Adım",
    nextActionDate: "Sonraki Adım Tarihi",
    activities: "Aktiviteler",
    addActivity: "Aktivite Ekle",
    activityType: "Aktivite Tipi",
    activityNote: "Not",
    all: "Tümü",
    sortBy: "Sırala",
    totalProjects: "Toplam Proje",
    wonRevenue: "Kazanılan Gelir",
    weightedPipeline: "Ağırlıklı Pipeline",
    winRate: "Kazanma Oranı",
    noProjects: "Proje bulunamadı",
    confirmDelete: "Bu kaydı silmek istediğinize emin misiniz?",
    uploadLogo: "Logo yükle",
    removeLogo: "Logoyu kaldır",
    customerLogo: "Müşteri Logosu",
    fiksLogo: "Fiks Logosu",
    loading: "Yükleniyor...",
    saving: "Kaydediliyor...",
    lead: "Lead",
    proposal: "Teklif",
    negotiation: "Müzakere",
    won: "Kazanıldı",
    lost: "Kaybedildi",
    onhold: "Beklemede",
    high: "Yüksek",
    medium: "Orta",
    low: "Düşük",
    corporate: "Kurumsal",
    sme: "KOBİ",
    public: "Kamu",
    retail: "Perakende",
    manufacturing: "Üretim",
    energy: "Enerji",
    referral: "Referans",
    website: "Web Sitesi",
    fair: "Fuar",
    coldCall: "Soğuk Arama",
    partner: "Partner",
    linkedin: "LinkedIn",
    meeting: "Toplantı",
    call: "Arama",
    emailAct: "E-posta",
    proposalAct: "Teklif",
    demo: "Demo",
    note: "Not",
    sortDate: "Tarih",
    sortAmount: "Tutar",
    sortCustomer: "Müşteri",
    sortProbability: "Olasılık",
    customerName: "Müşteri Adı",
    sector: "Sektör",
    totalRevenue: "Toplam Gelir",
    activeProjects: "Aktif Projeler",
    customerDetails: "Müşteri Detayı",
    linkedProjects: "Bağlı Projeler",
    dbConnected: "Veritabanı Bağlı",
    dbError: "Bağlantı Hatası",
    // SAP BP fields
    headerInfo: "Başlık Bilgileri",
    addressDetail: "Adres Detay",
    contactDetail: "Kişi Detay",
    customerNumber: "Müşteri Numarası",
    externalNumber: "Harici Numara",
    customerRole: "Müşteri Rolü",
    potential: "Potansiyel Müşteri",
    real: "Gerçek Müşteri",
    customerTypeLabel: "Müşteri Tipi",
    individual: "Bireysel Müşteri",
    corporate2: "Kurumsal Müşteri",
    active: "Aktif",
    blocked: "Engellenmiş",
    inactive: "Kullanım Dışı",
    taxOffice: "Vergi Dairesi",
    taxNumber: "Vergi Numarası",
    responsiblePerson: "Sorumlu Çalışan",
    createdBy: "Oluşturan",
    name1: "Ad 1",
    name2: "Ad 2",
    name3: "Ad 3",
    name4: "Ad 4",
    country: "Ülke",
    city: "İl",
    district: "İlçe",
    neighborhood: "Mahalle",
    postalCode: "Posta Kodu",
    mobilePhone: "Cep Telefonu",
    billingAddress: "Fatura Adresi",
    shippingAddress: "Sevk Adresi",
    contactLastName: "Soyad",
    contactPosition: "Pozisyon",
    websiteLabel: "Web Sitesi",
    editCustomer: "Müşteri Düzenle",
  },
  en: {
    dir: "ltr",
    appName: "Fiks CRM",
    subtitle: "Sales Pipeline Manager",
    dashboard: "Dashboard",
    projects: "Projects",
    pipeline: "Pipeline",
    customers: "Customers",
    language: "Language",
    search: "Search...",
    addProject: "New Project",
    editProject: "Edit Project",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
    customer: "Customer",
    project: "Project",
    amount: "Amount",
    currency: "Currency",
    date: "Date",
    status: "Status",
    priority: "Priority",
    segment: "Segment",
    source: "Source",
    probability: "Probability",
    contact: "Contact Person",
    email: "Email",
    phone: "Phone",
    notes: "Notes",
    nextAction: "Next Action",
    nextActionDate: "Next Action Date",
    activities: "Activities",
    addActivity: "Add Activity",
    activityType: "Activity Type",
    activityNote: "Note",
    all: "All",
    sortBy: "Sort by",
    totalProjects: "Total Projects",
    wonRevenue: "Won Revenue",
    weightedPipeline: "Weighted Pipeline",
    winRate: "Win Rate",
    noProjects: "No projects found",
    confirmDelete: "Are you sure you want to delete this record?",
    uploadLogo: "Upload logo",
    removeLogo: "Remove logo",
    customerLogo: "Customer Logo",
    fiksLogo: "Fiks Logo",
    loading: "Loading...",
    saving: "Saving...",
    lead: "Lead",
    proposal: "Proposal",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
    onhold: "On Hold",
    high: "High",
    medium: "Medium",
    low: "Low",
    corporate: "Corporate",
    sme: "SME",
    public: "Public",
    retail: "Retail",
    manufacturing: "Manufacturing",
    energy: "Energy",
    referral: "Referral",
    website: "Website",
    fair: "Fair/Expo",
    coldCall: "Cold Call",
    partner: "Partner",
    linkedin: "LinkedIn",
    meeting: "Meeting",
    call: "Call",
    emailAct: "Email",
    proposalAct: "Proposal",
    demo: "Demo",
    note: "Note",
    sortDate: "Date",
    sortAmount: "Amount",
    sortCustomer: "Customer",
    sortProbability: "Probability",
    customerName: "Customer Name",
    sector: "Sector",
    totalRevenue: "Total Revenue",
    activeProjects: "Active Projects",
    customerDetails: "Customer Details",
    linkedProjects: "Linked Projects",
    dbConnected: "Database Connected",
    dbError: "Connection Error",
    addCustomer: "New Customer",
    headerInfo: "Header Info",
    addressDetail: "Address Detail",
    contactDetail: "Contact Detail",
    customerNumber: "Customer Number",
    externalNumber: "External Number",
    customerRole: "Customer Role",
    potential: "Potential Customer",
    real: "Real Customer",
    customerTypeLabel: "Customer Type",
    individual: "Individual",
    corporate2: "Corporate",
    active: "Active",
    blocked: "Blocked",
    inactive: "Inactive",
    taxOffice: "Tax Office",
    taxNumber: "Tax Number",
    responsiblePerson: "Responsible Person",
    createdBy: "Created By",
    name1: "Name 1", name2: "Name 2", name3: "Name 3", name4: "Name 4",
    country: "Country",
    city: "City",
    district: "District",
    neighborhood: "Neighborhood",
    postalCode: "Postal Code",
    mobilePhone: "Mobile Phone",
    billingAddress: "Billing Address",
    shippingAddress: "Shipping Address",
    contactLastName: "Last Name",
    contactPosition: "Position",
    websiteLabel: "Website",
    editCustomer: "Edit Customer",
  },
  ar: {
    dir: "rtl",
    appName: "فكس CRM",
    subtitle: "إدارة خط أنابيب المبيعات",
    dashboard: "لوحة التحكم",
    projects: "المشاريع",
    pipeline: "خط الأنابيب",
    customers: "العملاء",
    language: "اللغة",
    search: "بحث...",
    addProject: "مشروع جديد",
    editProject: "تعديل المشروع",
    addCustomer: "عميل جديد",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    close: "إغلاق",
    customer: "العميل",
    project: "المشروع",
    amount: "المبلغ",
    currency: "العملة",
    date: "التاريخ",
    status: "الحالة",
    priority: "الأولوية",
    segment: "القطاع",
    source: "المصدر",
    probability: "الاحتمالية",
    contact: "جهة الاتصال",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    notes: "ملاحظات",
    nextAction: "الإجراء التالي",
    nextActionDate: "تاريخ الإجراء التالي",
    activities: "الأنشطة",
    addActivity: "إضافة نشاط",
    activityType: "نوع النشاط",
    activityNote: "ملاحظة",
    all: "الكل",
    sortBy: "ترتيب حسب",
    totalProjects: "إجمالي المشاريع",
    wonRevenue: "الإيرادات المحققة",
    weightedPipeline: "خط الأنابيب المرجح",
    winRate: "معدل الفوز",
    noProjects: "لم يتم العثور على مشاريع",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا السجل؟",
    uploadLogo: "تحميل الشعار",
    removeLogo: "إزالة الشعار",
    customerLogo: "شعار العميل",
    fiksLogo: "شعار فكس",
    loading: "جاري التحميل...",
    saving: "جاري الحفظ...",
    lead: "عميل محتمل",
    proposal: "عرض",
    negotiation: "مفاوضة",
    won: "مكتسب",
    lost: "مفقود",
    onhold: "قيد الانتظار",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    corporate: "شركات",
    sme: "منشآت صغيرة",
    public: "قطاع عام",
    retail: "تجزئة",
    manufacturing: "تصنيع",
    energy: "طاقة",
    referral: "إحالة",
    website: "موقع إلكتروني",
    fair: "معرض",
    coldCall: "اتصال بارد",
    partner: "شريك",
    linkedin: "لينكدإن",
    meeting: "اجتماع",
    call: "اتصال",
    emailAct: "بريد إلكتروني",
    proposalAct: "عرض",
    demo: "عرض توضيحي",
    note: "ملاحظة",
    sortDate: "التاريخ",
    sortAmount: "المبلغ",
    sortCustomer: "العميل",
    sortProbability: "الاحتمالية",
    customerName: "اسم العميل",
    sector: "القطاع",
    totalRevenue: "إجمالي الإيرادات",
    activeProjects: "المشاريع النشطة",
    customerDetails: "تفاصيل العميل",
    linkedProjects: "المشاريع المرتبطة",
    dbConnected: "قاعدة البيانات متصلة",
    dbError: "خطأ في الاتصال",
    headerInfo: "معلومات العنوان",
    addressDetail: "تفاصيل العنوان",
    contactDetail: "تفاصيل جهة الاتصال",
    customerNumber: "رقم العميل",
    externalNumber: "رقم خارجي",
    customerRole: "دور العميل",
    potential: "عميل محتمل",
    real: "عميل فعلي",
    customerTypeLabel: "نوع العميل",
    individual: "فردي",
    corporate2: "شركة",
    active: "نشط",
    blocked: "محظور",
    inactive: "غير نشط",
    taxOffice: "مكتب الضرائب",
    taxNumber: "الرقم الضريبي",
    responsiblePerson: "الشخص المسؤول",
    createdBy: "أنشأ بواسطة",
    name1: "اسم 1", name2: "اسم 2", name3: "اسم 3", name4: "اسم 4",
    country: "البلد",
    city: "المدينة",
    district: "المنطقة",
    neighborhood: "الحي",
    postalCode: "الرمز البريدي",
    mobilePhone: "الهاتف المحمول",
    billingAddress: "عنوان الفاتورة",
    shippingAddress: "عنوان الشحن",
    contactLastName: "اسم العائلة",
    contactPosition: "المنصب",
    websiteLabel: "الموقع الإلكتروني",
    editCustomer: "تعديل العميل",
    addCustomer: "عميل جديد",
  },
};

const LangContext = createContext();
const LANG_FLAGS = { tr: "🇹🇷", en: "🇬🇧", ar: "🇸🇦" };
const LANG_NAMES = { tr: "Türkçe", en: "English", ar: "العربية" };

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STATUS_KEYS = ["lead", "proposal", "negotiation", "won", "lost", "onhold"];
const STATUS_COLORS = {
  lead: { color: "#6366f1", bg: "#eef2ff" },
  proposal: { color: "#f59e0b", bg: "#fffbeb" },
  negotiation: { color: "#3b82f6", bg: "#eff6ff" },
  won: { color: "#10b981", bg: "#ecfdf5" },
  lost: { color: "#ef4444", bg: "#fef2f2" },
  onhold: { color: "#8b5cf6", bg: "#f5f3ff" },
};
const PRIORITY_KEYS = ["high", "medium", "low"];
const PRIORITY_ICONS = { high: "▲", medium: "●", low: "▼" };
const PRIORITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };
const SEGMENT_KEYS = ["corporate", "sme", "public", "retail", "manufacturing", "energy"];
const SOURCE_KEYS = ["referral", "website", "fair", "coldCall", "partner", "linkedin"];
const ACTIVITY_TYPES = ["meeting", "call", "emailAct", "proposalAct", "demo", "note"];
const CURRENCIES = ["EUR", "USD", "TRY"];

const fileToBase64 = (file) =>
  new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(file);
  });

const formatCurrency = (amount, currency) => {
  const symbols = { EUR: "€", USD: "$", TRY: "₺" };
  return `${symbols[currency] || ""}${Number(amount || 0).toLocaleString("tr-TR")}`;
};

const emptyProject = {
  customer_id: "", project: "", amount: "", currency: "EUR",
  date: new Date().toISOString().slice(0, 10),
  status: "lead", priority: "medium", segment: "corporate", source: "referral",
  probability: 30, notes: "", next_action: "", next_action_date: "",
};

const emptyCustomer = {
  // Başlık Bilgileri
  name: "", customer_number: "", external_number: "",
  role: "potential", customer_type: "corporate", status: "active",
  name1: "", name2: "", name3: "", name4: "",
  tax_office: "", tax_number: "",
  responsible_person: "", created_by: "",
  sector: "corporate", logo: null, website: "",
  // Adres Detay
  country: "TR", city: "", district: "", neighborhood: "",
  address: "", postal_code: "",
  phone: "", mobile_phone: "", email: "",
  billing_address: true, shipping_address: true,
  // Kişi Detay (primary contact)
  contact: "", contact_last_name: "", contact_position: "",
};

const CUSTOMER_ROLES = ["potential", "real"];
const CUSTOMER_TYPES = ["corporate", "individual"];
const CUSTOMER_STATUSES = ["active", "blocked", "inactive"];
const COUNTRIES = ["TR", "DE", "US", "GB", "OM", "CY", "IT", "SA", "AE"];

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("fiks_crm_lang") || "tr");
  const t = translations[lang];

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("connecting");
  const [fiksLogo, setFiksLogo] = useState(() => localStorage.getItem("fiks_crm_logo") || null);

  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const [showForm, setShowForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyProject });
  const [customerFormData, setCustomerFormData] = useState({ ...emptyCustomer });
  const [editCustomerId, setEditCustomerId] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newActivity, setNewActivity] = useState({ type: "meeting", note: "" });
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [custFormTab, setCustFormTab] = useState("header");
  const fiksLogoRef = useRef();

  // ─── Supabase: Load all data ───
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [custRes, projRes, actRes] = await Promise.all([
        supabase.from("customers").select("*").order("created_at"),
        supabase.from("projects").select("*").order("created_at"),
        supabase.from("activities").select("*").order("created_at"),
      ]);
      if (custRes.error) throw custRes.error;
      if (projRes.error) throw projRes.error;
      if (actRes.error) throw actRes.error;
      setCustomers(custRes.data || []);
      setProjects(projRes.data || []);
      setActivities(actRes.data || []);
      setDbStatus("connected");
    } catch (err) {
      console.error("DB Error:", err);
      setDbStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { localStorage.setItem("fiks_crm_lang", lang); }, [lang]);

  // ─── Helpers ───
  const getCustomer = useCallback((cid) => customers.find((c) => c.id === cid), [customers]);
  const getCustomerName = useCallback((cid) => {
    const c = customers.find((cx) => cx.id === cid);
    return c ? c.name : "—";
  }, [customers]);

  const getProjectActivities = useCallback((pid) => {
    return activities.filter((a) => a.project_id === pid);
  }, [activities]);

  const handleFiksLogo = async (e) => {
    if (e.target.files[0]) {
      const b64 = await fileToBase64(e.target.files[0]);
      setFiksLogo(b64);
      localStorage.setItem("fiks_crm_logo", b64);
    }
  };

  // ─── Supabase: CRUD ───
  const saveProject = async () => {
    if (!formData.customer_id || !formData.project) return;
    try {
      if (editId) {
        const { id, created_at, ...updateData } = formData;
        const { error } = await supabase.from("projects").update(updateData).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([{
          customer_id: formData.customer_id, project: formData.project,
          amount: Number(formData.amount) || 0, currency: formData.currency,
          date: formData.date, status: formData.status, priority: formData.priority,
          segment: formData.segment, source: formData.source,
          probability: Number(formData.probability) || 30,
          notes: formData.notes, next_action: formData.next_action,
          next_action_date: formData.next_action_date || null,
        }]);
        if (error) throw error;
      }
      setShowForm(false);
      setEditId(null);
      await loadData();
    } catch (err) { console.error("Save error:", err); alert("Kaydetme hatası: " + err.message); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setSelectedProject(null);
      await loadData();
    } catch (err) { console.error("Delete error:", err); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const prob = newStatus === "won" ? 100 : newStatus === "lost" ? 0 : undefined;
      const update = prob !== undefined ? { status: newStatus, probability: prob } : { status: newStatus };
      const { error } = await supabase.from("projects").update(update).eq("id", id);
      if (error) throw error;
      await loadData();
      setSelectedProject((prev) => prev ? { ...prev, status: newStatus, ...(prob !== undefined ? { probability: prob } : {}) } : null);
    } catch (err) { console.error("Status update error:", err); }
  };

  const addActivity = async () => {
    if (!newActivity.note || !selectedProject) return;
    try {
      const { error } = await supabase.from("activities").insert([{
        project_id: selectedProject.id,
        type: newActivity.type,
        note: newActivity.note,
        date: new Date().toISOString().slice(0, 10),
      }]);
      if (error) throw error;
      setNewActivity({ type: "meeting", note: "" });
      await loadData();
    } catch (err) { console.error("Activity error:", err); }
  };

  const saveCustomer = async () => {
    if (!customerFormData.name) return;
    try {
      if (editCustomerId) {
        const { id, created_at, ...updateData } = customerFormData;
        const { error } = await supabase.from("customers").update(updateData).eq("id", editCustomerId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert([customerFormData]);
        if (error) throw error;
      }
      setShowCustomerForm(false);
      setEditCustomerId(null);
      setCustomerFormData({ ...emptyCustomer });
      await loadData();
    } catch (err) { console.error("Customer save error:", err); alert("Hata: " + err.message); }
  };

  const updateCustomerLogo = async (custId, file) => {
    const b64 = await fileToBase64(file);
    try {
      const { error } = await supabase.from("customers").update({ logo: b64 }).eq("id", custId);
      if (error) throw error;
      await loadData();
    } catch (err) { console.error("Logo error:", err); }
  };

  // ─── Form openers ───
  const openForm = (proj = null) => {
    if (proj) { setFormData({ ...proj }); setEditId(proj.id); }
    else { setFormData({ ...emptyProject }); setEditId(null); }
    setShowForm(true);
  };

  const openCustomerForm = (cust = null) => {
    if (cust) { setCustomerFormData({ ...cust }); setEditCustomerId(cust.id); }
    else { setCustomerFormData({ ...emptyCustomer }); setEditCustomerId(null); }
    setShowCustomerForm(true);
  };

  // ─── Filtered & sorted ───
  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const cName = getCustomerName(p.customer_id).toLowerCase();
        return cName.includes(q) || p.project.toLowerCase().includes(q);
      });
    }
    if (filterStatus !== "all") list = list.filter((p) => p.status === filterStatus);
    if (filterSegment !== "all") list = list.filter((p) => p.segment === filterSegment);
    if (filterPriority !== "all") list = list.filter((p) => p.priority === filterPriority);
    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "date") { va = a.date; vb = b.date; }
      else if (sortBy === "amount") { va = Number(a.amount); vb = Number(b.amount); }
      else if (sortBy === "customer") { va = getCustomerName(a.customer_id); vb = getCustomerName(b.customer_id); }
      else if (sortBy === "probability") { va = a.probability; vb = b.probability; }
      else { va = a.date; vb = b.date; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [projects, search, filterStatus, filterSegment, filterPriority, sortBy, sortDir, getCustomerName]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const won = projects.filter((p) => p.status === "won").reduce((s, p) => s + Number(p.amount), 0);
    const pipeline = projects.filter((p) => !["won", "lost"].includes(p.status)).reduce((s, p) => s + Number(p.amount) * (p.probability / 100), 0);
    const wonCount = projects.filter((p) => p.status === "won").length;
    const lostCount = projects.filter((p) => p.status === "lost").length;
    const winRate = wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;
    return { count: projects.length, won, pipeline, winRate };
  }, [projects]);

  const customerStats = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      const cProjects = projects.filter((p) => p.customer_id === c.id);
      const totalRev = cProjects.filter((p) => p.status === "won").reduce((s, p) => s + Number(p.amount), 0);
      const activeCount = cProjects.filter((p) => !["won", "lost"].includes(p.status)).length;
      map[c.id] = { projects: cProjects, totalRevenue: totalRev, activeCount };
    });
    return map;
  }, [customers, projects]);

  // ─── Sidebar items ───
  const sideItems = [
    { key: "dashboard", label: t.dashboard, icon: "◐" },
    { key: "list", label: t.projects, icon: "☰" },
    { key: "pipeline", label: t.pipeline, icon: "◧" },
    { key: "customers", label: t.customers, icon: "◉" },
  ];

  // ─── Styles ───
  const isRtl = t.dir === "rtl";
  const containerDir = isRtl ? "rtl" : "ltr";
  const cardStyle = { background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" };
  const btnPrimary = { background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" };
  const inputStyle = { padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box", direction: containerDir, textAlign: isRtl ? "right" : "left" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "block" };

  // ─── Loading screen ───
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⬡</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>Fiks CRM</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>{t.loading}</div>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───
  const renderDashboard = () => {
    const kpis = [
      { label: t.totalProjects, value: stats.count, color: "#6366f1", icon: "📊" },
      { label: t.wonRevenue, value: formatCurrency(stats.won, "EUR"), color: "#10b981", icon: "💰" },
      { label: t.weightedPipeline, value: formatCurrency(stats.pipeline, "EUR"), color: "#3b82f6", icon: "📈" },
      { label: t.winRate, value: `${stats.winRate}%`, color: "#f59e0b", icon: "🎯" },
    ];
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ ...cardStyle, borderTop: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><span>{k.icon}</span> {k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{t.pipeline} {t.status}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {STATUS_KEYS.filter((sk) => sk !== "lost").map((sk) => {
              const count = projects.filter((p) => p.status === sk).length;
              const total = projects.filter((p) => p.status === sk).reduce((s, p) => s + Number(p.amount), 0);
              return (
                <div key={sk} style={{ flex: "1 1 140px", background: STATUS_COLORS[sk].bg, borderRadius: 12, padding: "14px 16px", minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: STATUS_COLORS[sk].color, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{t[sk]}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: STATUS_COLORS[sk].color }}>{count}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{formatCurrency(total, "EUR")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── Project List ───
  const renderList = () => (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} style={{ ...inputStyle, maxWidth: 220 }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, maxWidth: 150 }}>
          <option value="all">{t.all} {t.status}</option>
          {STATUS_KEYS.map((sk) => <option key={sk} value={sk}>{t[sk]}</option>)}
        </select>
        <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)} style={{ ...inputStyle, maxWidth: 150 }}>
          <option value="all">{t.all} {t.segment}</option>
          {SEGMENT_KEYS.map((sk) => <option key={sk} value={sk}>{t[sk]}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ ...inputStyle, maxWidth: 150 }}>
          <option value="all">{t.all} {t.priority}</option>
          {PRIORITY_KEYS.map((pk) => <option key={pk} value={pk}>{t[pk]}</option>)}
        </select>
        <div style={{ marginInlineStart: "auto" }}>
          <button onClick={() => openForm()} style={btnPrimary}>+ {t.addProject}</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", fontSize: 12, color: "#94a3b8" }}>
        {t.sortBy}:
        {[["date", t.sortDate], ["amount", t.sortAmount], ["customer", t.sortCustomer], ["probability", t.sortProbability]].map(([k, label]) => (
          <button key={k} onClick={() => { if (sortBy === k) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortBy(k); setSortDir("desc"); } }}
            style={{ background: sortBy === k ? "#6366f1" : "#f1f5f9", color: sortBy === k ? "#fff" : "#64748b", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            {label} {sortBy === k && (sortDir === "asc" ? "↑" : "↓")}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: 40, color: "#94a3b8" }}>{t.noProjects}</div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                {[t.customer, t.project, t.amount, t.status, t.priority, t.probability, t.date, ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 14px", textAlign: isRtl ? "right" : "left", fontWeight: 600, fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cust = getCustomer(p.customer_id);
                const st = STATUS_COLORS[p.status] || STATUS_COLORS.lead;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                    onClick={() => setSelectedProject(p)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {cust?.logo ? <img src={cust.logo} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: "contain" }} /> : <span style={{ width: 24, height: 24, borderRadius: 6, background: "#e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#64748b" }}>{(cust?.name || "?")[0]}</span>}
                        {cust?.name || "—"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{p.project}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(p.amount, p.currency)}</td>
                    <td style={{ padding: "12px 14px" }}><span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{t[p.status]}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ color: PRIORITY_COLORS[p.priority], fontWeight: 600, fontSize: 12 }}>{PRIORITY_ICONS[p.priority]} {t[p.priority]}</span></td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 6, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
                          <div style={{ width: `${p.probability}%`, height: "100%", background: p.probability > 60 ? "#10b981" : p.probability > 30 ? "#f59e0b" : "#ef4444", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{p.probability}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 12 }}>{p.date}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={(e) => { e.stopPropagation(); openForm(p); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── Pipeline ───
  const renderPipeline = () => (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
      {STATUS_KEYS.map((sk) => {
        const inStatus = projects.filter((p) => p.status === sk);
        const st = STATUS_COLORS[sk];
        return (
          <div key={sk} style={{ minWidth: 260, flex: "1 1 260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: st.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: st.color }}>{t[sk]}</span>
              <span style={{ fontSize: 11, background: st.bg, color: st.color, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>{inStatus.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inStatus.map((p) => {
                const cust = getCustomer(p.customer_id);
                return (
                  <div key={p.id} onClick={() => setSelectedProject(p)}
                    style={{ ...cardStyle, padding: "14px 16px", cursor: "pointer", borderInlineStart: `3px solid ${st.color}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      {cust?.logo && <img src={cust.logo} alt="" style={{ width: 18, height: 18, borderRadius: 4, objectFit: "contain" }} />}
                      {cust?.name || "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{p.project}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{formatCurrency(p.amount, p.currency)}</span>
                      <span style={{ fontSize: 11, color: PRIORITY_COLORS[p.priority], fontWeight: 600 }}>{PRIORITY_ICONS[p.priority]} {t[p.priority]}</span>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#e2e8f0" }}>
                        <div style={{ width: `${p.probability}%`, height: "100%", background: st.color, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: isRtl ? "left" : "right" }}>{p.probability}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── Customers ───
  const renderCustomers = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => openCustomerForm()} style={btnPrimary}>+ {t.addCustomer}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {customers.map((c) => {
          const cs = customerStats[c.id] || { projects: [], totalRevenue: 0, activeCount: 0 };
          return (
            <div key={c.id} style={{ ...cardStyle, cursor: "pointer" }}
              onClick={() => setSelectedCustomer(c)}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {c.logo ? (
                  <img src={c.logo} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{c.name[0]}</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{t[c.sector] || c.sector}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                <div><span style={{ color: "#94a3b8" }}>{t.totalRevenue}:</span> <strong style={{ color: "#10b981" }}>{formatCurrency(cs.totalRevenue, "EUR")}</strong></div>
                <div><span style={{ color: "#94a3b8" }}>{t.activeProjects}:</span> <strong>{cs.activeCount}</strong></div>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>{c.contact} · {c.email}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Project Detail Modal ───
  const renderProjectDetail = () => {
    if (!selectedProject) return null;
    const p = selectedProject;
    const cust = getCustomer(p.customer_id);
    const st = STATUS_COLORS[p.status] || STATUS_COLORS.lead;
    const pActivities = getProjectActivities(p.id);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}
        onClick={() => setSelectedProject(null)}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
          <div style={{ background: `linear-gradient(135deg, ${st.color}22, ${st.color}08)`, padding: "24px 28px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {cust?.logo && <img src={cust.logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain" }} />}
                  <span style={{ fontSize: 13, color: "#64748b" }}>{cust?.name || "—"}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{p.project}</div>
              </div>
              <button onClick={() => setSelectedProject(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t[p.status]}</span>
              <span style={{ color: PRIORITY_COLORS[p.priority], fontSize: 12, fontWeight: 600 }}>{PRIORITY_ICONS[p.priority]} {t[p.priority]}</span>
              <span style={{ fontSize: 22, fontWeight: 700, marginInlineStart: "auto", color: "#1e293b" }}>{formatCurrency(p.amount, p.currency)}</span>
            </div>
          </div>
          <div style={{ padding: "20px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: 13, marginBottom: 20 }}>
              <div><span style={{ color: "#94a3b8" }}>{t.segment}:</span> {t[p.segment]}</div>
              <div><span style={{ color: "#94a3b8" }}>{t.source}:</span> {t[p.source]}</div>
              <div><span style={{ color: "#94a3b8" }}>{t.probability}:</span> {p.probability}%</div>
              <div><span style={{ color: "#94a3b8" }}>{t.date}:</span> {p.date}</div>
              {cust && <>
                <div><span style={{ color: "#94a3b8" }}>{t.contact}:</span> {cust.contact}</div>
                <div><span style={{ color: "#94a3b8" }}>{t.email}:</span> {cust.email}</div>
                <div><span style={{ color: "#94a3b8" }}>{t.phone}:</span> {cust.phone}</div>
              </>}
              {p.next_action && <div style={{ gridColumn: "span 2" }}><span style={{ color: "#94a3b8" }}>{t.nextAction}:</span> {p.next_action} ({p.next_action_date})</div>}
            </div>
            {p.notes && <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 20, color: "#475569" }}>{p.notes}</div>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {STATUS_KEYS.map((sk) => (
                <button key={sk} onClick={() => updateStatus(p.id, sk)}
                  style={{ background: p.status === sk ? STATUS_COLORS[sk].color : STATUS_COLORS[sk].bg, color: p.status === sk ? "#fff" : STATUS_COLORS[sk].color, border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {t[sk]}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t.activities}</div>
            {pActivities.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                <span style={{ color: "#94a3b8", minWidth: 80 }}>{a.date}</span>
                <span style={{ background: "#eef2ff", color: "#6366f1", padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontSize: 11 }}>{t[a.type] || a.type}</span>
                <span style={{ color: "#475569" }}>{a.note}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <select value={newActivity.type} onChange={(e) => setNewActivity((a) => ({ ...a, type: e.target.value }))} style={{ ...inputStyle, maxWidth: 130 }}>
                {ACTIVITY_TYPES.map((at) => <option key={at} value={at}>{t[at]}</option>)}
              </select>
              <input value={newActivity.note} onChange={(e) => setNewActivity((a) => ({ ...a, note: e.target.value }))} placeholder={t.activityNote} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addActivity} style={{ ...btnPrimary, padding: "10px 16px", whiteSpace: "nowrap" }}>{t.addActivity}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Customer Detail Modal ───
  const renderCustomerDetail = () => {
    if (!selectedCustomer) return null;
    const c = selectedCustomer;
    const cs = customerStats[c.id] || { projects: [], totalRevenue: 0, activeCount: 0 };
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}
        onClick={() => setSelectedCustomer(null)}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative" }}>
                {c.logo ? (
                  <img src={c.logo} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: "contain" }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 22 }}>{c.name[0]}</div>
                )}
                <label style={{ position: "absolute", bottom: -4, right: -4, background: "#6366f1", border: "2px solid #fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10, color: "#fff" }}>
                  📷
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) updateCustomerLogo(c.id, e.target.files[0]); }} />
                </label>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{t[c.sector] || c.sector}</div>
              </div>
            </div>
            <button onClick={() => setSelectedCustomer(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 20 }}>
            <div><span style={{ color: "#94a3b8" }}>{t.contact}:</span> {c.contact}</div>
            <div><span style={{ color: "#94a3b8" }}>{t.email}:</span> {c.email}</div>
            <div><span style={{ color: "#94a3b8" }}>{t.phone}:</span> {c.phone}</div>
            <div><span style={{ color: "#94a3b8" }}>{t.totalRevenue}:</span> <strong style={{ color: "#10b981" }}>{formatCurrency(cs.totalRevenue, "EUR")}</strong></div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t.linkedProjects}</div>
          {cs.projects.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>{t.noProjects}</div>
          ) : (
            cs.projects.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "#f8fafc", marginBottom: 8, cursor: "pointer" }}
                onClick={() => { setSelectedCustomer(null); setSelectedProject(p); }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.project}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.date}</div>
                </div>
                <div style={{ textAlign: isRtl ? "left" : "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{formatCurrency(p.amount, p.currency)}</div>
                  <span style={{ background: STATUS_COLORS[p.status]?.bg, color: STATUS_COLORS[p.status]?.color, padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600 }}>{t[p.status]}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ─── Project Form Modal ───
  const renderForm = () => {
    if (!showForm) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}
        onClick={() => setShowForm(false)}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{editId ? t.editProject : t.addProject}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>{t.customer}</label>
              <select value={formData.customer_id} onChange={(e) => setFormData((f) => ({ ...f, customer_id: e.target.value }))} style={inputStyle}>
                <option value="">-- {t.customer} --</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>{t.project}</label>
              <input value={formData.project} onChange={(e) => setFormData((f) => ({ ...f, project: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.amount}</label>
              <input type="number" value={formData.amount} onChange={(e) => setFormData((f) => ({ ...f, amount: e.target.value }))} style={{ ...inputStyle, fontSize: 18, fontWeight: 700, borderColor: "#6366f1", padding: "14px 16px" }} />
            </div>
            <div>
              <label style={labelStyle}>{t.currency}</label>
              <select value={formData.currency} onChange={(e) => setFormData((f) => ({ ...f, currency: e.target.value }))} style={inputStyle}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.status}</label>
              <select value={formData.status} onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {STATUS_KEYS.map((sk) => <option key={sk} value={sk}>{t[sk]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.priority}</label>
              <select value={formData.priority} onChange={(e) => setFormData((f) => ({ ...f, priority: e.target.value }))} style={inputStyle}>
                {PRIORITY_KEYS.map((pk) => <option key={pk} value={pk}>{t[pk]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.segment}</label>
              <select value={formData.segment} onChange={(e) => setFormData((f) => ({ ...f, segment: e.target.value }))} style={inputStyle}>
                {SEGMENT_KEYS.map((sk) => <option key={sk} value={sk}>{t[sk]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.source}</label>
              <select value={formData.source} onChange={(e) => setFormData((f) => ({ ...f, source: e.target.value }))} style={inputStyle}>
                {SOURCE_KEYS.map((sk) => <option key={sk} value={sk}>{t[sk]}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.probability} (%)</label>
              <input type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData((f) => ({ ...f, probability: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.date}</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.nextAction}</label>
              <input value={formData.next_action || ""} onChange={(e) => setFormData((f) => ({ ...f, next_action: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.nextActionDate}</label>
              <input type="date" value={formData.next_action_date || ""} onChange={(e) => setFormData((f) => ({ ...f, next_action_date: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>{t.notes}</label>
              <textarea value={formData.notes || ""} onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowForm(false)} style={{ ...btnPrimary, background: "#f1f5f9", color: "#64748b" }}>{t.cancel}</button>
            <button onClick={saveProject} style={btnPrimary}>{t.save}</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Customer Form Modal (SAP BP Standard) ───
  const renderCustomerForm = () => {
    if (!showCustomerForm) return null;
    const tabBtn = (key, label) => (
      <button key={key} onClick={() => setCustFormTab(key)}
        style={{ padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "1px solid #e2e8f0", borderBottom: custFormTab === key ? "2px solid #6366f1" : "1px solid #e2e8f0", background: custFormTab === key ? "#fff" : "#f8fafc", color: custFormTab === key ? "#6366f1" : "#64748b", fontWeight: custFormTab === key ? 700 : 400, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
        {label}
      </button>
    );
    const F = ({ label, span2, children }) => (
      <div style={span2 ? { gridColumn: "span 2" } : {}}>
        <label style={labelStyle}>{label}</label>
        {children}
      </div>
    );
    const I = ({ field, ...props }) => (
      <input value={customerFormData[field] || ""} onChange={(e) => setCustomerFormData((f) => ({ ...f, [field]: e.target.value }))} style={inputStyle} {...props} />
    );
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}
        onClick={() => setShowCustomerForm(false)}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{editCustomerId ? t.editCustomer : t.addCustomer}</div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 0, borderBottom: "1px solid #e2e8f0" }}>
            {tabBtn("header", t.headerInfo)}
            {tabBtn("address", t.addressDetail)}
            {tabBtn("contact", t.contactDetail)}
          </div>
          <div style={{ padding: "20px 0 0" }}>
            {/* ── TAB: Başlık Bilgileri ── */}
            {custFormTab === "header" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 18px" }}>
                <F label={t.customerName} span2><I field="name" /></F>
                <F label={t.customerNumber}><I field="customer_number" /></F>
                <F label={t.externalNumber}><I field="external_number" /></F>
                <F label={t.customerRole}>
                  <select value={customerFormData.role || "potential"} onChange={(e) => setCustomerFormData((f) => ({ ...f, role: e.target.value }))} style={inputStyle}>
                    {CUSTOMER_ROLES.map((r) => <option key={r} value={r}>{t[r]}</option>)}
                  </select>
                </F>
                <F label={t.customerTypeLabel}>
                  <select value={customerFormData.customer_type || "corporate"} onChange={(e) => setCustomerFormData((f) => ({ ...f, customer_type: e.target.value }))} style={inputStyle}>
                    {CUSTOMER_TYPES.map((ct) => <option key={ct} value={ct}>{ct === "corporate" ? t.corporate2 : t.individual}</option>)}
                  </select>
                </F>
                <F label={t.name1}><I field="name1" /></F>
                <F label={t.name2}><I field="name2" /></F>
                <F label={t.name3}><I field="name3" /></F>
                <F label={t.name4}><I field="name4" /></F>
                <F label={t.status}>
                  <select value={customerFormData.status || "active"} onChange={(e) => setCustomerFormData((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
                    {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{t[s]}</option>)}
                  </select>
                </F>
                <F label={t.sector}>
                  <select value={customerFormData.sector} onChange={(e) => setCustomerFormData((f) => ({ ...f, sector: e.target.value }))} style={inputStyle}>
                    {SEGMENT_KEYS.map((sk) => <option key={sk} value={sk}>{t[sk]}</option>)}
                  </select>
                </F>
                <F label={t.taxOffice}><I field="tax_office" /></F>
                <F label={t.taxNumber}><I field="tax_number" /></F>
                <F label={t.responsiblePerson}><I field="responsible_person" /></F>
                <F label={t.createdBy}><I field="created_by" /></F>
                <F label={t.websiteLabel}><I field="website" /></F>
              </div>
            )}
            {/* ── TAB: Adres Detay ── */}
            {custFormTab === "address" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 18px" }}>
                <F label={t.country}>
                  <select value={customerFormData.country || "TR"} onChange={(e) => setCustomerFormData((f) => ({ ...f, country: e.target.value }))} style={inputStyle}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </F>
                <F label={t.city}><I field="city" /></F>
                <F label={t.district}><I field="district" /></F>
                <F label={t.neighborhood}><I field="neighborhood" /></F>
                <F label={t.postalCode}><I field="postal_code" /></F>
                <div />
                <F label={t.notes + " (" + t.notes + ")"} span2>
                  <input value={customerFormData.address || ""} onChange={(e) => setCustomerFormData((f) => ({ ...f, address: e.target.value }))} style={inputStyle} placeholder="Açık adres..." />
                </F>
                <div />
                <F label={t.phone}><I field="phone" /></F>
                <F label={t.mobilePhone}><I field="mobile_phone" /></F>
                <F label={t.email}><I field="email" /></F>
                <F label={t.billingAddress}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={customerFormData.billing_address !== false} onChange={(e) => setCustomerFormData((f) => ({ ...f, billing_address: e.target.checked }))} />
                    {t.billingAddress}
                  </label>
                </F>
                <F label={t.shippingAddress}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={customerFormData.shipping_address !== false} onChange={(e) => setCustomerFormData((f) => ({ ...f, shipping_address: e.target.checked }))} />
                    {t.shippingAddress}
                  </label>
                </F>
              </div>
            )}
            {/* ── TAB: Kişi Detay ── */}
            {custFormTab === "contact" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" }}>
                <F label={t.contact}><I field="contact" /></F>
                <F label={t.contactLastName}><I field="contact_last_name" /></F>
                <F label={t.contactPosition}><I field="contact_position" /></F>
                <F label={t.customerRole}>
                  <input value={customerFormData.role || ""} readOnly style={{ ...inputStyle, background: "#f8fafc" }} />
                </F>
                <F label={t.phone}><I field="phone" /></F>
                <F label={t.email}><I field="email" /></F>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
            <button onClick={() => setShowCustomerForm(false)} style={{ ...btnPrimary, background: "#f1f5f9", color: "#64748b" }}>{t.cancel}</button>
            <button onClick={saveCustomer} style={btnPrimary}>{t.save}</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ───
  return (
    <LangContext.Provider value={{ lang, t }}>
      <div dir={containerDir} style={{ fontFamily: lang === "ar" ? "'Noto Sans Arabic', 'DM Sans', sans-serif" : "'DM Sans', 'Segoe UI', system-ui, sans-serif", display: "flex", height: "100vh", background: "#f8fafc", color: "#1e293b" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Sidebar */}
        <div style={{ width: 220, background: "linear-gradient(180deg, #0f172a, #1e293b)", color: "#fff", padding: "20px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Fiks Logo */}
          <div style={{ marginBottom: 16, padding: "0 4px" }}>
            {fiksLogo ? (
              <div style={{ position: "relative" }}>
                <img src={fiksLogo} alt="Fiks Logo" style={{ width: "100%", maxHeight: 50, objectFit: "contain", display: "block" }} />
                <button onClick={() => { setFiksLogo(null); localStorage.removeItem("fiks_crm_logo"); }}
                  title={t.removeLogo}
                  style={{ position: "absolute", top: -6, [isRtl ? "left" : "right"]: -6, background: "#ef4444", border: "none", borderRadius: "50%", width: 18, height: 18, color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            ) : (
              <div onClick={() => fiksLogoRef.current.click()}
                style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: 10, textAlign: "center", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                📷 {t.uploadLogo}
              </div>
            )}
            <input ref={fiksLogoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFiksLogo} />
          </div>

          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", marginBottom: 2 }}>
            <span style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⬡</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{t.appName}</span>
          </div>
          <div style={{ fontSize: 10, color: "#64748b", padding: "0 4px", marginBottom: 28 }}>{t.subtitle}</div>

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {sideItems.map((item) => (
              <button key={item.key} onClick={() => setView(item.key)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: view === item.key ? 600 : 400, background: view === item.key ? "rgba(99,102,241,0.2)" : "transparent", color: view === item.key ? "#a5b4fc" : "#94a3b8", width: "100%", textAlign: isRtl ? "right" : "left", flexDirection: isRtl ? "row-reverse" : "row" }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          {/* DB Status */}
          <div style={{ padding: "8px 12px", marginBottom: 8, fontSize: 11, display: "flex", alignItems: "center", gap: 6, color: dbStatus === "connected" ? "#4ade80" : "#f87171" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: dbStatus === "connected" ? "#4ade80" : "#f87171" }} />
            {dbStatus === "connected" ? t.dbConnected : t.dbError}
          </div>

          {/* Language Selector */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowLangMenu(!showLangMenu)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, background: "rgba(255,255,255,0.05)", color: "#94a3b8", width: "100%", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{LANG_FLAGS[lang]}</span>
                {LANG_NAMES[lang]}
              </span>
              <span style={{ fontSize: 10 }}>▾</span>
            </button>
            {showLangMenu && (
              <div style={{ position: "absolute", bottom: "100%", [isRtl ? "right" : "left"]: 0, width: "100%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, marginBottom: 4, overflow: "hidden", zIndex: 100 }}>
                {Object.keys(translations).map((lk) => (
                  <button key={lk} onClick={() => { setLang(lk); setShowLangMenu(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", width: "100%", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, background: lang === lk ? "rgba(99,102,241,0.2)" : "transparent", color: lang === lk ? "#a5b4fc" : "#94a3b8" }}
                    onMouseEnter={(e) => { if (lang !== lk) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (lang !== lk) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ fontSize: 16 }}>{LANG_FLAGS[lk]}</span>
                    {LANG_NAMES[lk]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
          {view === "dashboard" && renderDashboard()}
          {view === "list" && renderList()}
          {view === "pipeline" && renderPipeline()}
          {view === "customers" && renderCustomers()}
        </div>

        {/* Modals */}
        {renderProjectDetail()}
        {renderCustomerDetail()}
        {renderForm()}
        {renderCustomerForm()}
      </div>
    </LangContext.Provider>
  );
}
