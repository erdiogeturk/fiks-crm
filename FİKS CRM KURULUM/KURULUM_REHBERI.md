# Fiks CRM — Kurulum Rehberi

## Arkadaşına Ver (5 dosya)
- fiks-crm.zip — kaynak kod
- projects.json — proje verileri
- customers.json — müşteri verileri  
- contacts.json — kişi verileri
- activities.json — aktivite verileri
- data_import.sql — veritabanı import dosyası
- KURULUM_REHBERI.md — bu dosya

---

## Adım 1 — Node.js Kur
https://nodejs.org → LTS versiyonu indir ve kur

---

## Adım 2 — Supabase Hesabı Aç
1. https://supabase.com → ücretsiz hesap aç
2. New Project → isim ver → şifre belirle → Create
3. ~1 dakika bekle

---

## Adım 3 — Tabloları ve Verileri Oluştur
Supabase → SQL Editor → New query → data_import.sql içeriğini yapıştır → Run

---

## Adım 4 — API Bilgilerini Al
Supabase → Settings → API:
- Project URL → kopyala
- anon public key → kopyala

---

## Adım 5 — Projeyi Kur
```bash
# fiks-crm.zip dosyasını aç
cd fiks-crm
npm install
```

.env dosyasını düzenle:


cat >> ~/Desktop/KURULUM_REHBERI.md << 'EOF'

---

## Adım 7 — Vercel'e Deploy (Ekip Erişimi İçin)
Vercel kurulumu için şunlar lazım:

GitHub hesabı — kodu oraya yükleyecek
Vercel hesabı — GitHub'dan çekip deploy edecek
Environment variables — Vercel'de Supabase URL ve KEY'i tanımlayacak



1. https://github.com → ücretsiz hesap aç
2. New repository → isim: fiks-crm → Create
3. fiks-crm klasöründe terminal aç:
```bash
git init
git add .
git commit -m "Fiks CRM"
git remote add origin https://github.com/KULLANICI_ADIN/fiks-crm.git
git push -u origin main
```
4. https://vercel.com → ücretsiz hesap aç → GitHub ile bağla
5. New Project → fiks-crm repo'yu seç → Import
6. Environment Variables bölümüne ekle:
   - VITE_SUPABASE_URL = supabase proje url
   - VITE_SUPABASE_ANON_KEY = supabase anon key
7. Deploy → birkaç dakika sonra link hazır
8. Linki ekiple paylaş — herkes tarayıcıdan erişebilir
EOF
echo "OK"
