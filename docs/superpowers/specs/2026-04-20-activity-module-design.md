# Activity Module Design

**Date:** 2026-04-20  
**Status:** Approved  
**Branch:** feature/FCRM-1

---

## Overview

Müşterilerle olan aktivitelerin takip edildiği bağımsız bir modül. Aktiviteler projelerden tamamen bağımsız olup doğrudan müşterilere bağlıdır. Hem `/activities` sayfasında hem de `CustomerDetail` sayfasındaki sekmede görünür.

---

## Data Model

### V4 Migration — `V4__Refactor_Activities.sql`

Mevcut `activities` tablosu drop edilip yenisi oluşturulur.

```sql
DROP TABLE IF EXISTS activities;

CREATE TABLE activities (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_number     VARCHAR(20) NOT NULL UNIQUE,
    customer_id         BIGINT NOT NULL,
    contact_id          BIGINT,
    activity_type       VARCHAR(50) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACIK',
    close_date          DATE,
    location            VARCHAR(255),
    notes               TEXT,
    created_by          BIGINT NOT NULL,
    responsible_user_id BIGINT,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id)         REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id)          REFERENCES contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)          REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (responsible_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_activities_customer_id   ON activities(customer_id);
CREATE INDEX idx_activities_status        ON activities(status);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at    ON activities(created_at DESC);
```

### Alan Tanımları

| Alan | Tip | Kısıtlar | Açıklama |
|---|---|---|---|
| id | BIGINT | PK, auto | Numara |
| activity_number | VARCHAR(20) | UNIQUE, NOT NULL | Z10001 formatı |
| customer_id | BIGINT FK | NOT NULL | Müşteri |
| contact_id | BIGINT FK | nullable | İlgili Kişi |
| activity_type | VARCHAR(50) | NOT NULL | ZIYARET / GOREV / EPOSTA / TELEFON_ARAMASI |
| name | VARCHAR(255) | NOT NULL | Adı |
| status | VARCHAR(20) | NOT NULL | ACIK / ISLENIYOR / TAMAMLANDI |
| close_date | DATE | nullable | Kapanış Tarihi |
| location | VARCHAR(255) | nullable | Yer/Konum |
| notes | TEXT | nullable | Notlar |
| created_by | BIGINT FK | NOT NULL | Oluşturan (oturum açan kullanıcı, otomatik) |
| responsible_user_id | BIGINT FK | nullable | Sorumlu Çalışan |
| created_at | TIMESTAMP | auto | Oluşturma Tarihi |
| updated_at | TIMESTAMP | auto on update | Değişiklik Tarihi |

### Aktivite Numarası Üretimi

`"Z1" + String.format("%04d", id)` — id persist edildikten sonra hesaplanıp kaydedilir.  
Örnek: Z10001, Z10002, Z10999, Z11000

---

## Backend

### Dosyalar

| Dosya | Değişim |
|---|---|
| `entity/Activity.java` | Tamamen yeniden yazılır |
| `dto/ActivityDTO.java` | Tamamen yeniden yazılır |
| `dto/ActivityRequest.java` | Tamamen yeniden yazılır |
| `repository/ActivityRepository.java` | Güncellenir |
| `service/ActivityService.java` | Tamamen yeniden yazılır |
| `controller/ActivityController.java` | Güncellenir |
| `V4__Refactor_Activities.sql` | Yeni migration |

### Entity — `Activity.java`

```java
@Entity @Table(name = "activities")
public class Activity {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String activityNumber;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(nullable = false)
    private String activityType;   // ZIYARET, GOREV, EPOSTA, TELEFON_ARAMASI

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String status;         // ACIK, ISLENIYOR, TAMAMLANDI

    private LocalDate closeDate;
    private String location;

    @Column(length = 2000)
    private String notes;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "responsible_user_id")
    private User responsibleUser;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### ActivityDTO

```
id, activityNumber, customerId, customerName,
contactId, contactName, activityType, name, status,
closeDate, location, notes,
createdByName, responsibleUserId, responsibleUserName,
createdAt, updatedAt
```

### ActivityRequest

```
customerId (required), contactId, activityType (required),
name (required), status, closeDate, location, notes,
responsibleUserId
```

### Repository

```java
List<Activity> findAllByOrderByCreatedAtDesc();
List<Activity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
Optional<Activity> findTopByOrderByIdDesc();  // activity_number üretimi için
```

### Controller Endpoints

```
GET    /activities                          → tüm liste
GET    /activities/{id}                     → detay
GET    /activities/customer/{customerId}    → müşteriye ait
POST   /activities                          → oluştur
PUT    /activities/{id}                     → güncelle
DELETE /activities/{id}                     → sil
```

### ActivityService — Aktivite Numarası Üretimi

```java
// Persist sonrası:
String activityNumber = "Z1" + String.format("%04d", savedActivity.getId());
savedActivity.setActivityNumber(activityNumber);
activityRepository.save(savedActivity);
```

---

## Frontend

### Dosyalar

| Dosya | Değişim |
|---|---|
| `pages/Activities.jsx` | Yeni |
| `services/activityService.js` | Güncellenir |
| `services/userService.js` | Yeni — kullanıcı listesi için |
| `hooks/useActivities.js` | Güncellenir |
| `hooks/useUsers.js` | Yeni — Sorumlu Çalışan Autocomplete için |
| `pages/CustomerDetail.jsx` | Aktiviteler bölümü eklenir |
| `components/Layout.jsx` | Menüye Aktiviteler eklenir |
| `App.jsx` | Route eklenir |

### Activities.jsx — Liste Sayfası

- MUI Table ile liste görünümü
- Kolon sırası: Aktivite No | Adı | Müşteri | Aktivite Tipi | Durum | Sorumlu | Kapanış Tarihi | İşlemler
- Üst bar: arama input (aktivite adı veya müşteri adı) + Durum filtresi (MenuItem) + Aktivite Tipi filtresi + "Yeni Aktivite" butonu
- Her satırda düzenle (EditIcon) ve sil (DeleteIcon) ikonları
- Silme: onay dialog'u
- Oluşturma/düzenleme: modal dialog

### Modal Form — Alan Sırası

1. Müşteri (Autocomplete — customerService.getAll)
2. İlgili Kişi (Autocomplete — müşteri seçilince customer.contacts listesinden filtreler)
3. Aktivite Tipi (Select: Ziyaret / Görev / E-Posta / Telefon Araması)
4. Adı (TextField)
5. Durum (Select: Açık / İşleniyor / Tamamlandı) — default: Açık
6. Kapanış Tarihi (DatePicker / TextField type=date)
7. Sorumlu Çalışan (Autocomplete — userService.getAll)
8. Yer/Konum (TextField)
9. Notlar (TextField multiline)
10. Oluşturan (TextField disabled — oturum açan kullanıcı adı, read-only)

### activityService.js

```js
getAll: () => api.get('/activities'),
getById: (id) => api.get(`/activities/${id}`),
getByCustomer: (customerId) => api.get(`/activities/customer/${customerId}`),
create: (data) => api.post('/activities', data),
update: (id, data) => api.put(`/activities/${id}`, data),
delete: (id) => api.delete(`/activities/${id}`),
```

### useActivities.js

```
useActivities()               → tüm liste
useActivitiesByCustomer(id)   → CustomerDetail için
useCreateActivity()
useUpdateActivity()
useDeleteActivity()
```

### CustomerDetail.jsx — Aktiviteler Bölümü

- Mevcut yapıya uygun Card bölümü olarak eklenir (sekme değil)
- `useActivitiesByCustomer(customerId)` ile yüklenir
- Tablo: Aktivite No | Adı | Tip | Durum | Sorumlu | Kapanış Tarihi | İşlemler
- "Aktivite Ekle" butonu: modal açılır, `customerId` pre-filled ve disabled

### Layout.jsx — Menü

```js
{ path: '/activities', label: 'Aktiviteler', icon: '◎' }
```
Dashboard ve Müşteriler arasına veya Müşteriler'den sonra eklenir.

### App.jsx

```jsx
<Route path="activities" element={<Activities />} />
```

---

## Riskler / Notlar

- `ProjectDetail.jsx` şu an projeye bağlı aktiviteleri gösteriyor. Bu bölüm kaldırılacak (proje-aktivite bağlantısı artık yok).
- `useActivities(projectId)` hook'u tamamen yeniden yazılıyor — mevcut kullanım yerleri güncellenmeli.
- `activityService.getByProject` kaldırılıyor.
- User listesi için `GET /users` endpoint'i ve `userService.js` + `useUsers.js` oluşturulacak. `UserController` yoksa yeni controller eklenir, varsa endpoint eklenir.
- `findTopByOrderByIdDesc()` repository metodu kaldırıldı — aktivite numarası ID persist edildikten sonra hesaplanıp ikinci save ile yazılır.
