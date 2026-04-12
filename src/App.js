import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Fiks CRM — Full Featured App ─── */

// ─── MOCK DATA ───
const CUSTOMERS = [
  { id: 1, name: "SAKA Group", logo: "SKG", color: "#6366f1" },
  { id: 2, name: "Akdeniz Chemson", logo: "AC", color: "#f59e0b" },
  { id: 3, name: "Abdioğulları Plastik ve Ambalaj Sanayi A.Ş.", logo: "AB", color: "#8b5cf6" },
  { id: 4, name: "Oyak Dijital A.Ş.", logo: "OD", color: "#ef4444" },
  { id: 5, name: "KoçSistem Bilgi ve İletişim Hizmetleri A.Ş.", logo: "KS", color: "#ec4899" },
  { id: 6, name: "Oyak Pazarlama Hizmet ve Turizm A.Ş.", logo: "OP", color: "#14b8a6" },
  { id: 7, name: "Yıldız Entegre Ağaç San. ve Tic. A.Ş.", logo: "YE", color: "#3b82f6" },
  { id: 8, name: "EREĞLİ DEMİR VE ÇELİK FABRİKALARI T.A.Ş.", logo: "ER", color: "#64748b" },
  { id: 9, name: "İzocam Ticaret ve Sanayi A.Ş.", logo: "İZ", color: "#22c55e" },
  { id: 10, name: "BORUSAN MAKİNA VE GÜÇ SİSTEMLERİ SAN. VE TİC. A.Ş.", logo: "BR", color: "#0ea5e9" },
  { id: 11, name: "Defacto Perakende Ticaret A.Ş.", logo: "DF", color: "#a855f7" },
  { id: 12, name: "ASAŞ Alüminyum Sanayi ve Ticaret A.Ş.", logo: "AS", color: "#10b981" },
  { id: 13, name: "Norm Digital A.Ş.", logo: "ND", color: "#f97316" },
  { id: 14, name: "Erdemir Çelik Servir Merkezi A.Ş. (ERSEM)", logo: "ES", color: "#06b6d4" },
  { id: 15, name: "VAKKO Tekstil ve Hazır Giyim Sanayi İşletmeleri A.Ş.", logo: "VK", color: "#1e293b" },
  { id: 16, name: "Solenis Kimya San. ve Tic. A.Ş.", logo: "SL", color: "#84cc16" },
  { id: 17, name: "Almatis GmbH", logo: "AL", color: "#7c3aed" },
];

const STATUSES = {
  Lead: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", label: "Lead" },
  Teklif: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Teklif" },
  Müzakere: { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", label: "Müzakere" },
  Kazanıldı: { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", label: "Kazanıldı" },
  Kaybedildi: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Kaybedildi" },
  Beklemede: { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", label: "Beklemede" },
};

const PRIORITIES = { Yüksek: { color: "#ef4444", icon: "▲" }, Orta: { color: "#f59e0b", icon: "●" }, Düşük: { color: "#22c55e", icon: "▼" } };

const INITIAL_PROJECTS = [
  { id: 1, customerId: 7, name: "SAKA Group S4/Hana Projesi", contact: "Selahattin SAKA", amount: 600000, currency: "EUR", date: "2026-05-01", status: "Lead", priority: "Yüksek", probability: 70, action: null },
  { id: 2, customerId: 8, name: "PP Modül & Ariba Entegrasyonu", contact: "Hülya Yakışır", amount: 1900000, currency: "EUR", date: "2026-04-15", status: "Teklif", priority: "Yüksek", probability: 35, action: null },
  { id: 3, customerId: 9, name: "İthalat-İhracat Paketi", contact: "Caner Kabahasanoğlu", amount: 25000, currency: "EUR", date: "2026-04-06", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 4, customerId: 4, name: "Seyahat ve Masaraf Yönetimi", contact: "Dilek Kaya", amount: 4750000, currency: "TRY", date: "2026-04-06", status: "Teklif", priority: "Yüksek", probability: 70, action: { text: "Durum Sorgulanacak", date: "2026-04-13" } },
  { id: 5, customerId: 5, name: "SAP Framework Upgrade (JDK 21.9 & Spring Geçiş Projesi)", contact: "Volkan BENTEŞEN", amount: 420000, currency: "TRY", date: "2026-04-06", status: "Müzakere", priority: "Orta", probability: 80, action: null },
  { id: 6, customerId: 6, name: "Kıbrıs Bordro Migrasyon", contact: "Yasemin Yüce", amount: 28875, currency: "EUR", date: "2026-04-06", status: "Teklif", priority: "Yüksek", probability: 70, action: { text: "Teklif durum sorgulama", date: "2026-03-15" } },
  { id: 7, customerId: 1, name: "OpetFuchs Kârlılık Analiz Modeli Kurulum", contact: "Semiye Koca", amount: 489000, currency: "TRY", date: "2026-04-02", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 8, customerId: 7, name: "SAKA GROUP SAP S/4HANA RFP Süreç Kapsamı Danışmanlık Teklifi", contact: "Selahattin Saka", amount: 23000, currency: "EUR", date: "2026-04-01", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 9, customerId: 10, name: "Norm Fasteners Morocco SAP Roll-out Projesi", contact: "Serap Hasgüçmen Tarakçı", amount: 5218600, currency: "TRY", date: "2026-03-26", status: "Kazanıldı", priority: "Yüksek", probability: 80, action: null },
  { id: 10, customerId: 11, name: "SAP Modül Destek Teklifi", contact: "Esra Çırık", amount: 18000, currency: "TRY", date: "2026-03-26", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 11, customerId: 12, name: "Devops Hizmeti", contact: "Mehmet Yılmaz", amount: 840000, currency: "TRY", date: "2026-03-20", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 12, customerId: 3, name: "S/4HANA Projesi", contact: "Ali Demir", amount: 800000, currency: "EUR", date: "2026-03-15", status: "Lead", priority: "Yüksek", probability: 50, action: null },
  { id: 13, customerId: 14, name: "ERSEM T&M SAP Modül Destek", contact: "Ayşe Kara", amount: 3000000, currency: "TRY", date: "2026-03-10", status: "Müzakere", priority: "Yüksek", probability: 80, action: { text: "Onay bekleniyor.", date: "2026-03-24" } },
  { id: 14, customerId: 2, name: "PP Modül & Ariba Entegrasyonu", contact: "Mehmet Özkan", amount: 1900000, currency: "EUR", date: "2026-03-05", status: "Teklif", priority: "Yüksek", probability: 35, action: { text: "İhale Daveti Beklenecek", date: "2026-03-18" } },
  { id: 15, customerId: 15, name: "VAKKO SAP CX Danışmanlık", contact: "Zeynep Aydın", amount: 1250000, currency: "TRY", date: "2026-02-28", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 16, customerId: 16, name: "Solenis MSA Destek Hizmeti", contact: "Burak Çelik", amount: 780000, currency: "TRY", date: "2026-02-20", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 17, customerId: 17, name: "BW→Datasphere Migrasyon", contact: "Hans Müller", amount: 254700, currency: "EUR", date: "2026-02-15", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 18, customerId: 13, name: "Norm Fasteners Morocco SAP Roll-out Projesi", contact: "Serap Hasgüçmen Tarakçı", amount: 5218600, currency: "TRY", date: "2026-02-10", status: "Kazanıldı", priority: "Yüksek", probability: 80, action: null },
  { id: 19, customerId: 6, name: "Devops Hizmeti", contact: "Yasemin Yüce", amount: 840000, currency: "TRY", date: "2026-02-05", status: "Kazanıldı", priority: "Yüksek", probability: 100, action: null },
  { id: 20, customerId: 9, name: "İzocam Kayseri Fabrika S/4HANA", contact: "Caner Kabahasanoğlu", amount: 350000, currency: "TRY", date: "2026-01-28", status: "Kaybedildi", priority: "Yüksek", probability: 0, action: null },
];

// ─── i18n ───
const TRANSLATIONS = {
  tr: {
    dashboard: "Dashboard", customers: "Müşteriler", projects: "Projeler", pipeline: "Pipeline",
    total: "TOPLAM", customer: "MÜŞTERİ", won: "KAZANILAN", winRate: "WİN RATE",
    project: "Proje", registered: "Kayıtlı", wonProjects: "proje", wonClosed: "Won/Closed",
    statusDist: "Durum Dağılımı", upcomingActions: "Yaklaşan Aksiyonlar",
    totalPipeline: "Toplam Pipeline", weighted: "Ağırlıklı",
    newProject: "+ Yeni Proje", newCustomer: "+ Yeni Müşteri",
    search: "Ara...", allStatuses: "Tüm Durumlar", allPriorities: "Tüm Öncelikler",
    customerCol: "MÜŞTERİ", projectCol: "PROJE", contactCol: "BİRİNCİL KONTAK", amountCol: "TUTAR",
    dateCol: "TARİH", statusCol: "DURUM", priorityCol: "ÖNCELİK", actionCol: "İŞLEM",
    Lead: "Lead", Teklif: "Teklif", Müzakere: "Müzakere", Kazanıldı: "Kazanıldı", Kaybedildi: "Kaybedildi", Beklemede: "Beklemede",
    // 5 tabs
    headerInfo: "Başlık Bilgileri", addressDetail: "Adres Detay", contactDetail: "Kişi Detay",
    activities: "Aktiviteler", salesDocs: "Satış Belgeleri",
    // Başlık Bilgileri fields
    custNumber: "Müşteri Numarası", custExtNumber: "Müşteri Harici Numarası",
    custRole: "Müşteri Rolü", custRolePotential: "Potansiyel Müşteri", custRoleReal: "Gerçek Müşteri",
    name1: "Ad", name2: "Ad1", name3: "Ad2", name4: "Ad3", name5: "Ad4",
    custType: "Müşteri Tipi", custTypeIndividual: "Bireysel Müşteri", custTypeCorporate: "Kurumsal Müşteri",
    createdDate: "Oluşturma Tarihi", modifiedDate: "Değişiklik Tarihi",
    status: "Durum", statusActive: "Aktif", statusBlocked: "Engellenmiş", statusInactive: "Kullanımdışı",
    taxOffice: "Vergi Dairesi", taxNumber: "Vergi Numarası",
    responsibleEmployee: "Sorumlu Çalışan", createdBy: "Oluşturan",
    // Adres Detay fields
    address: "Adres", country: "Ülke", city: "İl", district: "İlçe", neighborhood: "Semt",
    quarter: "Mahalle", postalCode: "Posta Kodu", phone: "Telefon", mobile: "Cep Telefonu",
    email: "E-posta", invoiceAddress: "Fatura Adresi", shippingAddress: "Sevk Adresi",
    // Kişi Detay fields
    contactPerson: "İlgili Kişi", firstName: "Ad", lastName: "Soyad",
    position: "Pozisyon", relatedCustomer: "Müşteri",
    // Aktiviteler
    activityDate: "Tarih", activityType: "Tip", activityNote: "Not", addActivity: "Aktivite Ekle",
    actMeeting: "Toplantı", actCall: "Arama", actEmail: "E-posta", actVisit: "Ziyaret", actOther: "Diğer",
    // Satış Belgeleri
    docNumber: "Belge No", docType: "Belge Tipi", docDate: "Tarih", docAmount: "Tutar",
    changeHistory: "Değişiklik Tarihçesi",
    // Genel
    sector: "Sektör", website: "Web Sitesi",
    save: "Kaydet", cancel: "İptal", edit: "Düzenle", delete: "Sil", addContact: "Kişi Ekle",
    back: "Geri", high: "Yüksek", medium: "Orta", low: "Düşük",
    noActivities: "Henüz aktivite yok", noSalesDocs: "Henüz satış belgesi yok",
  },
  en: {
    dashboard: "Dashboard", customers: "Customers", projects: "Projects", pipeline: "Pipeline",
    total: "TOTAL", customer: "CUSTOMER", won: "WON", winRate: "WIN RATE",
    project: "Project", registered: "Registered", wonProjects: "projects", wonClosed: "Won/Closed",
    statusDist: "Status Distribution", upcomingActions: "Upcoming Actions",
    totalPipeline: "Total Pipeline", weighted: "Weighted",
    newProject: "+ New Project", newCustomer: "+ New Customer",
    search: "Search...", allStatuses: "All Statuses", allPriorities: "All Priorities",
    customerCol: "CUSTOMER", projectCol: "PROJECT", contactCol: "PRIMARY CONTACT", amountCol: "AMOUNT",
    dateCol: "DATE", statusCol: "STATUS", priorityCol: "PRIORITY", actionCol: "ACTION",
    Lead: "Lead", Teklif: "Proposal", Müzakere: "Negotiation", Kazanıldı: "Won", Kaybedildi: "Lost", Beklemede: "On Hold",
    headerInfo: "Header Info", addressDetail: "Address Detail", contactDetail: "Contact Detail",
    activities: "Activities", salesDocs: "Sales Documents",
    custNumber: "Customer Number", custExtNumber: "External Number",
    custRole: "Customer Role", custRolePotential: "Potential Customer", custRoleReal: "Actual Customer",
    name1: "Name", name2: "Name 1", name3: "Name 2", name4: "Name 3", name5: "Name 4",
    custType: "Customer Type", custTypeIndividual: "Individual", custTypeCorporate: "Corporate",
    createdDate: "Created Date", modifiedDate: "Modified Date",
    status: "Status", statusActive: "Active", statusBlocked: "Blocked", statusInactive: "Inactive",
    taxOffice: "Tax Office", taxNumber: "Tax Number",
    responsibleEmployee: "Responsible Employee", createdBy: "Created By",
    address: "Address", country: "Country", city: "City", district: "District", neighborhood: "Neighborhood",
    quarter: "Quarter", postalCode: "Postal Code", phone: "Phone", mobile: "Mobile Phone",
    email: "Email", invoiceAddress: "Invoice Address", shippingAddress: "Shipping Address",
    contactPerson: "Contact Person", firstName: "First Name", lastName: "Last Name",
    position: "Position", relatedCustomer: "Customer",
    activityDate: "Date", activityType: "Type", activityNote: "Note", addActivity: "Add Activity",
    actMeeting: "Meeting", actCall: "Call", actEmail: "Email", actVisit: "Visit", actOther: "Other",
    docNumber: "Doc No", docType: "Doc Type", docDate: "Date", docAmount: "Amount",
    changeHistory: "Change History",
    sector: "Sector", website: "Website",
    save: "Save", cancel: "Cancel", edit: "Edit", delete: "Delete", addContact: "Add Contact",
    back: "Back", high: "High", medium: "Medium", low: "Low",
    noActivities: "No activities yet", noSalesDocs: "No sales documents yet",
  },
  ar: {
    dashboard: "لوحة القيادة", customers: "العملاء", projects: "المشاريع", pipeline: "خط الأنابيب",
    total: "المجموع", customer: "العميل", won: "فاز", winRate: "نسبة الفوز",
    project: "مشروع", registered: "مسجل", wonProjects: "مشاريع", wonClosed: "فاز/مغلق",
    statusDist: "توزيع الحالة", upcomingActions: "الإجراءات القادمة",
    totalPipeline: "إجمالي خط الأنابيب", weighted: "مرجح",
    newProject: "+ مشروع جديد", newCustomer: "+ عميل جديد",
    search: "بحث...", allStatuses: "جميع الحالات", allPriorities: "جميع الأولويات",
    customerCol: "العميل", projectCol: "المشروع", contactCol: "جهة الاتصال", amountCol: "المبلغ",
    dateCol: "التاريخ", statusCol: "الحالة", priorityCol: "الأولوية", actionCol: "الإجراء",
    Lead: "محتمل", Teklif: "عرض", Müzakere: "تفاوض", Kazanıldı: "فاز", Kaybedildi: "خسر", Beklemede: "معلق",
    headerInfo: "معلومات الرأس", addressDetail: "تفاصيل العنوان", contactDetail: "تفاصيل الاتصال",
    activities: "الأنشطة", salesDocs: "مستندات المبيعات",
    custNumber: "رقم العميل", custExtNumber: "الرقم الخارجي",
    custRole: "دور العميل", custRolePotential: "عميل محتمل", custRoleReal: "عميل فعلي",
    name1: "الاسم", name2: "الاسم 1", name3: "الاسم 2", name4: "الاسم 3", name5: "الاسم 4",
    custType: "نوع العميل", custTypeIndividual: "فردي", custTypeCorporate: "شركة",
    createdDate: "تاريخ الإنشاء", modifiedDate: "تاريخ التعديل",
    status: "الحالة", statusActive: "نشط", statusBlocked: "محظور", statusInactive: "غير نشط",
    taxOffice: "مكتب الضريبة", taxNumber: "الرقم الضريبي",
    responsibleEmployee: "الموظف المسؤول", createdBy: "أنشأه",
    address: "العنوان", country: "البلد", city: "المدينة", district: "المنطقة", neighborhood: "الحي",
    quarter: "المحلة", postalCode: "الرمز البريدي", phone: "الهاتف", mobile: "الجوال",
    email: "البريد الإلكتروني", invoiceAddress: "عنوان الفاتورة", shippingAddress: "عنوان الشحن",
    contactPerson: "جهة الاتصال", firstName: "الاسم", lastName: "اللقب",
    position: "المنصب", relatedCustomer: "العميل",
    activityDate: "التاريخ", activityType: "النوع", activityNote: "ملاحظة", addActivity: "إضافة نشاط",
    actMeeting: "اجتماع", actCall: "مكالمة", actEmail: "بريد", actVisit: "زيارة", actOther: "أخرى",
    docNumber: "رقم المستند", docType: "نوع المستند", docDate: "التاريخ", docAmount: "المبلغ",
    changeHistory: "سجل التغييرات",
    sector: "القطاع", website: "الموقع",
    save: "حفظ", cancel: "إلغاء", edit: "تعديل", delete: "حذف", addContact: "إضافة جهة اتصال",
    back: "رجوع", high: "عالي", medium: "متوسط", low: "منخفض",
    noActivities: "لا توجد أنشطة بعد", noSalesDocs: "لا توجد مستندات بعد",
  },
};

// ─── HELPERS ───
const formatCurrency = (amount, currency) => {
  if (currency === "EUR") return `€${amount.toLocaleString("tr-TR")}`;
  return `₺${amount.toLocaleString("tr-TR")}`;
};

const EUR_TO_TRY = 38.5;
const toTRY = (amount, currency) => currency === "EUR" ? amount * EUR_TO_TRY : amount;

const getCustomer = (id) => CUSTOMERS.find(c => c.id === id) || { name: "?", logo: "?", color: "#666" };

// ─── FIKS LOGO SVG ───
const FiksLogo = ({ white }) => (
  <svg viewBox="0 0 400 120" style={{ height: 32, width: "auto" }}>
    <g fill={white ? "#fff" : "#1a1f4e"}>
      <polygon points="0,60 45,20 45,45 80,15 80,60 45,90 45,65 0,95" />
      <path d="M110,30h25v8h-16v12h14v8h-14v22h-9V30z" />
      <rect x="150" y="30" width="9" height="50" rx="2" />
      <circle cx="154.5" cy="22" r="5.5" />
      <path d="M180,30h9v18h.2L204,30h11l-17,20 18,30h-11l-13-22h-.2v22h-9V30z" style={{letterSpacing:1}} />
      <path d="M232,56c1,5,5,8,11,8,5,0,8-2,8-5,0-4-4-5-10-6-8-2-15-4-15-13,0-8,7-12,16-12s15,4,17,12h-9c-1-4-4-6-8-6s-7,2-7,5c0,3,3,4,9,5,8,2,16,4,16,14,0,9-7,14-17,14-11,0-18-5-19-14h8z" />
    </g>
  </svg>
);

// ─── CUSTOMER AVATAR ───
const Avatar = ({ customer, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: 8, background: customer.color + "18",
    color: customer.color, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${customer.color}30`,
  }}>
    {customer.logo}
  </div>
);

// ─── STYLES ───
const styles = {
  app: { display: "flex", height: "100vh", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#f5f6fa", color: "#1e293b", fontSize: 14, overflow: "hidden" },
  sidebar: {
    width: 220, minWidth: 220, background: "linear-gradient(180deg, #111827 0%, #1a1f4e 100%)",
    color: "#fff", display: "flex", flexDirection: "column", position: "relative", zIndex: 20,
    transition: "transform .3s ease",
  },
  sidebarMobile: { position: "fixed", top: 0, left: 0, height: "100%", transform: "translateX(-100%)" },
  sidebarOpen: { transform: "translateX(0)" },
  sidebarLogo: { padding: "20px 20px 8px", display: "flex", alignItems: "center", gap: 10 },
  sidebarLabel: { padding: "4px 24px 20px", fontSize: 11, color: "#94a3b8", letterSpacing: 1, fontWeight: 500 },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", margin: "2px 10px",
    borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: active ? 600 : 400,
    background: active ? "rgba(255,255,255,.12)" : "transparent",
    color: active ? "#fff" : "#94a3b8", transition: "all .15s",
  }),
  navIcon: { fontSize: 18, width: 24, textAlign: "center" },
  pipelineTotal: {
    padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.08)", marginTop: "auto",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px",
    background: "#fff", borderBottom: "1px solid #e5e7eb", flexShrink: 0, gap: 12,
  },
  content: { flex: 1, overflow: "auto", padding: 24 },
  card: {
    background: "#fff", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,.06)", padding: 20,
  },
  btn: (color = "#3b82f6") => ({
    background: color, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px",
    cursor: "pointer", fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6,
  }),
};

// ─── ICONS ───
const Icons = {
  dashboard: "◉", customers: "👥", projects: "≡", pipeline: "▊",
  menu: "☰", close: "✕", lang: "🌐", edit: "✎", del: "✕", back: "←",
};

// ─── DASHBOARD ───
function Dashboard({ projects, t, setPage, setStatusFilter, setSelectedCustomer }) {
  const totalProjects = projects.length;
  const uniqueCustomers = new Set(projects.map(p => p.customerId)).size;
  const wonProjects = projects.filter(p => p.status === "Kazanıldı");
  const closedProjects = projects.filter(p => p.status === "Kazanıldı" || p.status === "Kaybedildi");
  const wonAmount = wonProjects.reduce((s, p) => s + toTRY(p.amount, p.currency), 0);
  const winRate = closedProjects.length > 0 ? Math.round((wonProjects.length / closedProjects.length) * 100) : 0;

  const statusGroups = {};
  Object.keys(STATUSES).forEach(s => {
    const ps = projects.filter(p => p.status === s);
    statusGroups[s] = { count: ps.length, amount: ps.reduce((a, p) => a + toTRY(p.amount, p.currency), 0) };
  });

  const upcomingActions = projects.filter(p => p.action).sort((a, b) => new Date(a.action.date) - new Date(b.action.date));

  const handleStatusClick = (status) => {
    setStatusFilter(status);
    setPage("pipeline");
  };

  const kpiCards = [
    { label: t.total, value: totalProjects, sub: t.project, color: "#3b82f6", icon: "📊", onClick: () => setPage("projects") },
    { label: t.customer, value: uniqueCustomers, sub: t.registered, color: "#8b5cf6", icon: "👥", onClick: () => setPage("customers") },
    { label: t.won, value: `₺${(wonAmount / 1000).toFixed(0)}K`, sub: `${wonProjects.length} ${t.wonProjects}`, color: "#22c55e", icon: "🏆", onClick: () => handleStatusClick("Kazanıldı") },
    { label: t.winRate, value: `%${winRate}`, sub: t.wonClosed, color: "#f59e0b", icon: "📈", onClick: () => setPage("projects") },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {kpiCards.map((k, i) => (
          <div key={i} onClick={k.onClick} style={{
            ...styles.card, borderTop: `3px solid ${k.color}`, position: "relative", overflow: "hidden",
            cursor: "pointer", transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.06)"; }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: k.color, marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1e293b" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{k.sub}</div>
            <div style={{ position: "absolute", right: 16, top: 16, fontSize: 28, opacity: .15 }}>{k.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.card, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>{t.statusDist}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {Object.entries(STATUSES).map(([key, s]) => (
            <div key={key} onClick={() => handleStatusClick(key)} style={{
              background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: 16,
              cursor: "pointer", transition: "transform .15s, box-shadow .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{statusGroups[key]?.count || 0}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{t[key]}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>₺{((statusGroups[key]?.amount || 0) / 1000).toFixed(0)}K</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>{t.upcomingActions}</h3>
        {upcomingActions.length === 0 ? (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>—</div>
        ) : upcomingActions.map(p => {
          const cust = getCustomer(p.customerId);
          return (
            <div key={p.id} onClick={() => { setSelectedCustomer(getCustomer(p.customerId)); setPage("customerDetail"); }} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
              borderBottom: "1px solid #f1f5f9", cursor: "pointer", borderRadius: 8,
              transition: "background .1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
            >
              <Avatar customer={cust} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.action.text}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cust.name}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(p.action.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: PRIORITIES[p.priority]?.color }}>
                  {PRIORITIES[p.priority]?.icon} {p.priority}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROJECTS TABLE ───
function ProjectsTable({ projects, t, setPage, setSelectedCustomer }) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");

  const filtered = projects.filter(p => {
    const cust = getCustomer(p.customerId);
    const matchSearch = !search || cust.name.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusF || p.status === statusF;
    const matchPriority = !priorityF || p.priority === priorityF;
    return matchSearch && matchStatus && matchPriority;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
          style={{ flex: 1, minWidth: 200, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none" }} />
        <select value={statusF} onChange={e => setStatusF(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff", minWidth: 140 }}>
          <option value="">{t.allStatuses}</option>
          {Object.keys(STATUSES).map(s => <option key={s} value={s}>{t[s]}</option>)}
        </select>
        <select value={priorityF} onChange={e => setPriorityF(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff", minWidth: 140 }}>
          <option value="">{t.allPriorities}</option>
          <option value="Yüksek">{t.high}</option>
          <option value="Orta">{t.medium}</option>
          <option value="Düşük">{t.low}</option>
        </select>
      </div>

      <div style={{ ...styles.card, padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
              {[t.customerCol, t.projectCol, t.contactCol, t.amountCol, t.dateCol, t.statusCol, t.priorityCol, t.actionCol].map((h, i) => (
                <th key={i} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: .5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const cust = getCustomer(p.customerId);
              const s = STATUSES[p.status];
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer", transition: "background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}
                      onClick={() => { setSelectedCustomer(cust); setPage("customerDetail"); }}>
                      <Avatar customer={cust} size={34} />
                      <span style={{ fontWeight: 500, fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cust.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{p.contact}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{new Date(p.date).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    }}>{t[p.status]}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: PRIORITIES[p.priority]?.color }}>
                      {PRIORITIES[p.priority]?.icon} {p.priority}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}>✎</button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#fca5a5" }}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PIPELINE (KANBAN) ───
function Pipeline({ projects, setProjects, t, statusFilter }) {
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const scrollRefs = useRef({});

  const columns = ["Lead", "Teklif", "Müzakere", "Kazanıldı", "Kaybedildi", "Beklemede"];
  const displayColumns = statusFilter ? columns.filter(c => c === statusFilter) : columns;

  const handleDragStart = (e, projectId) => {
    setDragItem(projectId);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, status) => { e.preventDefault(); setDragOver(status); };
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (dragItem) {
      setProjects(prev => prev.map(p => p.id === dragItem ? { ...p, status: newStatus, probability: newStatus === "Kazanıldı" ? 100 : newStatus === "Kaybedildi" ? 0 : p.probability } : p));
    }
    setDragItem(null);
    setDragOver(null);
  };

  // Touch drag support
  const [touchDrag, setTouchDrag] = useState(null);

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 160px)", overflow: "auto", paddingBottom: 20 }}>
      {displayColumns.map(status => {
        const s = STATUSES[status];
        const col = projects.filter(p => p.status === status);
        const colAmount = col.reduce((a, p) => a + toTRY(p.amount, p.currency), 0);
        return (
          <div key={status}
            onDragOver={e => handleDragOver(e, status)}
            onDrop={e => handleDrop(e, status)}
            style={{
              minWidth: 280, maxWidth: 320, flex: "0 0 280px", display: "flex", flexDirection: "column",
              background: dragOver === status ? s.bg : "#f8fafc", borderRadius: 14, transition: "background .2s",
              border: dragOver === status ? `2px dashed ${s.color}` : "2px solid transparent",
            }}>
            <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{t[status]}</span>
                <span style={{
                  background: s.color + "20", color: s.color, fontSize: 12, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 10,
                }}>{col.length}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>₺{(colAmount / 1000).toFixed(0)}K</div>
            </div>
            <div ref={el => scrollRefs.current[status] = el}
              style={{ flex: 1, overflow: "auto", padding: "0 12px 12px", minHeight: 0 }}>
              {col.sort((a, b) => b.amount - a.amount).map(p => {
                const cust = getCustomer(p.customerId);
                return (
                  <div key={p.id} draggable
                    onDragStart={e => handleDragStart(e, p.id)}
                    style={{
                      background: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
                      boxShadow: dragItem === p.id ? "0 8px 24px rgba(0,0,0,.15)" : "0 1px 3px rgba(0,0,0,.06)",
                      cursor: "grab", transition: "box-shadow .2s, transform .15s",
                      opacity: dragItem === p.id ? .6 : 1,
                      border: "1px solid #f1f5f9",
                    }}
                    onMouseEnter={e => { if (dragItem !== p.id) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; }}
                    onMouseLeave={e => { if (dragItem !== p.id) e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.06)"; }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{cust.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: p.currency === "EUR" ? "#3b82f6" : "#1e293b" }}>{formatCurrency(p.amount, p.currency)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITIES[p.priority]?.color }}>
                        {PRIORITIES[p.priority]?.icon} {p.priority}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          width: `${p.probability}%`, height: "100%", borderRadius: 3,
                          background: p.probability >= 80 ? "#22c55e" : p.probability >= 50 ? "#f59e0b" : "#ef4444",
                          transition: "width .4s",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>%{p.probability}</span>
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
}

// ─── CUSTOMERS LIST ───
function CustomersList({ t, setPage, setSelectedCustomer, projects }) {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
        style={{ width: "100%", maxWidth: 400, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map(c => {
          const custProjects = projects.filter(p => p.customerId === c.id);
          const totalVal = custProjects.reduce((a, p) => a + toTRY(p.amount, p.currency), 0);
          return (
            <div key={c.id} onClick={() => { setSelectedCustomer(c); setPage("customerDetail"); }}
              style={{ ...styles.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "box-shadow .15s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.06)"}
            >
              <Avatar customer={c} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{custProjects.length} {t.project} · ₺{(totalVal / 1000).toFixed(0)}K</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CUSTOMER DETAIL (SAP BP FORM — 5 TABS) ───
function CustomerDetail({ customer, t, setPage, projects }) {
  const [tab, setTab] = useState(0);
  const [contacts, setContacts] = useState([{ id: 1, firstName: "", lastName: "", position: "", phone: "", email: "" }]);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({ type: "actMeeting", note: "", date: new Date().toISOString().split("T")[0] });
  const tabs = [t.headerInfo, t.addressDetail, t.contactDetail, t.activities, t.salesDocs];
  const custProjects = projects.filter(p => p.customerId === customer.id);

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
    fontSize: 14, outline: "none", background: "#f9fafb", transition: "border-color .15s",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "block" };
  const fieldGroup = { marginBottom: 14 };
  const sectionTitle = (text) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", marginBottom: 12, marginTop: 8, paddingBottom: 6, borderBottom: "1px solid #eff6ff" }}>{text}</div>
  );

  const addContact = () => setContacts(prev => [...prev, { id: Date.now(), firstName: "", lastName: "", position: "", phone: "", email: "" }]);
  const removeContact = (id) => setContacts(prev => prev.filter(c => c.id !== id));

  const addActivityEntry = () => {
    if (!newActivity.note.trim()) return;
    setActivities(prev => [{ id: Date.now(), ...newActivity }, ...prev]);
    setNewActivity({ type: "actMeeting", note: "", date: new Date().toISOString().split("T")[0] });
  };

  return (
    <div>
      <button onClick={() => setPage("customers")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#3b82f6", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        {Icons.back} {t.back}
      </button>

      <div style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <Avatar customer={customer} size={56} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{customer.isNew ? (t.newCustomer || "Yeni Müşteri") : customer.name}</h2>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{custProjects.length} {t.project}</div>
          </div>
        </div>

        {/* Tab bar — scrollable on mobile */}
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #f1f5f9", marginBottom: 20, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {tabs.map((tb, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              background: "none", border: "none", padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap",
              fontSize: 13, fontWeight: tab === i ? 700 : 400, color: tab === i ? "#3b82f6" : "#94a3b8",
              borderBottom: tab === i ? "2px solid #3b82f6" : "2px solid transparent", marginBottom: -2, transition: "all .15s",
            }}>{tb}</button>
          ))}
        </div>

        {/* TAB 0: Başlık Bilgileri */}
        {tab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
              <div style={fieldGroup}><label style={labelStyle}>{t.custNumber}</label><input style={inputStyle} defaultValue={customer.isNew ? "" : `M-${1000 + customer.id}`} placeholder="Otomatik" readOnly={!customer.isNew} /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.custExtNumber}</label><input style={inputStyle} placeholder="Harici numara" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.custRole}</label>
                <select style={inputStyle}><option value="potential">{t.custRolePotential}</option><option value="real">{t.custRoleReal}</option></select>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name1}</label><input style={inputStyle} defaultValue={customer.name} placeholder="Ad" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name2}</label><input style={inputStyle} placeholder="Ad1" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name3}</label><input style={inputStyle} placeholder="Ad2" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name4}</label><input style={inputStyle} placeholder="Ad3" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name5}</label><input style={inputStyle} placeholder="Ad4" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.custType}</label>
                <select style={inputStyle}><option value="corporate">{t.custTypeCorporate}</option><option value="individual">{t.custTypeIndividual}</option></select>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>{t.createdDate}</label><input style={inputStyle} type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.modifiedDate}</label><input style={inputStyle} type="date" defaultValue={new Date().toISOString().split("T")[0]} readOnly /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.status}</label>
                <select style={inputStyle}>
                  <option value="active">{t.statusActive}</option>
                  <option value="blocked">{t.statusBlocked}</option>
                  <option value="inactive">{t.statusInactive}</option>
                </select>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>{t.taxOffice}</label><input style={inputStyle} placeholder="Vergi Dairesi" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.taxNumber}</label><input style={inputStyle} placeholder="VKN / TCKN" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.responsibleEmployee}</label><input style={inputStyle} placeholder="Sorumlu kişi" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.createdBy}</label><input style={inputStyle} defaultValue="Erdi Ögetürk" readOnly /></div>
            </div>
          </div>
        )}

        {/* TAB 1: Adres Detay */}
        {tab === 1 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>{t.address}</label><input style={inputStyle} placeholder="Açık adres" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.country}</label><input style={inputStyle} defaultValue="Türkiye" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.city}</label><input style={inputStyle} placeholder="İl" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.district}</label><input style={inputStyle} placeholder="İlçe" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.neighborhood}</label><input style={inputStyle} placeholder="Semt" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.quarter}</label><input style={inputStyle} placeholder="Mahalle" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.postalCode}</label><input style={inputStyle} placeholder="Posta Kodu" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.phone}</label><input style={inputStyle} placeholder="+90" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.mobile}</label><input style={inputStyle} placeholder="+90 5xx" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.email}</label><input style={inputStyle} placeholder="info@firma.com" type="email" /></div>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>{t.invoiceAddress}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Fatura adresi" /></div>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>{t.shippingAddress}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Sevk adresi" /></div>
            </div>
          </div>
        )}

        {/* TAB 2: Kişi Detay */}
        {tab === 2 && (
          <div>
            {contacts.map((c, idx) => (
              <div key={c.id} style={{ marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9", position: "relative" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", marginBottom: 12 }}>{t.contactPerson} {idx + 1}</div>
                {contacts.length > 1 && (
                  <button onClick={() => removeContact(c.id)} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 18 }}>✕</button>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 16px" }}>
                  <div style={fieldGroup}><label style={labelStyle}>{t.firstName}</label><input style={inputStyle} placeholder="Ad" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.lastName}</label><input style={inputStyle} placeholder="Soyad" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.position}</label><input style={inputStyle} placeholder="Pozisyon / Unvan" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.phone}</label><input style={inputStyle} placeholder="+90" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.email}</label><input style={inputStyle} placeholder="email@" type="email" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.relatedCustomer}</label><input style={inputStyle} defaultValue={customer.name} readOnly /></div>
                </div>
              </div>
            ))}
            <button onClick={addContact} style={{ ...styles.btn("#3b82f6"), fontSize: 13 }}>+ {t.addContact}</button>
          </div>
        )}

        {/* TAB 3: Aktiviteler */}
        {tab === 3 && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "0 0 130px" }}>
                <label style={labelStyle}>{t.activityType}</label>
                <select style={inputStyle} value={newActivity.type} onChange={e => setNewActivity(p => ({ ...p, type: e.target.value }))}>
                  <option value="actMeeting">{t.actMeeting}</option>
                  <option value="actCall">{t.actCall}</option>
                  <option value="actEmail">{t.actEmail}</option>
                  <option value="actVisit">{t.actVisit}</option>
                  <option value="actOther">{t.actOther}</option>
                </select>
              </div>
              <div style={{ flex: "0 0 140px" }}>
                <label style={labelStyle}>{t.activityDate}</label>
                <input style={inputStyle} type="date" value={newActivity.date} onChange={e => setNewActivity(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>{t.activityNote}</label>
                <input style={inputStyle} value={newActivity.note} onChange={e => setNewActivity(p => ({ ...p, note: e.target.value }))} placeholder="Not ekle..." onKeyDown={e => e.key === "Enter" && addActivityEntry()} />
              </div>
              <button onClick={addActivityEntry} style={{ ...styles.btn("#3b82f6"), fontSize: 13, height: 42 }}>+ {t.addActivity}</button>
            </div>
            {activities.length === 0 ? (
              <div style={{ color: "#94a3b8", textAlign: "center", padding: 32, fontSize: 14 }}>{t.noActivities}</div>
            ) : (
              <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9" }}>
                {activities.map((a, i) => {
                  const typeColors = { actMeeting: "#8b5cf6", actCall: "#3b82f6", actEmail: "#f59e0b", actVisit: "#22c55e", actOther: "#94a3b8" };
                  return (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[a.type] || "#94a3b8", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#64748b", minWidth: 90 }}>{new Date(a.date).toLocaleDateString("tr-TR")}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: typeColors[a.type], minWidth: 80 }}>{t[a.type]}</span>
                      <span style={{ fontSize: 13, flex: 1 }}>{a.note}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Satış Belgeleri & Değişiklik Tarihçesi */}
        {tab === 4 && (
          <div>
            {sectionTitle(t.salesDocs)}
            {custProjects.length === 0 ? (
              <div style={{ color: "#94a3b8", textAlign: "center", padding: 24, fontSize: 14 }}>{t.noSalesDocs}</div>
            ) : (
              <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9", marginBottom: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 120px 100px", gap: 0, padding: "10px 16px", background: "#f8fafc", fontWeight: 700, fontSize: 11, color: "#94a3b8", letterSpacing: .5 }}>
                  <span>{t.docNumber}</span><span>{t.customerCol}</span><span>{t.projectCol}</span><span>{t.docDate}</span><span>{t.docAmount}</span>
                </div>
                {custProjects.map((p, i) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 120px 100px", gap: 0, padding: "10px 16px", fontSize: 13, borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                    <span style={{ fontWeight: 600, color: "#3b82f6" }}>SB-{1000 + p.id}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getCustomer(p.customerId).name}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ color: "#64748b" }}>{new Date(p.date).toLocaleDateString("tr-TR")}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</span>
                  </div>
                ))}
              </div>
            )}

            {sectionTitle(t.changeHistory)}
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9" }}>
              <div style={{ padding: "12px 16px", fontSize: 13, color: "#64748b", background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>{new Date().toLocaleDateString("tr-TR")} — {t.createdBy}: Erdi Ögetürk</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Kayıt oluşturuldu</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button style={styles.btn("#3b82f6")}>{t.save}</button>
          <button onClick={() => setPage("customers")} style={{ ...styles.btn("#e5e7eb"), color: "#64748b" }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function FiksCRM() {
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState("tr");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const t = TRANSLATIONS[lang];

  const totalPipeline = projects.reduce((a, p) => a + toTRY(p.amount, p.currency), 0);
  const weightedPipeline = projects.reduce((a, p) => a + toTRY(p.amount, p.currency) * (p.probability / 100), 0);

  const navItems = [
    { key: "dashboard", icon: Icons.dashboard, label: t.dashboard },
    { key: "customers", icon: Icons.customers, label: t.customers },
    { key: "projects", icon: Icons.projects, label: t.projects },
    { key: "pipeline", icon: Icons.pipeline, label: t.pipeline },
  ];

  const handleNav = (key) => {
    setPage(key);
    if (key !== "pipeline") setStatusFilter(null);
    if (isMobile) setSidebarOpen(false);
  };

  const pageTitle = page === "customerDetail" ? (selectedCustomer?.name || t.customers)
    : navItems.find(n => n.key === page)?.label || t.dashboard;

  return (
    <div style={styles.app}>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 19 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? styles.sidebarMobile : {}),
        ...(isMobile && sidebarOpen ? styles.sidebarOpen : {}),
      }}>
        <div style={styles.sidebarLogo}>
          <FiksLogo white />
        </div>
        <div style={styles.sidebarLabel}>CRM · Sales Pipeline</div>

        <nav style={{ flex: 1, paddingTop: 4 }}>
          {navItems.map(n => (
            <div key={n.key} onClick={() => handleNav(n.key)} style={styles.navItem(page === n.key || (page === "customerDetail" && n.key === "customers"))}>
              <span style={styles.navIcon}>{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>

        <div style={styles.pipelineTotal}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 4 }}>{t.totalPipeline}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>₺{(totalPipeline / 1000000).toFixed(1)}M</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.weighted}: ₺{(weightedPipeline / 1000000).toFixed(1)}M</div>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4 }}>{Icons.menu}</button>
            )}
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{pageTitle}</h1>
            {page !== "customerDetail" && (
              <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 4 }}>{projects.length} {t.project.toLowerCase()}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, background: "#fff", cursor: "pointer" }}>
              <option value="tr">🇹🇷 TR</option>
              <option value="en">🇬🇧 EN</option>
              <option value="ar">🇸🇦 AR</option>
            </select>
            {page === "projects" && (
              <button style={styles.btn("#3b82f6")}>{t.newProject}</button>
            )}
            {page === "customers" && (
              <button onClick={() => { setSelectedCustomer({ id: Date.now(), name: "", logo: "?", color: "#3b82f6", isNew: true }); setPage("customerDetail"); }} style={styles.btn("#3b82f6")}>{t.newCustomer}</button>
            )}
          </div>
        </div>

        <div style={styles.content}>
          {page === "dashboard" && <Dashboard projects={projects} t={t} setPage={setPage} setStatusFilter={setStatusFilter} setSelectedCustomer={setSelectedCustomer} />}
          {page === "customers" && <CustomersList t={t} setPage={setPage} setSelectedCustomer={setSelectedCustomer} projects={projects} />}
          {page === "projects" && <ProjectsTable projects={projects} t={t} setPage={setPage} setSelectedCustomer={setSelectedCustomer} />}
          {page === "pipeline" && <Pipeline projects={projects} setProjects={setProjects} t={t} statusFilter={statusFilter} />}
          {page === "customerDetail" && selectedCustomer && <CustomerDetail customer={selectedCustomer} t={t} setPage={setPage} projects={projects} />}
        </div>
      </main>
    </div>
  );
}