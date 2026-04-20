# Logo & Tema Senkronizasyonu — Tasarım Dokümanı

**Tarih:** 2026-04-13  
**Konu:** FiksCRM yeni versiyonunu (localhost:5173) eski versiyonla (fiks-crm.vercel.app) logo ve tema açısından senkronize etmek

---

## Bağlam

Yeni versiyon (Spring Boot + React) farklı bir logo ve sidebar rengi kullanıyor. Eski versiyonun (Vercel/Supabase) görsel kimliği korunacak.

---

## Karşılaştırma

| Özellik | Eski (Vercel) | Yeni (mevcut) | Hedef |
|---|---|---|---|
| Sidebar gradient | `#111827 → #1a1f4e` | `#1e1b4b → #312e81` | `#111827 → #1a1f4e` |
| Sidebar logo | Gerçek fiks wordmark SVG (beyaz) | Basit polygon + text | Gerçek wordmark SVG |
| Login logosu | — | Mor kare + "F" harfi | Gerçek logo (renkli) |
| Favicon | lightning bolt SVG | Kare + "f" | lightning bolt SVG |
| Menü ikonları | `◉ 👥 ≡ ▊` | `◐ 🏢 ☰ ◧` | `◉ 👥 ≡ ▊` |
| Sayfa arkaplanı | `#f5f6fa` | `#f8fafc` | `#f5f6fa` |

---

## Değiştirilecek Dosyalar

### 1. `frontend/src/components/Layout.jsx`
- `FiksLogo` bileşeni → gerçek fiks wordmark SVG (`viewBox="0 0 117 40"`, `fill="#ffffff"`)
- `sidebarGradient` import yerine doğrudan `linear-gradient(#111827 0%, #1a1f4e 100%)`
- Menü ikonları: `◉`, `👥`, `≡`, `▊`

### 2. `frontend/src/pages/Login.jsx`
- Mor kare + "F" harfi → gerçek FIKS lightning bolt SVG (mor `#863bff`)

### 3. `frontend/public/fiks-logo.svg`
- Kare favicon → gerçek FIKS lightning bolt SVG (`favicon.svg`'den)

### 4. `frontend/src/theme/index.js`
- `sidebarGradient` → `linear-gradient(#111827 0%, #1a1f4e 100%)`
- `background.default` → `#f5f6fa`

---

## Sınırlar

- Kart stilleri (border-top colored) değiştirilmez — yeni versiyonda MUI Card kullanılıyor, eski versiyona göre yeterince iyi
- Backend'e dokunulmaz
- Yeni bağımlılık eklenmez

---

## Başarı Kriteri

- Sidebar logosu eski versiyonla görsel olarak aynı
- Sidebar rengi eski versiyonla eşleşiyor (daha koyu, siyah-lacivert)
- Login sayfasında gerçek FIKS logosu görünüyor
- Favicon güncellendi
