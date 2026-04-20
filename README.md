# FiksCRM - B2B Sales Pipeline

Modern, çok kiracılı (multi-tenant) B2B CRM uygulaması. Spring Boot 3.x backend + React frontend + PostgreSQL.

## Özellikler

- **JWT Authentication**: Token tabanlı güvenli kimlik doğrulama
- **Rol Tabanlı Erişim Kontrolü (RBAC)**:
  - Super Admin: Tüm işlemleri yapabilir
  - Company Admin: İzin verilen nesnelerde CRUD
  - Sales Person: Operasyonel CRUD işlemleri
  - Read Only: Sadece okuma yetkisi
- **Çoklu Kiracı (Multi-Tenant)**: Her müşteri kendi veritabanını kullanır
- **Müşteri Yönetimi**: Kurumsal müşteri kayıtları
- **Proje/Pipeline Yönetimi**: Fırsat takibi, durum güncelleme
- **Aktivite Takibi**: Müşteri etkileşimleri

## Teknoloji Stack

### Backend
- Java 21
- Spring Boot 3.4.x
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway (Migration)

### Frontend
- React 18
- Material UI (MUI)
- React Router v6
- TanStack Query (React Query)
- Axios

## Kurulum

### Gereksinimler

- Node.js 18+
- Java 21
- PostgreSQL 15+
- Maven 3.8+

### Veritabanı

```bash
# PostgreSQL'de veritabanı oluştur
psql -U postgres -c "CREATE DATABASE fikscrm;"
```

### Backend

```bash
cd backend

# Maven bağımlılıklarını yükle
mvn clean install

# Uygulamayı çalıştır
mvn spring-boot:run
```

Backend `http://localhost:8080/api` adresinde çalışacak.

### Frontend

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacak.

### Varsayılan Giriş

```
Kullanıcı: admin
Şifre: admin123
```

## Deployment

### Vercel (Frontend)

1. GitHub'a push yapın
2. Vercel'de projeyi import edin
3. Environment variable ekleyin:
   - `VITE_API_URL`: Backend API URL

### Backend Deployment

Environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing key (en az 32 karakter)

## Proje Yapısı

```
FiksCrm/
├── backend/
│   └── src/main/
│       ├── java/com/fikscrm/
│       │   ├── config/          # Konfigürasyon
│       │   ├── controller/      # REST Controller'lar
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── entity/          # JPA Entity'ler
│       │   ├── exception/       # Exception Handling
│       │   ├── repository/      # JPA Repository'ler
│       │   ├── security/        # JWT & Security
│       │   └── service/         # Business Logic
│       └── resources/
│           ├── application.yml
│           └── db/migration/    # Flyway migrations
│
└── frontend/
    └── src/
        ├── components/          # React bileşenleri
        ├── hooks/              # Custom React hooks
        ├── pages/              # Sayfa bileşenleri
        ├── services/           # API servisleri
        ├── theme/              # MUI tema
        └── types/              # TypeScript tipleri
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `GET /api/auth/me` - Mevcut kullanıcı

### Customers
- `GET /api/customers` - Tüm müşteriler
- `GET /api/customers/:id` - Müşteri detay
- `POST /api/customers` - Yeni müşteri
- `PUT /api/customers/:id` - Müşteri güncelle
- `DELETE /api/customers/:id` - Müşteri sil

### Projects
- `GET /api/projects` - Tüm projeler
- `GET /api/projects/:id` - Proje detay
- `POST /api/projects` - Yeni proje
- `PUT /api/projects/:id` - Proje güncelle
- `DELETE /api/projects/:id` - Proje sil

### Dashboard
- `GET /api/dashboard` - Dashboard verileri

## Lisans

MIT
