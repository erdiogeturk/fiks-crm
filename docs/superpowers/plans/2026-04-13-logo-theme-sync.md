# Logo & Tema Senkronizasyonu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FiksCRM yeni versiyonunun (localhost:5173) logo ve sidebar temasını eski versiyon (fiks-crm.vercel.app) ile eşleştir.

**Architecture:** 4 dosya değiştirilir — theme token'ları, Layout sidebar, Login sayfası, public favicon. Yeni bağımlılık yok, sadece SVG ve renk güncellemeleri.

**Tech Stack:** React 18, MUI v5, Vite, inline SVG

---

## Dosya Haritası

| Dosya | Değişiklik |
|---|---|
| `frontend/src/theme/index.js` | `sidebarGradient` ve `background.default` güncelle |
| `frontend/src/components/Layout.jsx` | `FiksLogo` SVG'yi değiştir, gradient import düzelt, menu ikonları güncelle |
| `frontend/src/pages/Login.jsx` | Mor "F" kutusu → gerçek lightning bolt SVG |
| `frontend/public/fiks-logo.svg` | Gerçek FIKS lightning bolt SVG ile değiştir |

---

## Task 1: Theme Token'larını Güncelle

**Files:**
- Modify: `frontend/src/theme/index.js`

- [ ] **Step 1: `sidebarGradient` ve `background.default` değerlerini güncelle**

`frontend/src/theme/index.js` dosyasında aşağıdaki iki satırı değiştir:

```js
// ESKİ:
export const sidebarGradient = 'linear-gradient(180deg, #1e1b4b, #312e81)'
// YENİ:
export const sidebarGradient = 'linear-gradient(#111827 0%, #1a1f4e 100%)'
```

`background.default` değerini de güncelle:
```js
// ESKİ:
default: '#f8fafc',
// YENİ:
default: '#f5f6fa',
```

- [ ] **Step 2: Dev server'ı kontrol et — hata yok mu?**

Terminal çıktısında Vite hot-reload hatası olmadığını doğrula. Sidebar hemen daha koyu görünmeli.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/theme/index.js
git commit -m "style: sidebar gradient ve arkaplan rengini eski versiyonla eşleştir"
```

---

## Task 2: Sidebar Logosunu Değiştir

**Files:**
- Modify: `frontend/src/components/Layout.jsx`

- [ ] **Step 1: `FiksLogo` bileşenini gerçek wordmark SVG ile değiştir**

`Layout.jsx` içindeki `FiksLogo` bileşenini bul (satır 23-28) ve aşağıdakiyle değiştir:

```jsx
const FiksLogo = () => (
  <svg viewBox="0 0 117 40" xmlns="http://www.w3.org/2000/svg" style={{ height: 32, width: 'auto', display: 'block' }}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.531 26.6197L18.4465 22.6282L13.8324 19.9634L34.5775 7.9858V0L0 19.9634L11.531 26.6197ZM69.9591 7.75363C69.9591 9.61103 68.4534 11.1169 66.5958 11.1169C64.7383 11.1169 63.2324 9.61103 63.2324 7.75363C63.2324 5.89596 64.7383 4.39013 66.5958 4.39013C68.4534 4.39013 69.9591 5.89596 69.9591 7.75363ZM89.7 13.7437L81.1944 22.3506V4.81542H75.1859V36.1282H81.1944V29.1225L83.2424 27.2056L90.3352 36.1282H97.5704L87.2213 23.4773L97.6128 13.7437H89.7ZM115.763 27.2801C115.538 26.631 115.184 26.0534 114.706 25.5449C114.141 24.9521 113.38 24.4308 112.421 23.9789C111.49 23.528 110.348 23.1182 108.994 22.752C107.951 22.4703 107.118 22.2153 106.497 21.99C105.904 21.7646 105.454 21.5675 105.144 21.3972C105.027 21.3155 104.92 21.2266 104.823 21.1306C104.685 20.9942 104.566 20.8431 104.466 20.6773C104.325 20.3956 104.255 20.0984 104.255 19.7887C104.255 19.4787 104.311 19.1956 104.424 18.9423C104.565 18.6606 104.762 18.4337 105.017 18.2648C105.27 18.0956 105.582 17.969 105.948 17.8844C106.203 17.8296 106.477 17.7927 106.769 17.7734C106.927 17.763 107.091 17.7577 107.259 17.7577C107.796 17.7577 108.401 17.8703 109.079 18.0956C109.756 18.3211 110.404 18.6322 111.025 19.0268C111.675 19.421 112.252 19.8592 112.761 20.3377L115.976 16.7831C115.27 16.0772 114.438 15.4718 113.479 14.9634C112.548 14.4268 111.532 14.0182 110.432 13.7365C109.332 13.4548 108.204 13.314 107.048 13.314C105.892 13.314 104.792 13.4829 103.748 13.8223C102.704 14.1324 101.773 14.5844 100.955 15.1761C100.165 15.7689 99.5451 16.4872 99.093 17.3335C98.6422 18.152 98.4155 19.0689 98.4155 20.0845C98.4155 20.9308 98.5421 21.7069 98.7958 22.4111C99.0775 23.0887 99.4732 23.7225 99.9801 24.3153C100.573 24.9365 101.362 25.4999 102.349 26.0084C103.365 26.4872 104.592 26.911 106.031 27.2775C106.218 27.3283 106.397 27.3787 106.57 27.4284C106.825 27.5017 107.066 27.5737 107.291 27.6446C107.676 27.7661 108.017 27.8835 108.315 27.997C108.908 28.1944 109.345 28.3632 109.627 28.5041C110.134 28.8703 110.389 29.3648 110.389 29.9856C110.389 30.2958 110.318 30.5928 110.177 30.8745C110.065 31.1282 109.882 31.3534 109.627 31.5521C109.373 31.721 109.062 31.8618 108.696 31.9746C108.358 32.059 107.976 32.1014 107.554 32.1014C106.482 32.1014 105.41 31.9042 104.338 31.5083C103.266 31.0858 102.293 30.4082 101.418 29.4773L97.6944 32.6928C98.6817 33.9055 99.9789 34.8646 101.587 35.5703C103.224 36.2477 105.086 36.5859 107.173 36.5859C108.866 36.5859 110.389 36.2901 111.744 35.697C113.097 35.0759 114.155 34.2294 114.917 33.1577C115.707 32.0576 116.101 30.8168 116.101 29.4337C116.101 28.6435 115.989 27.9239 115.763 27.2761V27.2801ZM69.6 13.8985H63.5915V36.283H69.6V13.8985ZM55.0944 10.5056C54.7549 10.6745 54.5014 10.9435 54.3324 11.3097C54.162 11.6492 54.0775 12.0857 54.0775 12.6224V14.3153H58.9014V19.3928H54.0775V36.149H48.0268V19.3928H44.6845V14.3153H48.0268V12.1999C48.0268 10.8167 48.3365 9.56179 48.9577 8.43365C49.5789 7.30551 50.4253 6.4167 51.4972 5.76749C52.597 5.11828 53.8817 4.79424 55.3479 4.79424C56.3351 4.79424 57.2662 4.96479 58.1408 5.30259C59.0155 5.61262 59.762 6.04918 60.3831 6.61394L58.6056 11.014C58.4083 10.8918 58.2066 10.7823 58.0008 10.6852C57.8246 10.6022 57.6453 10.5282 57.4634 10.4633C57.0972 10.2943 56.7576 10.2096 56.4477 10.2096C55.9125 10.2096 55.4606 10.3084 55.0944 10.5056ZM34.5775 31.941V39.9241L13.8324 27.9465L34.5775 15.9692V23.9549L27.6606 27.9465L34.5775 31.941Z"
      fill="#ffffff"
    />
  </svg>
)
```

- [ ] **Step 2: Sidebar header padding'ini ayarla**

Logo wrapper Box'unu kontrol et (satır 64). Yüksek SVG için padding yeterli olmalı:
```jsx
<Box sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
  <FiksLogo />
</Box>
```

- [ ] **Step 3: Menü ikonlarını güncelle**

`menuItems` array'ini bul ve ikonları değiştir:
```jsx
const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '◉' },
  { path: '/customers', label: 'Müşteriler', icon: '👥' },
  { path: '/projects', label: 'Projeler', icon: '≡' },
  { path: '/pipeline', label: 'Pipeline', icon: '▊' },
]
```

- [ ] **Step 4: Tarayıcıda kontrol et**

`http://localhost:5173/dashboard` adresinde:
- Sidebar logosu "fiks" wordmark olarak görünmeli (beyaz, tam yazı)
- Sidebar rengi siyah-lacivert gradient (eski versiyonla aynı)
- Menü ikonları güncellenmiş

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Layout.jsx
git commit -m "style: sidebar logosunu gerçek fiks wordmark ile değiştir, menu ikonlarını güncelle"
```

---

## Task 3: Login Sayfası Logosunu Güncelle

**Files:**
- Modify: `frontend/src/pages/Login.jsx`

- [ ] **Step 1: Mor "F" kutusunu FIKS lightning bolt SVG ile değiştir**

`Login.jsx`'te logo alanını bul (satır 55-69) ve aşağıdakiyle değiştir:

```jsx
<Box sx={{ textAlign: 'center', mb: 4 }}>
  <Box
    sx={{
      width: 64,
      height: 64,
      borderRadius: 3,
      background: 'linear-gradient(135deg, #863bff, #6b2bdd)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 2,
      boxShadow: '0 8px 24px rgba(134,59,255,0.35)',
    }}
  >
    <svg viewBox="0 0 48 46" xmlns="http://www.w3.org/2000/svg" style={{ width: 34, height: 34 }}>
      <path
        fill="#ffffff"
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
      />
    </svg>
  </Box>
  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
    FiksCRM
  </Typography>
  <Typography variant="body2" color="text.secondary">
    B2B Sales Pipeline
  </Typography>
</Box>
```

- [ ] **Step 2: Tarayıcıda login sayfasını kontrol et**

`http://localhost:5173/login` adresinde:
- Logo: Mor gradient kare içinde beyaz lightning bolt
- "FiksCRM" başlığı ve "B2B Sales Pipeline" alt başlığı

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "style: login sayfası logosunu fiks lightning bolt ile güncelle"
```

---

## Task 4: Favicon'ı Güncelle

**Files:**
- Modify: `frontend/public/fiks-logo.svg`

- [ ] **Step 1: `fiks-logo.svg` dosyasını gerçek logo ile değiştir**

`frontend/public/fiks-logo.svg` dosyasının içeriğini tamamen şununla değiştir:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="46" fill="none" viewBox="0 0 48 46">
  <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
</svg>
```

- [ ] **Step 2: Tarayıcı sekmesini kontrol et**

`http://localhost:5173` adresini aç — sekme ikonunda mor lightning bolt görünmeli (Vite cache'i temizlemek için hard refresh gerekebilir: `Cmd+Shift+R`).

- [ ] **Step 3: Commit**

```bash
git add frontend/public/fiks-logo.svg
git commit -m "style: favicon'ı gerçek fiks lightning bolt SVG ile güncelle"
```

---

## Self-Review

**Spec coverage:**
- [x] Sidebar gradient → Task 1
- [x] Sidebar logo (wordmark) → Task 2
- [x] Menü ikonları → Task 2
- [x] Login logosu → Task 3
- [x] Favicon → Task 4
- [x] Sayfa arkaplan rengi → Task 1

**Placeholder scan:** Tüm adımlarda tam kod var, TBD/TODO yok.

**Type consistency:** Tüm dosyalar birbirinden bağımsız, cross-task bağımlılık yok.
