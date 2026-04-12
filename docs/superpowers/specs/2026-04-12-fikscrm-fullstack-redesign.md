# FiksCRM — Full-Stack Yeniden Yazım Tasarım Dokümanı

**Tarih:** 2026-04-12  
**Branch:** feature/FCRM-1  
**Durum:** Onaylandı

---

## 1. Kapsam

Mevcut React + Supabase (frontend-only) uygulamasını sıfırdan yeniden yazmak:

- **Backend:** Spring Boot 3.x + Java 21 — REST API + JWT auth
- **Frontend:** React 19 + Material UI — SPA, React Router, React Query
- **Veritabanı:** MySQL 8 — Flyway migrations
- **Deployment:** Docker Compose (local dev + production-ready)
- **Mevcut veri:** 20 proje, 17 müşteri, 9 aktivite — Flyway seed ile taşınır

---

## 2. Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|---------|
| `SUPER_ADMIN` | Her şey + kullanıcı yönetimi (CRUD) |
| `COMPANY_ADMIN` | Customer/Project/Contact/Activity CRUD + raporlar, kullanıcı yönetimi yok |
| `SALES_PERSON` | Customer/Project/Contact/Activity CRUD, kullanıcı yönetimi yok |
| `READ_ONLY` | Sadece GET endpoint'leri, yazma işlemi yok |

---

## 3. Proje Klasör Yapısı

```
fikscrm/
├── docker-compose.yml          # Prod: MySQL + backend + frontend (nginx)
├── docker-compose.dev.yml      # Dev: sadece MySQL
├── .gitignore
│
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fikscrm/
│       │   ├── config/          # SecurityConfig, JwtConfig, OpenApiConfig
│       │   ├── auth/            # Login, refresh, logout
│       │   ├── user/            # User entity + CRUD
│       │   ├── customer/        # Customer domain
│       │   ├── project/         # Project/opportunity domain
│       │   ├── contact/         # Contact domain
│       │   ├── activity/        # Activity history
│       │   └── common/          # ApiResponse, GlobalExceptionHandler, enums
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               ├── V1__schema.sql
│               ├── V2__seed_data.sql
│               └── V3__default_users.sql
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/
        │   ├── axiosInstance.js
        │   ├── authApi.js
        │   ├── customerApi.js
        │   ├── projectApi.js
        │   ├── contactApi.js
        │   └── activityApi.js
        ├── components/
        │   └── common/          # Layout, Sidebar, TopBar, LoadingSpinner
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useExchangeRates.js
        ├── pages/
        │   ├── auth/LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── CustomersPage.jsx
        │   ├── CustomerDetailPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── PipelinePage.jsx
        │   └── UsersPage.jsx    # SUPER_ADMIN only
        ├── utils/
        │   └── formatters.js    # formatCurrency, formatDate
        └── App.jsx              # Routes + ProtectedRoute
```

---

## 4. Veritabanı Şeması

### users
```sql
id BIGINT PK AUTO_INCREMENT
username VARCHAR(50) UNIQUE NOT NULL
email VARCHAR(100) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
full_name VARCHAR(100)
role ENUM('SUPER_ADMIN','COMPANY_ADMIN','SALES_PERSON','READ_ONLY') NOT NULL
active BOOLEAN DEFAULT TRUE
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### refresh_tokens
```sql
id BIGINT PK AUTO_INCREMENT
user_id BIGINT FK → users.id ON DELETE CASCADE
token VARCHAR(512) UNIQUE NOT NULL
expires_at DATETIME NOT NULL
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### customers
```sql
id BIGINT PK AUTO_INCREMENT
name VARCHAR(255) NOT NULL
customer_no VARCHAR(50)
external_no VARCHAR(50)
role VARCHAR(50)
name2, name3, name4 VARCHAR(255)
customer_type VARCHAR(100)
status VARCHAR(50) DEFAULT 'Aktif'
tax_office VARCHAR(100)
tax_no VARCHAR(50)
sector VARCHAR(100)
responsible VARCHAR(100)
created_by VARCHAR(100)
country VARCHAR(100) DEFAULT 'Türkiye'
city, district, neighborhood VARCHAR(100)
postal_code VARCHAR(20)
phone, mobile VARCHAR(50)
email VARCHAR(100)
website TEXT
billing_address TEXT
shipping_address TEXT
logo_url TEXT
notes TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### projects
```sql
id BIGINT PK AUTO_INCREMENT
customer_id BIGINT FK → customers.id ON DELETE SET NULL
project_name VARCHAR(255) NOT NULL
amount DECIMAL(15,2)
currency ENUM('TRY','EUR','USD') DEFAULT 'TRY'
date DATE
status ENUM('lead','proposal','negotiation','won','lost','onhold') DEFAULT 'lead'
priority ENUM('high','medium','low') DEFAULT 'medium'
segment VARCHAR(100)
source VARCHAR(100)
probability TINYINT DEFAULT 20
contact_name VARCHAR(100)
contact_email VARCHAR(100)
contact_phone VARCHAR(50)
notes TEXT
next_action TEXT
next_action_date DATE
logo_url TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### contacts
```sql
id BIGINT PK AUTO_INCREMENT
customer_id BIGINT FK → customers.id ON DELETE CASCADE
name VARCHAR(100) NOT NULL
title VARCHAR(100)
email VARCHAR(100)
phone VARCHAR(50)
is_primary BOOLEAN DEFAULT FALSE
notes TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### activities
```sql
id BIGINT PK AUTO_INCREMENT
project_id BIGINT FK → projects.id ON DELETE CASCADE
type VARCHAR(50)
note TEXT
date DATE
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## 5. Backend Mimarisi

### Katman Yapısı
```
Controller → Service → Repository → Entity
                ↑
          DTOs (Request / Response)
```

Her domain için `controller/`, `service/`, `repository/`, `entity/`, `dto/` altpaketleri.

### Güvenlik Akışı
```
Request → JwtAuthFilter → SecurityContext → Controller
              ↓
         JWT doğrula → UserDetails yükle → @PreAuthorize role check
```

### JWT Stratejisi
- **Access token:** 15 dakika, `Authorization: Bearer` header
- **Refresh token:** 7 gün, DB'de saklanır, rotation uygulanır
- **401 durumu:** Frontend otomatik refresh dener; başarısız olursa `/login`'e yönlendirir

### Global Response Formatı
```json
{ "success": true,  "data": { ... }, "message": null }
{ "success": false, "data": null,    "message": "Hata mesajı" }
```

### API Endpoint Listesi
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/dashboard/stats

GET    /api/customers
POST   /api/customers
GET    /api/customers/{id}
PUT    /api/customers/{id}
DELETE /api/customers/{id}
GET    /api/customers/{id}/contacts

GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
GET    /api/projects/{id}/activities
POST   /api/projects/{id}/activities

GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/{id}
PUT    /api/contacts/{id}
DELETE /api/contacts/{id}

GET    /api/users           (SUPER_ADMIN)
POST   /api/users           (SUPER_ADMIN)
GET    /api/users/{id}      (SUPER_ADMIN)
PUT    /api/users/{id}      (SUPER_ADMIN)
DELETE /api/users/{id}      (SUPER_ADMIN)
```

---

## 6. Frontend Mimarisi

### State Yönetimi
| Katman | Teknoloji | Ne için |
|--------|-----------|---------|
| Auth state | Context API (AuthContext) | user, accessToken (memory), logout |
| Server state | React Query | customers, projects, contacts, activities |
| Local state | useState | form, modal open/close, filtreler |

### Axios Interceptor Stratejisi
- **Request:** `Authorization: Bearer <accessToken>` header ekler
- **Response 401:** `/api/auth/refresh` çağırır → token günceller → isteği tekrarlar
- **Refresh başarısız:** AuthContext temizlenir → `/login`'e yönlendirir

### Rota Yapısı
```
/ → ProtectedRoute → Layout (Sidebar + TopBar)
├── /dashboard
├── /customers
├── /customers/:id
├── /projects
├── /pipeline
└── /users              (role === 'SUPER_ADMIN')

/login → public, giriş yapılmışsa /dashboard'a yönlendirir
```

### MUI Tema Renkleri
```
primary:   #6366f1  (mevcut indigo rengi)
success:   #10b981
warning:   #f59e0b
error:     #ef4444
```

### Sayfa Bileşenleri
| Sayfa | Bileşenler |
|-------|-----------|
| Login | MUI Card, TextField, Button, CircularProgress |
| Dashboard | KPI Grid, status dağılım tablosu, yaklaşan aksiyonlar listesi |
| Customers | MUI DataGrid, CustomerFormDialog, CustomerDetailDrawer |
| Projects | MUI DataGrid + filtreler, ProjectFormDialog, ProjectDetailDrawer + aktivite timeline |
| Pipeline | Kanban board — status kolonları, drag-and-drop (dnd-kit) |
| Users | MUI DataGrid, UserFormDialog (SUPER_ADMIN only) |

---

## 7. Data Migration Stratejisi

### Tespit Edilen Sorun
`data_import.sql`'deki `projects.customer_id` değerleri eski Supabase otomatik ID'lerine referans veriyor, yeni sıralı ID'lere değil. Name-based subquery ile rebuild edilecek:

```sql
INSERT INTO projects (customer_id, project_name, ...)
SELECT c.id, 'SAKA Group S4/Hana Projesi', ...
FROM customers c WHERE c.name = 'SAKA Group';
```

### Migration Sırası
1. `V1__schema.sql` — tüm tabloların oluşturulması
2. `V2__seed_data.sql` — 17 müşteri, 20 proje (FK düzeltilmiş), 9 aktivite
3. `V3__default_users.sql` — 1 super_admin (username: `admin`, password: `Admin123!` BCrypt hash)

### Doğrulama
- `GET /api/customers` → 17 kayıt
- `GET /api/projects` → 20 kayıt
- `GET /api/projects/{id}/activities` → ilgili aktiviteler

---

## 8. Docker Compose Yapısı

### docker-compose.dev.yml (sadece DB)
```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: fikscrm
      MYSQL_USER: fikscrm
      MYSQL_PASSWORD: fikscrm123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
```

### docker-compose.yml (full stack)
```yaml
services:
  mysql: ...          # yukarıdaki gibi, port expose yok
  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/fikscrm
    depends_on: [mysql]
    ports:
      - "8080:8080"
  frontend:
    build: ./frontend
    ports:
      - "3000:80"     # nginx ile serve
    depends_on: [backend]
```

---

## 9. Geliştirme Sırası (Önerilen)

1. Backend — DB schema (Flyway V1 + V2 + V3)
2. Backend — Auth (login, JWT, refresh, logout)
3. Backend — Customer CRUD
4. Backend — Project CRUD + Activity
5. Backend — Contact CRUD
6. Backend — Dashboard stats endpoint
7. Backend — User management (SUPER_ADMIN)
8. Frontend — Auth (login, AuthContext, axios interceptors)
9. Frontend — Layout + routing
10. Frontend — Dashboard
11. Frontend — Customers
12. Frontend — Projects + Pipeline
13. Frontend — Contacts (CustomerDetail içinde)
14. Frontend — Users (SUPER_ADMIN)
15. Docker Compose — prod build test

---

## 10. Riskler & Notlar

- `data_import.sql` PostgreSQL syntax içeriyor (`RESTART IDENTITY`, `pg_get_serial_sequence`) → MySQL seed dosyasında kullanılmayacak, sıfırdan yazılacak
- Refresh token `httpOnly` cookie yerine DB'de saklanacak — CSRF riski düşük çünkü REST API
- MUI DataGrid Community sürümü yeterli; pagination, sıralama, filtreleme built-in gelir
- `dnd-kit` pipeline board için seçildi — React 19 ile uyumlu, react-beautiful-dnd artık maintain edilmiyor
- İlk kullanıcı (`admin` / `Admin123!`) ilk girişte şifre değiştirmeli
