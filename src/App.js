import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Fiks CRM — Supabase Connected ─── */

// ─── SUPABASE CLIENT ───
const SUPABASE_URL = "https://yevlpkvsqbsxesyuctry.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlldmxwa3ZzcWJzeGVzeXVjdHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MjM4NjAsImV4cCI6MjA4OTM5OTg2MH0.xMXZwphtapRjdItdoFK_pL8QEEYPcjsuwjX_6dYt1AI";

const sb = {
  async query(table, { select = "*", filters, order, eq } = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
    if (eq) Object.entries(eq).forEach(([k, v]) => { url += `&${k}=eq.${encodeURIComponent(v)}`; });
    if (order) url += `&order=${order}`;
    if (filters) url += filters;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async remove(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
  },
};

// ─── CONSTANTS ───

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
    activities: "Aktiviteler", salesDocs: "Teklifler",
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
    activities: "Activities", salesDocs: "Proposals",
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
    activities: "الأنشطة", salesDocs: "العروض",
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

// ─── CONSTANTS ───
const STATUSES = {
  Lead: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", label: "Lead" },
  Teklif: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Teklif" },
  Müzakere: { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", label: "Müzakere" },
  Kazanıldı: { color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", label: "Kazanıldı" },
  Kaybedildi: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Kaybedildi" },
  Beklemede: { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", label: "Beklemede" },
};
const PRIORITIES = { Yüksek: { color: "#ef4444", icon: "▲" }, Orta: { color: "#f59e0b", icon: "●" }, Düşük: { color: "#22c55e", icon: "▼" } };

// ─── HELPERS ───
const formatCurrency = (amount, currency) => {
  const n = Number(amount);
  if (currency === "EUR") return `€${n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  if (currency === "USD") return `$${n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `₺${n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
const formatFullTRY = (amount) => `₺${Number(amount).toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
let EUR_TO_TRY = 38.5;
let USD_TO_TRY = 36.0;
// Güncel kur çekme
const fetchRates = async () => {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/EUR");
    const data = await res.json();
    if (data?.rates?.TRY) EUR_TO_TRY = data.rates.TRY;
    if (data?.rates?.USD) USD_TO_TRY = data.rates.TRY / data.rates.USD;
  } catch (e) { /* fallback sabit kur */ }
};
fetchRates();
const toTRY = (amount, currency) => {
  const n = Number(amount);
  if (currency === "EUR") return n * EUR_TO_TRY;
  if (currency === "USD") return n * USD_TO_TRY;
  return n;
};

// Normalize status/priority from DB (handles missing Turkish chars)
const normalizeStatus = (s) => {
  if (!s) return "Lead";
  const map = { "Kazanildi": "Kazanıldı", "Kaybedildi": "Kaybedildi", "Muzakere": "Müzakere", "Lead": "Lead", "Teklif": "Teklif", "Beklemede": "Beklemede" };
  return map[s] || s;
};
const normalizePriority = (p) => {
  if (!p) return "Yüksek";
  const map = { "Yuksek": "Yüksek", "Orta": "Orta", "Dusuk": "Düşük" };
  return map[p] || p;
};

// Map Supabase project row to internal format
const mapProject = (p, customers) => {
  const cust = customers.find(c => c.id === p.customer_id) || { id: p.customer_id, name: "?", logo_code: "?", color: "#666" };
  return {
    id: p.id, customerId: p.customer_id, name: p.name, contact: p.contact_person,
    amount: Number(p.amount), currency: p.currency, date: p.project_date,
    status: normalizeStatus(p.status), priority: normalizePriority(p.priority), probability: p.probability,
    action: p.action_text ? { text: p.action_text, date: p.action_date } : null,
    _customer: cust,
  };
};
const mapCustomer = (c) => ({ ...c, logo: c.logo_code });

// ─── FIKS LOGO SVG ───
const FiksLogo = ({ white }) => (
  <svg viewBox="0 0 117 40" style={{ height: 36, width: "auto" }} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M11.531 26.6197L18.4465 22.6282L13.8324 19.9634L34.5775 7.9858V0L0 19.9634L11.531 26.6197ZM69.9591 7.75363C69.9591 9.61103 68.4534 11.1169 66.5958 11.1169C64.7383 11.1169 63.2324 9.61103 63.2324 7.75363C63.2324 5.89596 64.7383 4.39013 66.5958 4.39013C68.4534 4.39013 69.9591 5.89596 69.9591 7.75363ZM89.7 13.7437L81.1944 22.3506V4.81542H75.1859V36.1282H81.1944V29.1225L83.2424 27.2056L90.3352 36.1282H97.5704L87.2213 23.4773L97.6128 13.7437H89.7ZM115.763 27.2801C115.538 26.631 115.184 26.0534 114.706 25.5449C114.141 24.9521 113.38 24.4308 112.421 23.9789C111.49 23.528 110.348 23.1182 108.994 22.752C107.951 22.4703 107.118 22.2153 106.497 21.99C105.904 21.7646 105.454 21.5675 105.144 21.3972C105.027 21.3155 104.92 21.2266 104.823 21.1306C104.685 20.9942 104.566 20.8431 104.466 20.6773C104.325 20.3956 104.255 20.0984 104.255 19.7887C104.255 19.4787 104.311 19.1956 104.424 18.9423C104.565 18.6606 104.762 18.4337 105.017 18.2648C105.27 18.0956 105.582 17.969 105.948 17.8844C106.203 17.8296 106.477 17.7927 106.769 17.7734C106.927 17.763 107.091 17.7577 107.259 17.7577C107.796 17.7577 108.401 17.8703 109.079 18.0956C109.756 18.3211 110.404 18.6322 111.025 19.0268C111.675 19.421 112.252 19.8592 112.761 20.3377L115.976 16.7831C115.27 16.0772 114.438 15.4718 113.479 14.9634C112.548 14.4268 111.532 14.0182 110.432 13.7365C109.332 13.4548 108.204 13.314 107.048 13.314C105.892 13.314 104.792 13.4829 103.748 13.8223C102.704 14.1324 101.773 14.5844 100.955 15.1761C100.165 15.7689 99.5451 16.4872 99.093 17.3335C98.6422 18.152 98.4155 19.0689 98.4155 20.0845C98.4155 20.9308 98.5421 21.7069 98.7958 22.4111C99.0775 23.0887 99.4732 23.7225 99.9801 24.3153C100.573 24.9365 101.362 25.4999 102.349 26.0084C103.365 26.4872 104.592 26.911 106.031 27.2775C106.218 27.3283 106.397 27.3787 106.57 27.4284C106.825 27.5017 107.066 27.5737 107.291 27.6446C107.676 27.7661 108.017 27.8835 108.315 27.997C108.908 28.1944 109.345 28.3632 109.627 28.5041C110.134 28.8703 110.389 29.3648 110.389 29.9856C110.389 30.2958 110.318 30.5928 110.177 30.8745C110.065 31.1282 109.882 31.3534 109.627 31.5521C109.373 31.721 109.062 31.8618 108.696 31.9746C108.358 32.059 107.976 32.1014 107.554 32.1014C106.482 32.1014 105.41 31.9042 104.338 31.5083C103.266 31.0858 102.293 30.4082 101.418 29.4773L97.6944 32.6928C98.6817 33.9055 99.9789 34.8646 101.587 35.5703C103.224 36.2477 105.086 36.5859 107.173 36.5859C108.866 36.5859 110.389 36.2901 111.744 35.697C113.097 35.0759 114.155 34.2294 114.917 33.1577C115.707 32.0576 116.101 30.8168 116.101 29.4337C116.101 28.6435 115.989 27.9239 115.763 27.2761V27.2801ZM69.6 13.8985H63.5915V36.283H69.6V13.8985ZM55.0944 10.5056C54.7549 10.6745 54.5014 10.9435 54.3324 11.3097C54.162 11.6492 54.0775 12.0857 54.0775 12.6224V14.3153H58.9014V19.3928H54.0775V36.149H48.0268V19.3928H44.6845V14.3153H48.0268V12.1999C48.0268 10.8167 48.3365 9.56179 48.9577 8.43365C49.5789 7.30551 50.4253 6.4167 51.4972 5.76749C52.597 5.11828 53.8817 4.79424 55.3479 4.79424C56.3351 4.79424 57.2662 4.96479 58.1408 5.30259C59.0155 5.61262 59.762 6.04918 60.3831 6.61394L58.6056 11.014C58.4083 10.8918 58.2066 10.7823 58.0008 10.6852C57.8246 10.6022 57.6453 10.5282 57.4634 10.4633C57.0972 10.2943 56.7576 10.2096 56.4477 10.2096C55.9125 10.2096 55.4606 10.3084 55.0944 10.5056ZM34.5775 31.941V39.9241L13.8324 27.9465L34.5775 15.9692V23.9549L27.6606 27.9465L34.5775 31.941Z" fill={white ? "#ffffff" : "#1A2B67"} />
  </svg>
);

// ─── CUSTOMER AVATAR ───
const Avatar = ({ customer, size = 36 }) => {
  if (customer.logo_url) {
    return <img src={customer.logo_url} alt="" style={{ width: size, height: size, borderRadius: 8, objectFit: "contain", border: `1.5px solid ${(customer.color || "#666")}30`, background: "#fff", flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, background: (customer.color || "#666") + "18",
      color: customer.color || "#666", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${(customer.color || "#666")}30`,
    }}>
      {customer.logo_code || customer.logo || "?"}
    </div>
  );
};

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
function Dashboard({ projects, customers, t, setPage, setStatusFilter, setSelectedCustomer }) {
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
    { label: t.total, value: totalProjects, sub: t.project, color: "#3b82f6", icon: "📊", onClick: () => { setStatusFilter(null); setPage("projects"); } },
    { label: t.customer, value: uniqueCustomers, sub: t.registered, color: "#8b5cf6", icon: "👥", onClick: () => { setStatusFilter(null); setPage("customers"); } },
    { label: t.won, value: formatFullTRY(wonAmount), sub: `${wonProjects.length} ${t.wonProjects}`, color: "#22c55e", icon: "🏆", onClick: () => handleStatusClick("Kazanıldı") },
    { label: t.winRate, value: `%${winRate}`, sub: t.wonClosed, color: "#f59e0b", icon: "📈", onClick: () => { setStatusFilter(null); setPage("projects"); } },
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
            <div style={{ fontSize: typeof k.value === "string" && k.value.length > 10 ? 22 : 32, fontWeight: 800, color: "#1e293b" }}>{k.value}</div>
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
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{formatFullTRY(statusGroups[key]?.amount || 0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>{t.upcomingActions}</h3>
        {upcomingActions.length === 0 ? (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>—</div>
        ) : upcomingActions.map(p => {
          const cust = customers.find(c => c.id === p.customerId) || { name: "?", logo_code: "?", color: "#666" };
          return (
            <div key={p.id} onClick={() => { setSelectedCustomer(customers.find(c => c.id === p.customerId) || { name: "?", logo_code: "?", color: "#666" }); setPage("customerDetail"); }} style={{
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
function ProjectsTable({ projects, customers, t, setPage, setSelectedCustomer, onProjectClick }) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("");
  const [priorityF, setPriorityF] = useState("");

  const filtered = projects.filter(p => {
    const cust = customers.find(c => c.id === p.customerId) || { name: "?", logo_code: "?", color: "#666" };
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
              const cust = customers.find(c => c.id === p.customerId) || { name: "?", logo_code: "?", color: "#666" };
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
                  <td onClick={() => onProjectClick && onProjectClick(p)} style={{ padding: "12px 16px", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", color: "#3b82f6", fontWeight: 500 }}>{p.name}</td>
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
                    <button onClick={() => onProjectClick && onProjectClick(p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#3b82f6" }}>✎</button>
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
function Pipeline({ projects, customers, setProjects, t, statusFilter, onStatusChange, onProjectClick }) {
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const scrollRefs = useRef({});

  const columns = ["Lead", "Teklif", "Müzakere", "Kazanıldı", "Kaybedildi", "Beklemede"];
  const displayColumns = statusFilter ? columns.filter(c => c === statusFilter) : columns;

  const handleDragStart = (e, projectId) => {
    setDragItem(projectId);
    e.dataTransfer.effectAllowed = "move";
    // Mark event so click handler won't fire after drag
    e.currentTarget._wasDragged = true;
    setTimeout(() => { if (e.currentTarget) e.currentTarget._wasDragged = false; }, 300);
  };
  const handleDragOver = (e, status) => { e.preventDefault(); setDragOver(status); };
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (dragItem && onStatusChange) {
      onStatusChange(dragItem, newStatus);
    }
    setDragItem(null);
    setDragOver(null);
  };


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
              <div style={{ fontSize: 12, color: "#64748b" }}>{formatFullTRY(colAmount)}</div>
            </div>
            <div ref={el => scrollRefs.current[status] = el}
              style={{ flex: 1, overflow: "auto", padding: "0 12px 12px", minHeight: 0 }}>
              {col.sort((a, b) => b.amount - a.amount).map(p => {
                const cust = customers.find(c => c.id === p.customerId) || { name: "?", logo_code: "?", color: "#666" };
                return (
                  <div key={p.id} draggable
                    onDragStart={e => handleDragStart(e, p.id)}
                    onClick={(e) => { if (e.currentTarget._wasDragged || dragItem) return; if (onProjectClick) onProjectClick(p); }}
                    style={{
                      background: "#fff", borderRadius: 12, padding: 14, marginBottom: 10,
                      boxShadow: dragItem === p.id ? "0 8px 24px rgba(0,0,0,.15)" : "0 1px 3px rgba(0,0,0,.06)",
                      cursor: "pointer", transition: "box-shadow .2s, transform .15s",
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
function CustomersList({ customers, t, setPage, setSelectedCustomer, projects }) {
  const [search, setSearch] = useState("");
  const filtered = customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

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
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{custProjects.length} {t.project} · {formatFullTRY(totalVal)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROJE / TEKLİF DETAY SAYFASI ───
function ProjectDetail({ project, customers, t, setPage, prevPage, onSave, onDelete }) {
  const isNew = !project?.id;

  const [form, setForm] = useState({
    name: project?.name || "",
    customerId: project?.customerId || (customers[0]?.id || ""),
    contact: project?.contact || "",
    amount: project?.amount || "",
    currency: project?.currency || "TRY",
    date: project?.date || new Date().toISOString().split("T")[0],
    status: project?.status || "Lead",
    priority: project?.priority || "Yüksek",
    probability: project?.probability ?? 50,
    action_text: project?.action?.text || "",
    action_date: project?.action?.date || "",
  });
  const [saving, setSaving] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Teklif adı zorunlu"); return; }
    setSaving(true);
    const payload = {
      name: form.name, customer_id: form.customerId, contact_person: form.contact,
      amount: Number(form.amount) || 0, currency: form.currency,
      project_date: form.date, status: form.status, priority: form.priority,
      probability: Number(form.probability) || 0,
      action_text: form.action_text || null, action_date: form.action_date || null,
    };
    try {
      if (isNew) {
        const result = await sb.insert("projects", payload);
        if (result?.[0] && onSave) onSave(result[0], true);
      } else {
        await sb.update("projects", project.id, payload);
        if (onSave) onSave({ ...project, ...form, id: project.id }, false);
      }
      setPage(prevPage || "projects");
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${form.name}" teklifini silmek istediğinizden emin misiniz?`)) return;
    await sb.remove("projects", project.id).catch(console.error);
    if (onDelete) onDelete(project.id);
    setPage(prevPage || "projects");
  };

  const inp = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", background: "#f9fafb", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "block" };
  const fg = { marginBottom: 16 };
  const selectedCust = customers.find(c => c.id === form.customerId);
  const s = STATUSES[form.status];

  return (
    <div>
      <button onClick={() => setPage(prevPage || "projects")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#3b82f6", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        {Icons.back} {t.back}
      </button>

      <div style={{ ...styles.card }}>
        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {selectedCust && <Avatar customer={selectedCust} size={48} />}
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{form.name || "Yeni Teklif"}</h2>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{selectedCust?.name || "—"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {s && <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{t[form.status]}</span>}
            {!isNew && (
              <button onClick={handleDelete} style={{ ...styles.btn("#fef2f2"), color: "#ef4444", fontSize: 13 }}>✕ {t.delete}</button>
            )}
          </div>
        </div>

        {/* Form grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
          <div style={{ ...fg, gridColumn: "1 / -1" }}>
            <label style={lbl}>Teklif / Proje Adı *</label>
            <input style={inp} value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Teklif adını girin" />
          </div>
          <div style={fg}>
            <label style={lbl}>Müşteri *</label>
            <select style={inp} value={form.customerId} onChange={e => upd("customerId", e.target.value)}>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={fg}>
            <label style={lbl}>{t.contactCol}</label>
            <input style={inp} value={form.contact} onChange={e => upd("contact", e.target.value)} placeholder="İlgili kişi" />
          </div>
          <div style={fg}>
            <label style={lbl}>{t.amountCol}</label>
            <input style={inp} type="number" value={form.amount} onChange={e => upd("amount", e.target.value)} placeholder="0" />
          </div>
          <div style={fg}>
            <label style={lbl}>Para Birimi</label>
            <select style={inp} value={form.currency} onChange={e => upd("currency", e.target.value)}>
              <option value="TRY">₺ TRY</option>
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
            </select>
          </div>
          <div style={fg}>
            <label style={lbl}>{t.statusCol}</label>
            <select style={inp} value={form.status} onChange={e => upd("status", e.target.value)}>
              {Object.keys(STATUSES).map(s => <option key={s} value={s}>{t[s] || s}</option>)}
            </select>
          </div>
          <div style={fg}>
            <label style={lbl}>{t.priorityCol}</label>
            <select style={inp} value={form.priority} onChange={e => upd("priority", e.target.value)}>
              <option value="Yüksek">{t.high}</option>
              <option value="Orta">{t.medium}</option>
              <option value="Düşük">{t.low}</option>
            </select>
          </div>
          <div style={fg}>
            <label style={lbl}>{t.dateCol}</label>
            <input style={inp} type="date" value={form.date} onChange={e => upd("date", e.target.value)} />
          </div>
          <div style={fg}>
            <label style={lbl}>Olasılık (%)</label>
            <input style={inp} type="number" min="0" max="100" value={form.probability} onChange={e => upd("probability", e.target.value)} />
          </div>
        </div>

        {/* Olasılık bar */}
        <div style={{ margin: "4px 0 20px" }}>
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${form.probability}%`, height: "100%", borderRadius: 3, background: form.probability >= 80 ? "#22c55e" : form.probability >= 50 ? "#f59e0b" : "#ef4444", transition: "width .3s" }} />
          </div>
        </div>

        {/* Aksiyon */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", marginBottom: 12 }}>Sonraki Aksiyon</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "0 16px" }}>
            <div style={fg}>
              <label style={lbl}>Aksiyon Notu</label>
              <input style={inp} value={form.action_text} onChange={e => upd("action_text", e.target.value)} placeholder="Yapılacak işlem..." />
            </div>
            <div style={fg}>
              <label style={lbl}>Aksiyon Tarihi</label>
              <input style={inp} type="date" value={form.action_date} onChange={e => upd("action_date", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={handleSave} disabled={saving} style={styles.btn("#3b82f6")}>{saving ? "Kaydediliyor..." : t.save}</button>
          <button onClick={() => setPage(prevPage || "projects")} style={{ ...styles.btn("#e5e7eb"), color: "#64748b" }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TEKLİFLER TAB ───
function TekliflerTab({ custProjects, customers, t, sectionTitle, onProjectClick, onNewProject }) {
  const [projects, setProjects] = useState(custProjects);

  // Sync when custProjects changes
  useState(() => { setProjects(custProjects); }, [custProjects]);

  const handleDelete = async (p) => {
    if (!window.confirm(`"${p.name}" teklifini silmek istediğinizden emin misiniz?`)) return;
    await sb.remove("projects", p.id).catch(console.error);
    setProjects(prev => prev.filter(x => x.id !== p.id));
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", paddingBottom: 6, borderBottom: "1px solid #eff6ff", flex: 1 }}>{t.salesDocs}</div>
        <button onClick={onNewProject} style={{ ...styles.btn("#3b82f6"), fontSize: 12, padding: "6px 14px", marginLeft: 12 }}>+ Yeni Teklif</button>
      </div>
      {projects.length === 0 ? (
        <div style={{ color: "#94a3b8", textAlign: "center", padding: 24, fontSize: 14 }}>{t.noSalesDocs}</div>
      ) : (
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 110px 90px 80px", gap: 0, padding: "10px 16px", background: "#f8fafc", fontWeight: 700, fontSize: 11, color: "#94a3b8", letterSpacing: .5 }}>
            <span>{t.docNumber}</span><span>{t.projectCol}</span><span>{t.statusCol}</span><span>{t.docDate}</span><span>{t.docAmount}</span><span>{t.actionCol}</span>
          </div>
          {projects.map((p, i) => {
            const s = STATUSES[p.status];
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 110px 110px 90px 80px", gap: 0, padding: "10px 16px", fontSize: 13, borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbfc", alignItems: "center" }}>
                <span onClick={() => onProjectClick && onProjectClick(p)} style={{ fontWeight: 600, color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}>TKF-{String(p.id).slice(-4).padStart(4, "0")}</span>
                <span onClick={() => onProjectClick && onProjectClick(p)} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8, cursor: "pointer", fontWeight: 500 }}>{p.name}</span>
                <span>
                  <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s?.bg, color: s?.color, border: `1px solid ${s?.border}` }}>{t[p.status] || p.status}</span>
                </span>
                <span style={{ color: "#64748b" }}>{new Date(p.date).toLocaleDateString("tr-TR")}</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onProjectClick && onProjectClick(p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#3b82f6", padding: "2px 4px" }} title={t.edit}>✎</button>
                  <button onClick={() => handleDelete(p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#fca5a5", padding: "2px 4px" }} title={t.delete}>✕</button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {sectionTitle(t.changeHistory)}
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #f1f5f9" }}>
        <div style={{ padding: "12px 16px", fontSize: 13, color: "#64748b", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{new Date().toLocaleDateString("tr-TR")} — {t.createdBy}: Erdi Ögetürk</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Kayıt oluşturuldu</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER DETAIL (SAP BP FORM — 5 TABS) ───
function CustomerDetail({ customer, customers, t, setPage, projects, onSave, onProjectClick, onNewProject }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: customer.name || "", name1: customer.name1 || "", name2: customer.name2 || "",
    name3: customer.name3 || "", name4: customer.name4 || "",
    customer_number: customer.customer_number || "", external_number: customer.external_number || "",
    customer_role: customer.customer_role || "potential", customer_type: customer.customer_type || "corporate",
    status: customer.status || "active", tax_office: customer.tax_office || "", tax_number: customer.tax_number || "",
    responsible_employee: customer.responsible_employee || "", logo_code: customer.logo_code || "",
    color: customer.color || "#3b82f6", logo_url: customer.logo_url || "",
  });
  const [contacts, setContacts] = useState([{ id: 1, firstName: "", lastName: "", position: "", phone: "", email: "" }]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "actMeeting", note: "", date: new Date().toISOString().split("T")[0] });
  const [editingActivity, setEditingActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(customer.logo_url || null);
  const [addressForm, setAddressForm] = useState({
    address: customer.address || "", country: customer.country || "Türkiye",
    city: customer.city || "", district: customer.district || "",
    neighborhood: customer.neighborhood || "", quarter: customer.quarter || "",
    postal_code: customer.postal_code || "", phone: customer.phone || "",
    mobile: customer.mobile || "", email: customer.email || "",
    invoice_address: customer.invoice_address || "", shipping_address: customer.shipping_address || "",
  });
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const logoInputRef = useRef(null);
  const tabs = [t.headerInfo, t.addressDetail, t.contactDetail, t.activities, t.salesDocs];
  const custProjects = projects.filter(p => p.customerId === customer.id);

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
    fontSize: 14, outline: "none", background: "#f9fafb", transition: "border-color .15s",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "block" };
  const fieldGroup = { marginBottom: 14 };
  const sectionTitle = (text) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", marginBottom: 12, marginTop: 8, paddingBottom: 6, borderBottom: "1px solid #eff6ff" }}>{text}</div>
  );

  const addContact = () => setContacts(prev => [...prev, { id: Date.now(), firstName: "", lastName: "", position: "", phone: "", email: "", isNew: true }]);
  const removeContact = async (id) => {
    const c = contacts.find(x => x.id === id);
    if (c && c.db_id) await sb.remove("customer_contacts", c.db_id);
    setContacts(prev => prev.filter(x => x.id !== id));
  };
  const updateContact = (id, key, val) => setContacts(prev => prev.map(c => c.id === id ? { ...c, [key]: val, isDirty: true } : c));

  // Load contacts from Supabase when tab 2 is opened
  const loadContacts = async () => {
    if (contactsLoaded || customer.isNew) return;
    try {
      const data = await sb.query("customer_contacts", { eq: { customer_id: customer.id } });
      if (Array.isArray(data) && data.length > 0) {
        setContacts(data.map(r => ({ id: r.id, db_id: r.id, firstName: r.first_name || "", lastName: r.last_name || "", position: r.position || "", phone: r.phone || "", email: r.email || "" })));
      }
    } catch (e) { console.error(e); }
    setContactsLoaded(true);
  };

  // Load activities from Supabase when tab 3 is opened
  const loadActivities = async () => {
    if (activitiesLoaded || customer.isNew) return;
    try {
      const data = await sb.query("customer_activities", { eq: { customer_id: customer.id }, order: "activity_date.desc" });
      if (Array.isArray(data) && data.length > 0) {
        setActivities(data.map(r => ({ id: r.id, db_id: r.id, type: r.activity_type || "actMeeting", note: r.note || "", date: r.activity_date || "" })));
      }
    } catch (e) { console.error(e); }
    setActivitiesLoaded(true);
  };

  const addActivityEntry = async () => {
    if (!newActivity.note.trim()) return;
    const entry = { id: Date.now(), ...newActivity };
    setActivities(prev => [entry, ...prev]);
    setNewActivity({ type: "actMeeting", note: "", date: new Date().toISOString().split("T")[0] });
    if (!customer.isNew) {
      try {
        const result = await sb.insert("customer_activities", { customer_id: customer.id, activity_type: entry.type, note: entry.note, activity_date: entry.date });
        if (result?.[0]) setActivities(prev => prev.map(a => a.id === entry.id ? { ...a, db_id: result[0].id } : a));
      } catch (e) { console.error(e); }
    }
  };

  const deleteActivity = async (act) => {
    setActivities(prev => prev.filter(a => a.id !== act.id));
    if (act.db_id) await sb.remove("customer_activities", act.db_id).catch(console.error);
  };

  const saveActivityEdit = async (act) => {
    setActivities(prev => prev.map(a => a.id === act.id ? act : a));
    setEditingActivity(null);
    if (act.db_id) {
      await sb.update("customer_activities", act.db_id, { activity_type: act.type, note: act.note, activity_date: act.date }).catch(console.error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${customer.id || Date.now()}.${ext}`;
      await fetch(`${SUPABASE_URL}/storage/v1/object/logos/${fileName}`, {
        method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": file.type, "x-upsert": "true" },
        body: file,
      });
      const url = `${SUPABASE_URL}/storage/v1/object/public/logos/${fileName}`;
      updateForm("logo_url", url);
      setLogoPreview(url);
    } catch (err) { console.error("Logo upload error:", err); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Müşteri adı zorunlu"); return; }
    setSaving(true);
    try {
      const savedCustomer = await onSave({ ...customer, ...form, logo_code: form.logo_code || form.name.substring(0, 2).toUpperCase() });
      const custId = savedCustomer?.id || customer.id;

      // Save address
      if (custId && !customer.isNew) {
        await sb.update("customers", custId, {
          address: addressForm.address, country: addressForm.country, city: addressForm.city,
          district: addressForm.district, neighborhood: addressForm.neighborhood, quarter: addressForm.quarter,
          postal_code: addressForm.postal_code, phone: addressForm.phone, mobile: addressForm.mobile,
          email: addressForm.email, invoice_address: addressForm.invoice_address, shipping_address: addressForm.shipping_address,
        }).catch(console.error);
      }

      // Save dirty contacts
      if (custId && !customer.isNew) {
        for (const c of contacts) {
          if (!c.firstName && !c.lastName) continue;
          const payload = { customer_id: custId, first_name: c.firstName, last_name: c.lastName, position: c.position, phone: c.phone, email: c.email };
          if (c.db_id) { await sb.update("customer_contacts", c.db_id, payload).catch(console.error); }
          else { const r = await sb.insert("customer_contacts", payload).catch(console.error); if (r?.[0]) setContacts(prev => prev.map(x => x.id === c.id ? { ...x, db_id: r[0].id } : x)); }
        }
      }

      if (customer.isNew) setPage("customers");
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div>
      <button onClick={() => setPage("customers")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#3b82f6", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        {Icons.back} {t.back}
      </button>

      <div style={{ ...styles.card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => logoInputRef.current?.click()}>
            {logoPreview ? (
              <img src={logoPreview} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "contain", border: "1.5px solid #e5e7eb", background: "#fff" }} />
            ) : (
              <Avatar customer={{ ...customer, ...form, logo_code: form.logo_code || form.name.substring(0, 2).toUpperCase() }} size={56} />
            )}
            <div style={{ position: "absolute", bottom: -4, right: -4, background: "#3b82f6", border: "2px solid #fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>+</div>
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{form.name || (t.newCustomer || "Yeni Müşteri")}</h2>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{custProjects.length} {t.project}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #f1f5f9", marginBottom: 20, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {tabs.map((tb, i) => (
            <button key={i} onClick={() => { setTab(i); if (i === 2) loadContacts(); if (i === 3) loadActivities(); }} style={{
              background: "none", border: "none", padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap",
              fontSize: 13, fontWeight: tab === i ? 700 : 400, color: tab === i ? "#3b82f6" : "#94a3b8",
              borderBottom: tab === i ? "2px solid #3b82f6" : "2px solid transparent", marginBottom: -2, transition: "all .15s",
            }}>{tb}</button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
              <div style={fieldGroup}><label style={labelStyle}>{t.custNumber}</label><input style={inputStyle} value={form.customer_number} onChange={e => updateForm("customer_number", e.target.value)} placeholder="Otomatik" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.custExtNumber}</label><input style={inputStyle} value={form.external_number} onChange={e => updateForm("external_number", e.target.value)} placeholder="Harici numara" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.custRole}</label>
                <select style={inputStyle} value={form.customer_role} onChange={e => updateForm("customer_role", e.target.value)}><option value="potential">{t.custRolePotential}</option><option value="real">{t.custRoleReal}</option></select>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name1}</label><input style={inputStyle} value={form.name} onChange={e => updateForm("name", e.target.value)} placeholder="Firma Adi" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name2}</label><input style={inputStyle} value={form.name1} onChange={e => updateForm("name1", e.target.value)} placeholder="Ad1" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name3}</label><input style={inputStyle} value={form.name2} onChange={e => updateForm("name2", e.target.value)} placeholder="Ad2" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name4}</label><input style={inputStyle} value={form.name3} onChange={e => updateForm("name3", e.target.value)} placeholder="Ad3" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.name5}</label><input style={inputStyle} value={form.name4} onChange={e => updateForm("name4", e.target.value)} placeholder="Ad4" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.custType}</label>
                <select style={inputStyle} value={form.customer_type} onChange={e => updateForm("customer_type", e.target.value)}><option value="corporate">{t.custTypeCorporate}</option><option value="individual">{t.custTypeIndividual}</option></select>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>{t.createdDate}</label><input style={inputStyle} type="date" defaultValue={new Date().toISOString().split("T")[0]} readOnly /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.modifiedDate}</label><input style={inputStyle} type="date" defaultValue={new Date().toISOString().split("T")[0]} readOnly /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.status}</label>
                <select style={inputStyle} value={form.status} onChange={e => updateForm("status", e.target.value)}>
                  <option value="active">{t.statusActive}</option><option value="blocked">{t.statusBlocked}</option><option value="inactive">{t.statusInactive}</option>
                </select>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>{t.taxOffice}</label><input style={inputStyle} value={form.tax_office} onChange={e => updateForm("tax_office", e.target.value)} placeholder="Vergi Dairesi" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.taxNumber}</label><input style={inputStyle} value={form.tax_number} onChange={e => updateForm("tax_number", e.target.value)} placeholder="VKN / TCKN" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.responsibleEmployee}</label><input style={inputStyle} value={form.responsible_employee} onChange={e => updateForm("responsible_employee", e.target.value)} placeholder="Sorumlu kisi" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.createdBy}</label><input style={inputStyle} defaultValue="Erdi Ogeturk" readOnly /></div>
              <div style={fieldGroup}><label style={labelStyle}>Logo Kodu (2 harf)</label><input style={inputStyle} value={form.logo_code} onChange={e => updateForm("logo_code", e.target.value.toUpperCase().slice(0,3))} placeholder="AB" maxLength={3} /></div>
              <div style={fieldGroup}><label style={labelStyle}>Renk</label><input style={{ ...inputStyle, height: 42 }} type="color" value={form.color} onChange={e => updateForm("color", e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* TAB 1: Adres Detay */}
        {tab === 1 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 20px" }}>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>{t.address}</label><input style={inputStyle} value={addressForm.address} onChange={e => setAddressForm(p => ({ ...p, address: e.target.value }))} placeholder="Açık adres" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.country}</label><input style={inputStyle} value={addressForm.country} onChange={e => setAddressForm(p => ({ ...p, country: e.target.value }))} /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.city}</label><input style={inputStyle} value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} placeholder="İl" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.district}</label><input style={inputStyle} value={addressForm.district} onChange={e => setAddressForm(p => ({ ...p, district: e.target.value }))} placeholder="İlçe" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.neighborhood}</label><input style={inputStyle} value={addressForm.neighborhood} onChange={e => setAddressForm(p => ({ ...p, neighborhood: e.target.value }))} placeholder="Semt" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.quarter}</label><input style={inputStyle} value={addressForm.quarter} onChange={e => setAddressForm(p => ({ ...p, quarter: e.target.value }))} placeholder="Mahalle" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.postalCode}</label><input style={inputStyle} value={addressForm.postal_code} onChange={e => setAddressForm(p => ({ ...p, postal_code: e.target.value }))} placeholder="Posta Kodu" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.phone}</label><input style={inputStyle} value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} placeholder="+90" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.mobile}</label><input style={inputStyle} value={addressForm.mobile} onChange={e => setAddressForm(p => ({ ...p, mobile: e.target.value }))} placeholder="+90 5xx" /></div>
              <div style={fieldGroup}><label style={labelStyle}>{t.email}</label><input style={inputStyle} value={addressForm.email} onChange={e => setAddressForm(p => ({ ...p, email: e.target.value }))} placeholder="info@firma.com" type="email" /></div>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>{t.invoiceAddress}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={addressForm.invoice_address} onChange={e => setAddressForm(p => ({ ...p, invoice_address: e.target.value }))} placeholder="Fatura adresi" /></div>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>{t.shippingAddress}</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={addressForm.shipping_address} onChange={e => setAddressForm(p => ({ ...p, shipping_address: e.target.value }))} placeholder="Sevk adresi" /></div>
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
                  <div style={fieldGroup}><label style={labelStyle}>{t.firstName}</label><input style={inputStyle} value={c.firstName} onChange={e => updateContact(c.id, "firstName", e.target.value)} placeholder="Ad" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.lastName}</label><input style={inputStyle} value={c.lastName} onChange={e => updateContact(c.id, "lastName", e.target.value)} placeholder="Soyad" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.position}</label><input style={inputStyle} value={c.position} onChange={e => updateContact(c.id, "position", e.target.value)} placeholder="Pozisyon / Unvan" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.phone}</label><input style={inputStyle} value={c.phone} onChange={e => updateContact(c.id, "phone", e.target.value)} placeholder="+90" /></div>
                  <div style={fieldGroup}><label style={labelStyle}>{t.email}</label><input style={inputStyle} value={c.email} onChange={e => updateContact(c.id, "email", e.target.value)} placeholder="email@" type="email" /></div>
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
                  const isEditing = editingActivity?.id === a.id;
                  return (
                    <div key={a.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: 8, padding: "10px 16px", alignItems: "center", flexWrap: "wrap" }}>
                          <select style={{ ...inputStyle, flex: "0 0 120px", padding: "6px 8px" }} value={editingActivity.type} onChange={e => setEditingActivity(p => ({ ...p, type: e.target.value }))}>
                            <option value="actMeeting">{t.actMeeting}</option>
                            <option value="actCall">{t.actCall}</option>
                            <option value="actEmail">{t.actEmail}</option>
                            <option value="actVisit">{t.actVisit}</option>
                            <option value="actOther">{t.actOther}</option>
                          </select>
                          <input type="date" style={{ ...inputStyle, flex: "0 0 130px", padding: "6px 8px" }} value={editingActivity.date} onChange={e => setEditingActivity(p => ({ ...p, date: e.target.value }))} />
                          <input style={{ ...inputStyle, flex: 1, minWidth: 150, padding: "6px 8px" }} value={editingActivity.note} onChange={e => setEditingActivity(p => ({ ...p, note: e.target.value }))} />
                          <button onClick={() => saveActivityEdit(editingActivity)} style={{ ...styles.btn("#22c55e"), padding: "6px 14px", fontSize: 12 }}>✓</button>
                          <button onClick={() => setEditingActivity(null)} style={{ ...styles.btn("#e5e7eb"), color: "#64748b", padding: "6px 14px", fontSize: 12 }}>{t.cancel}</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColors[a.type] || "#94a3b8", flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: "#64748b", minWidth: 90 }}>{new Date(a.date + "T00:00:00").toLocaleDateString("tr-TR")}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: typeColors[a.type], minWidth: 80 }}>{t[a.type]}</span>
                          <span style={{ fontSize: 13, flex: 1 }}>{a.note}</span>
                          <button onClick={() => setEditingActivity({ ...a })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#94a3b8", padding: "2px 6px" }} title={t.edit}>✎</button>
                          <button onClick={() => deleteActivity(a)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "#fca5a5", padding: "2px 6px" }} title={t.delete}>✕</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Teklifler */}
        {tab === 4 && (
          <TekliflerTab
            custProjects={custProjects}
            customers={customers}
            t={t}
            customer={customer}
            sectionTitle={sectionTitle}
            onProjectClick={onProjectClick}
            onNewProject={onNewProject}
          />
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={handleSave} disabled={saving} style={styles.btn("#3b82f6")}>{saving ? "Kaydediliyor..." : t.save}</button>
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
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectPrevPage, setProjectPrevPage] = useState("projects");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    try {
      const [custData, projData] = await Promise.all([
        sb.query("customers", { order: "name.asc" }),
        sb.query("projects", { order: "project_date.desc" }),
      ]);
      const custs = (custData || []).map(mapCustomer);
      setCustomers(custs);
      setProjects((projData || []).map(p => mapProject(p, custs)));
    } catch (e) { console.error("Fetch error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Pipeline drag — update Supabase
  const handleProjectStatusChange = async (projectId, newStatus) => {
    const prob = newStatus === "Kazanıldı" ? 100 : newStatus === "Kaybedildi" ? 0 : undefined;
    const update = { status: newStatus };
    if (prob !== undefined) update.probability = prob;
    await sb.update("projects", projectId, update);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus, probability: prob ?? p.probability } : p));
  };

  // Navigate to project detail
  const openProjectDetail = (project, fromPage) => {
    setSelectedProject(project);
    setProjectPrevPage(fromPage || "projects");
    setPage("projectDetail");
  };

  // Save project (new or update)
  const handleSaveProject = (savedRaw, isNew) => {
    const custs = customers;
    if (isNew) {
      const mapped = mapProject(savedRaw, custs);
      setProjects(prev => [mapped, ...prev]);
    } else {
      setProjects(prev => prev.map(p => p.id === savedRaw.id ? {
        ...p,
        name: savedRaw.name, contact: savedRaw.contact, amount: Number(savedRaw.amount),
        currency: savedRaw.currency, date: savedRaw.date, status: savedRaw.status,
        priority: savedRaw.priority, probability: Number(savedRaw.probability),
        action: savedRaw.action_text ? { text: savedRaw.action_text, date: savedRaw.action_date } : null,
      } : p));
    }
  };

  // Delete project
  const handleDeleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Save customer
  const handleSaveCustomer = async (custData) => {
    if (custData.isNew) {
      const { isNew, logo, ...data } = custData;
      const result = await sb.insert("customers", { ...data, logo_code: data.logo_code || data.name.substring(0, 2).toUpperCase() });
      if (result?.[0]) {
        const mapped = mapCustomer(result[0]);
        setCustomers(prev => [...prev, mapped]);
        setSelectedCustomer(mapped);
        return mapped;
      }
    } else {
      const { logo, _customer, ...data } = custData;
      await sb.update("customers", custData.id, data);
      setCustomers(prev => prev.map(c => c.id === custData.id ? { ...c, ...data } : c));
      return { ...custData, ...data };
    }
  };

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
    setStatusFilter(null);
    if (isMobile) setSidebarOpen(false);
  };

  const pageTitle = page === "customerDetail" ? (selectedCustomer?.name || t.customers)
    : page === "projectDetail" ? (selectedProject?.name || "Yeni Teklif")
    : navItems.find(n => n.key === page)?.label || t.dashboard;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f5f6fa", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <FiksLogo />
        <div style={{ marginTop: 16, color: "#94a3b8", fontSize: 14 }}>Yükleniyor...</div>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 19 }} />
      )}

      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? styles.sidebarMobile : {}),
        ...(isMobile && sidebarOpen ? styles.sidebarOpen : {}),
      }}>
        <div style={styles.sidebarLogo}><FiksLogo white /></div>
        <div style={styles.sidebarLabel}>CRM · Sales Pipeline</div>
        <nav style={{ flex: 1, paddingTop: 4 }}>
          {navItems.map(n => (
            <div key={n.key} onClick={() => handleNav(n.key)} style={styles.navItem(page === n.key || (page === "customerDetail" && n.key === "customers"))}>
              <span style={styles.navIcon}>{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>
        <div style={styles.pipelineTotal}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 4 }}>{t.totalPipeline}</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{formatFullTRY(totalPipeline)}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.weighted}: {formatFullTRY(weightedPipeline)}</div>
        </div>
      </aside>

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
            {page === "projects" && <button onClick={() => openProjectDetail(null, "projects")} style={styles.btn("#3b82f6")}>{t.newProject}</button>}
            {page === "customers" && (
              <button onClick={() => { setSelectedCustomer({ isNew: true, name: "", logo_code: "", color: "#3b82f6", customer_type: "corporate", customer_role: "potential", status: "active" }); setPage("customerDetail"); }} style={styles.btn("#3b82f6")}>{t.newCustomer}</button>
            )}
          </div>
        </div>

        <div style={styles.content}>
          {page === "dashboard" && <Dashboard projects={projects} customers={customers} t={t} setPage={setPage} setStatusFilter={setStatusFilter} setSelectedCustomer={setSelectedCustomer} />}
          {page === "customers" && <CustomersList customers={customers} t={t} setPage={setPage} setSelectedCustomer={setSelectedCustomer} projects={projects} />}
          {page === "projects" && <ProjectsTable projects={projects} customers={customers} t={t} setPage={setPage} setSelectedCustomer={setSelectedCustomer} onProjectClick={(p) => openProjectDetail(p, "projects")} />}
          {page === "pipeline" && <Pipeline projects={projects} customers={customers} setProjects={(fn) => { const updated = typeof fn === "function" ? fn(projects) : fn; setProjects(updated); }} t={t} statusFilter={statusFilter} onStatusChange={handleProjectStatusChange} onProjectClick={(p) => openProjectDetail(p, "pipeline")} />}
          {page === "customerDetail" && selectedCustomer && <CustomerDetail customer={selectedCustomer} customers={customers} t={t} setPage={setPage} projects={projects} onSave={handleSaveCustomer} onProjectClick={(p) => openProjectDetail(p, "customerDetail")} onNewProject={() => openProjectDetail({ customerId: selectedCustomer.id }, "customerDetail")} />}
          {page === "projectDetail" && <ProjectDetail project={selectedProject} customers={customers} t={t} setPage={setPage} prevPage={projectPrevPage} onSave={handleSaveProject} onDelete={handleDeleteProject} />}
        </div>
      </main>
    </div>
  );
}