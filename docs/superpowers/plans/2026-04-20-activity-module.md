# Activity Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Müşterilere bağlı bağımsız bir aktivite modülü ekle — `/activities` sayfası, CustomerDetail entegrasyonu ve tam CRUD.

**Architecture:** Backend'de mevcut project-centric Activity entity tamamen yeniden yazılır; customer + contact + user ilişkileriyle zenginleştirilir. Frontend'de yeni Activities sayfası, güncellenmiş servis/hook katmanı ve CustomerDetail'e aktiviteler bölümü eklenir.

**Tech Stack:** Spring Boot 3, JPA/Hibernate, Flyway (MySQL), React 18, MUI v5, React Query v5, Axios

---

## File Map

| Dosya | Durum |
|---|---|
| `backend/.../db/migration/V4__Refactor_Activities.sql` | Yeni |
| `backend/.../entity/Activity.java` | Yeniden yaz |
| `backend/.../dto/ActivityDTO.java` | Yeniden yaz |
| `backend/.../dto/ActivityRequest.java` | Yeniden yaz |
| `backend/.../repository/ActivityRepository.java` | Yeniden yaz |
| `backend/.../service/ActivityService.java` | Yeniden yaz |
| `backend/.../controller/ActivityController.java` | Yeniden yaz |
| `backend/.../controller/UserController.java` | Yeni |
| `frontend/src/services/activityService.js` | Güncelle |
| `frontend/src/services/userService.js` | Yeni |
| `frontend/src/hooks/useActivities.js` | Yeniden yaz |
| `frontend/src/hooks/useUsers.js` | Yeni |
| `frontend/src/pages/Activities.jsx` | Yeni |
| `frontend/src/components/Layout.jsx` | Güncelle |
| `frontend/src/App.jsx` | Güncelle |
| `frontend/src/pages/CustomerDetail.jsx` | Güncelle |
| `frontend/src/pages/ProjectDetail.jsx` | Güncelle (eski activity kısmı kaldır) |

---

## Task 1: DB Migration

**Files:**
- Create: `backend/src/main/resources/db/migration/V4__Refactor_Activities.sql`

- [ ] **Adım 1: Migration dosyasını oluştur**

```sql
-- V4__Refactor_Activities.sql

DROP TABLE IF EXISTS activities;

CREATE TABLE activities (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_number     VARCHAR(20) NOT NULL,
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
    FOREIGN KEY (contact_id)          REFERENCES contacts(id)  ON DELETE SET NULL,
    FOREIGN KEY (created_by)          REFERENCES users(id)     ON DELETE RESTRICT,
    FOREIGN KEY (responsible_user_id) REFERENCES users(id)     ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_activities_activity_number ON activities(activity_number);
CREATE INDEX idx_activities_customer_id            ON activities(customer_id);
CREATE INDEX idx_activities_status                 ON activities(status);
CREATE INDEX idx_activities_activity_type          ON activities(activity_type);
CREATE INDEX idx_activities_created_at             ON activities(created_at DESC);
```

- [ ] **Adım 2: Backend'i başlat ve migration'ın uygulandığını doğrula**

```bash
# Backend dizininde:
cd /Users/ersinozdemir/FIKS-AI/FiksCrm/backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw spring-boot:run > /tmp/backend.log 2>&1 &
sleep 15
curl -s http://localhost:8080/health
```

Beklenen: `{"status":"UP"}` veya benzeri. Log'da `V4__Refactor_Activities` applied görünmeli.

- [ ] **Adım 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V4__Refactor_Activities.sql
git commit -m "feat: V4 migration — aktivite tablosunu müşteri bazlı olarak yeniden oluştur"
```

---

## Task 2: Activity Entity

**Files:**
- Modify: `backend/src/main/java/com/fikscrm/entity/Activity.java`

- [ ] **Adım 1: Entity'yi yeniden yaz**

```java
package com.fikscrm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String activityNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(nullable = false)
    private String activityType;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String status;

    private LocalDate closeDate;
    private String location;

    @Column(length = 2000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
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

- [ ] **Adım 2: Commit**

```bash
git add backend/src/main/java/com/fikscrm/entity/Activity.java
git commit -m "feat: Activity entity'yi müşteri bazlı olarak yeniden yaz"
```

---

## Task 3: Activity DTOs

**Files:**
- Modify: `backend/src/main/java/com/fikscrm/dto/ActivityDTO.java`
- Modify: `backend/src/main/java/com/fikscrm/dto/ActivityRequest.java`

- [ ] **Adım 1: ActivityDTO'yu yeniden yaz**

```java
package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    private String activityNumber;
    private Long customerId;
    private String customerName;
    private Long contactId;
    private String contactName;
    private String activityType;
    private String name;
    private String status;
    private LocalDate closeDate;
    private String location;
    private String notes;
    private Long createdById;
    private String createdByName;
    private Long responsibleUserId;
    private String responsibleUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

- [ ] **Adım 2: ActivityRequest'i yeniden yaz**

```java
package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ActivityRequest {

    @NotNull(message = "Müşteri zorunludur")
    private Long customerId;

    private Long contactId;

    @NotBlank(message = "Aktivite tipi zorunludur")
    private String activityType;

    @NotBlank(message = "Aktivite adı zorunludur")
    private String name;

    private String status;
    private LocalDate closeDate;
    private String location;
    private String notes;
    private Long responsibleUserId;
}
```

- [ ] **Adım 3: Commit**

```bash
git add backend/src/main/java/com/fikscrm/dto/ActivityDTO.java \
        backend/src/main/java/com/fikscrm/dto/ActivityRequest.java
git commit -m "feat: ActivityDTO ve ActivityRequest'i yeni alan yapısına göre güncelle"
```

---

## Task 4: ActivityRepository

**Files:**
- Modify: `backend/src/main/java/com/fikscrm/repository/ActivityRepository.java`

- [ ] **Adım 1: Repository'yi yeniden yaz**

```java
package com.fikscrm.repository;

import com.fikscrm.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findAllByOrderByCreatedAtDesc();

    List<Activity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
```

- [ ] **Adım 2: Commit**

```bash
git add backend/src/main/java/com/fikscrm/repository/ActivityRepository.java
git commit -m "feat: ActivityRepository'yi müşteri bazlı sorgularla güncelle"
```

---

## Task 5: ActivityService

**Files:**
- Modify: `backend/src/main/java/com/fikscrm/service/ActivityService.java`

- [ ] **Adım 1: ActivityService'i yeniden yaz**

```java
package com.fikscrm.service;

import com.fikscrm.dto.ActivityDTO;
import com.fikscrm.dto.ActivityRequest;
import com.fikscrm.entity.*;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public List<ActivityDTO> getAllActivities() {
        return activityRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ActivityDTO> getActivitiesByCustomer(Long customerId) {
        return activityRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ActivityDTO getActivityById(Long id) {
        return mapToDTO(findById(id));
    }

    @Transactional
    public ActivityDTO createActivity(ActivityRequest request) {
        User currentUser = getCurrentUser();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Contact contact = null;
        if (request.getContactId() != null) {
            contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", request.getContactId()));
        }

        User responsibleUser = null;
        if (request.getResponsibleUserId() != null) {
            responsibleUser = userRepository.findById(request.getResponsibleUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getResponsibleUserId()));
        }

        Activity activity = Activity.builder()
                .activityNumber("TEMP")
                .customer(customer)
                .contact(contact)
                .activityType(request.getActivityType())
                .name(request.getName())
                .status(request.getStatus() != null ? request.getStatus() : "ACIK")
                .closeDate(request.getCloseDate())
                .location(request.getLocation())
                .notes(request.getNotes())
                .createdBy(currentUser)
                .responsibleUser(responsibleUser)
                .build();

        activity = activityRepository.save(activity);
        activity.setActivityNumber("Z1" + String.format("%04d", activity.getId()));
        activity = activityRepository.save(activity);
        return mapToDTO(activity);
    }

    @Transactional
    public ActivityDTO updateActivity(Long id, ActivityRequest request) {
        Activity activity = findById(id);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Contact contact = null;
        if (request.getContactId() != null) {
            contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", request.getContactId()));
        }

        User responsibleUser = null;
        if (request.getResponsibleUserId() != null) {
            responsibleUser = userRepository.findById(request.getResponsibleUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getResponsibleUserId()));
        }

        activity.setCustomer(customer);
        activity.setContact(contact);
        activity.setActivityType(request.getActivityType());
        activity.setName(request.getName());
        if (request.getStatus() != null) activity.setStatus(request.getStatus());
        activity.setCloseDate(request.getCloseDate());
        activity.setLocation(request.getLocation());
        activity.setNotes(request.getNotes());
        activity.setResponsibleUser(responsibleUser);

        return mapToDTO(activityRepository.save(activity));
    }

    @Transactional
    public void deleteActivity(Long id) {
        activityRepository.delete(findById(id));
    }

    private Activity findById(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private ActivityDTO mapToDTO(Activity a) {
        return ActivityDTO.builder()
                .id(a.getId())
                .activityNumber(a.getActivityNumber())
                .customerId(a.getCustomer().getId())
                .customerName(a.getCustomer().getName())
                .contactId(a.getContact() != null ? a.getContact().getId() : null)
                .contactName(a.getContact() != null ? a.getContact().getName() : null)
                .activityType(a.getActivityType())
                .name(a.getName())
                .status(a.getStatus())
                .closeDate(a.getCloseDate())
                .location(a.getLocation())
                .notes(a.getNotes())
                .createdById(a.getCreatedBy().getId())
                .createdByName(a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName())
                .responsibleUserId(a.getResponsibleUser() != null ? a.getResponsibleUser().getId() : null)
                .responsibleUserName(a.getResponsibleUser() != null ?
                        a.getResponsibleUser().getFirstName() + " " + a.getResponsibleUser().getLastName() : null)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
```

- [ ] **Adım 2: Commit**

```bash
git add backend/src/main/java/com/fikscrm/service/ActivityService.java
git commit -m "feat: ActivityService'i müşteri bazlı, aktivite numarası üretimiyle yeniden yaz"
```

---

## Task 6: ActivityController

**Files:**
- Modify: `backend/src/main/java/com/fikscrm/controller/ActivityController.java`

- [ ] **Adım 1: Controller'ı yeniden yaz**

```java
package com.fikscrm.controller;

import com.fikscrm.dto.ActivityDTO;
import com.fikscrm.dto.ActivityRequest;
import com.fikscrm.dto.ApiResponse;
import com.fikscrm.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getAllActivities() {
        return ResponseEntity.ok(ApiResponse.success(activityService.getAllActivities()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDTO>> getActivityById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getActivityById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getActivitiesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getActivitiesByCustomer(customerId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityDTO>> createActivity(@Valid @RequestBody ActivityRequest request) {
        ActivityDTO activity = activityService.createActivity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Aktivite oluşturuldu", activity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDTO>> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Aktivite güncellendi", activityService.updateActivity(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.ok(ApiResponse.success("Aktivite silindi", null));
    }
}
```

- [ ] **Adım 2: Commit**

```bash
git add backend/src/main/java/com/fikscrm/controller/ActivityController.java
git commit -m "feat: ActivityController'ı yeni endpoint'lerle güncelle"
```

---

## Task 7: UserController

Frontend'deki Sorumlu Çalışan autocomplete için kullanıcı listesi endpoint'i.

**Files:**
- Create: `backend/src/main/java/com/fikscrm/controller/UserController.java`

- [ ] **Adım 1: UserController oluştur**

```java
package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.UserDTO;
import com.fikscrm.entity.User;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll()
                .stream()
                .filter(User::isEnabled)
                .map(u -> UserDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
```

- [ ] **Adım 2: Backend'i yeniden başlat ve endpoint'leri test et**

```bash
# Çalışan backend'i durdur:
pkill -f "spring-boot" || true
sleep 3

# Yeniden başlat:
cd /Users/ersinozdemir/FIKS-AI/FiksCrm/backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./mvnw spring-boot:run > /tmp/backend.log 2>&1 &
sleep 20

# Token al:
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# Kullanıcı listesi:
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/users | python3 -m json.tool

# Aktivite listesi (boş olmalı):
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/activities | python3 -m json.tool
```

Beklenen: Users listesi 200 döner, activities boş liste döner.

- [ ] **Adım 3: Commit**

```bash
git add backend/src/main/java/com/fikscrm/controller/UserController.java
git commit -m "feat: UserController — aktif kullanıcı listesi endpoint'i ekle"
```

---

## Task 8: Frontend Services

**Files:**
- Modify: `frontend/src/services/activityService.js`
- Create: `frontend/src/services/userService.js`

- [ ] **Adım 1: activityService.js'i güncelle**

```js
import api from './api'

export const activityService = {
  getAll: () => api.get('/activities'),
  getById: (id) => api.get(`/activities/${id}`),
  getByCustomer: (customerId) => api.get(`/activities/customer/${customerId}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
}
```

- [ ] **Adım 2: userService.js oluştur**

```js
import api from './api'

export const userService = {
  getAll: () => api.get('/users'),
}
```

- [ ] **Adım 3: Commit**

```bash
git add frontend/src/services/activityService.js \
        frontend/src/services/userService.js
git commit -m "feat: activityService güncelle, userService ekle"
```

---

## Task 9: Frontend Hooks

**Files:**
- Modify: `frontend/src/hooks/useActivities.js`
- Create: `frontend/src/hooks/useUsers.js`

- [ ] **Adım 1: useActivities.js'i yeniden yaz**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '../services/activityService'

export const useActivities = () => {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getAll().then(res => res.data.data),
  })
}

export const useActivitiesByCustomer = (customerId) => {
  return useQuery({
    queryKey: ['activities', 'customer', customerId],
    queryFn: () => activityService.getByCustomer(customerId).then(res => res.data.data),
    enabled: !!customerId,
  })
}

export const useCreateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => activityService.create(data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: ['activities', 'customer', variables.customerId] })
      }
    },
  })
}

export const useUpdateActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => activityService.update(id, data).then(res => res.data.data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      if (updated.customerId) {
        queryClient.invalidateQueries({ queryKey: ['activities', 'customer', updated.customerId] })
      }
    },
  })
}

export const useDeleteActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }) => activityService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
```

- [ ] **Adım 2: useUsers.js oluştur**

```js
import { useQuery } from '@tanstack/react-query'
import { userService } from '../services/userService'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll().then(res => res.data.data),
  })
}
```

- [ ] **Adım 3: Commit**

```bash
git add frontend/src/hooks/useActivities.js \
        frontend/src/hooks/useUsers.js
git commit -m "feat: useActivities hook'unu yeniden yaz, useUsers hook'u ekle"
```

---

## Task 10: Activities.jsx Sayfası

**Files:**
- Create: `frontend/src/pages/Activities.jsx`

- [ ] **Adım 1: Activities.jsx dosyasını oluştur**

```jsx
import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Skeleton, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Autocomplete,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '../hooks/useActivities'
import { useCustomers, useCustomer } from '../hooks/useCustomers'
import { useUsers } from '../hooks/useUsers'
import { getUser } from '../services/authService'

const ACTIVITY_TYPES = [
  { value: 'ZIYARET', label: 'Ziyaret' },
  { value: 'GOREV', label: 'Görev' },
  { value: 'EPOSTA', label: 'E-Posta' },
  { value: 'TELEFON_ARAMASI', label: 'Telefon Araması' },
]

const STATUS_OPTIONS = [
  { value: 'ACIK', label: 'Açık' },
  { value: 'ISLENIYOR', label: 'İşleniyor' },
  { value: 'TAMAMLANDI', label: 'Tamamlandı' },
]

const statusConfig = {
  ACIK: { label: 'Açık', color: '#2563eb', bg: '#eff6ff' },
  ISLENIYOR: { label: 'İşleniyor', color: '#d97706', bg: '#fffbeb' },
  TAMAMLANDI: { label: 'Tamamlandı', color: '#059669', bg: '#ecfdf5' },
}

const typeConfig = {
  ZIYARET: { label: 'Ziyaret', color: '#7c3aed', bg: '#f5f3ff' },
  GOREV: { label: 'Görev', color: '#0284c7', bg: '#e0f2fe' },
  EPOSTA: { label: 'E-Posta', color: '#be185d', bg: '#fce7f3' },
  TELEFON_ARAMASI: { label: 'Telefon Araması', color: '#059669', bg: '#ecfdf5' },
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const emptyForm = {
  customerId: null,
  contactId: null,
  activityType: 'ZIYARET',
  name: '',
  status: 'ACIK',
  closeDate: '',
  location: '',
  notes: '',
  responsibleUserId: null,
}

// İç bileşen: seçili müşterinin contacts listesini çeker
const ContactAutocomplete = ({ customerId, value, onChange }) => {
  const { data: customer } = useCustomer(customerId)
  const contacts = customer?.contacts || []

  return (
    <Autocomplete
      options={contacts}
      getOptionLabel={(o) => o.name || ''}
      value={contacts.find(c => c.id === value) || null}
      onChange={(_, v) => onChange(v ? v.id : null)}
      disabled={!customerId}
      renderInput={(params) => (
        <TextField {...params} label="İlgili Kişi" size="small"
          helperText={!customerId ? 'Önce müşteri seçin' : ''}
        />
      )}
    />
  )
}

const Activities = () => {
  const currentUser = getUser()
  const { data: activities, isLoading } = useActivities()
  const { data: customers = [] } = useCustomers()
  const { data: users = [] } = useUsers()
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()
  const deleteActivity = useDeleteActivity()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const filtered = useMemo(() => {
    if (!activities) return []
    return activities.filter(a => {
      const matchSearch = !search ||
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        a.activityNumber?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || a.status === statusFilter
      const matchType = !typeFilter || a.activityType === typeFilter
      return matchSearch && matchStatus && matchType
    })
  }, [activities, search, statusFilter, typeFilter])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (activity) => {
    setEditingId(activity.id)
    setForm({
      customerId: activity.customerId,
      contactId: activity.contactId || null,
      activityType: activity.activityType,
      name: activity.name,
      status: activity.status,
      closeDate: activity.closeDate || '',
      location: activity.location || '',
      notes: activity.notes || '',
      responsibleUserId: activity.responsibleUserId || null,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      ...form,
      closeDate: form.closeDate || null,
    }
    try {
      if (editingId) {
        await updateActivity.mutateAsync({ id: editingId, data: payload })
      } else {
        await createActivity.mutateAsync(payload)
      }
      setDialogOpen(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteActivity.mutateAsync({ id: deleteConfirmId })
      setDeleteConfirmId(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Aktiviteler</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Yeni Aktivite
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth size="small" placeholder="Aktivite adı, müşteri veya numara ara..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField select fullWidth size="small" label="Durum" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField select fullWidth size="small" label="Aktivite Tipi" value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {ACTIVITY_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Aktivite No</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Adı</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Müşteri</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Sorumlu</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Kapanış</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map(activity => {
                    const sc = statusConfig[activity.status] || { label: activity.status, color: '#6b7280', bg: '#f3f4f6' }
                    const tc = typeConfig[activity.activityType] || { label: activity.activityType, color: '#6b7280', bg: '#f3f4f6' }
                    return (
                      <TableRow key={activity.id} hover>
                        <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
                          {activity.activityNumber}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>{activity.name}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{activity.customerName}</TableCell>
                        <TableCell>
                          <Chip label={tc.label} size="small"
                            sx={{ bgcolor: tc.bg, color: tc.color, fontWeight: 600, fontSize: 11, height: 20 }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={sc.label} size="small"
                            sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: 11, height: 20 }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{activity.responsibleUserName || '-'}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{formatDate(activity.closeDate)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEdit(activity)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirmId(activity.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
              }
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Aktivite bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Aktivite Düzenle' : 'Yeni Aktivite'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={customers}
                getOptionLabel={(o) => o.name || ''}
                value={customers.find(c => c.id === form.customerId) || null}
                onChange={(_, v) => setForm({ ...form, customerId: v ? v.id : null, contactId: null })}
                disabled={!!editingId}
                renderInput={(params) => <TextField {...params} label="Müşteri *" size="small" />}
              />
            </Grid>
            <Grid item xs={12}>
              <ContactAutocomplete
                customerId={form.customerId}
                value={form.contactId}
                onChange={(v) => setForm({ ...form, contactId: v })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Aktivite Tipi *"
                value={form.activityType}
                onChange={e => setForm({ ...form, activityType: e.target.value })}>
                {ACTIVITY_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Durum"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Adı *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Kapanış Tarihi" type="date"
                value={form.closeDate}
                onChange={e => setForm({ ...form, closeDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={users}
                getOptionLabel={(u) => u ? `${u.firstName} ${u.lastName}` : ''}
                value={users.find(u => u.id === form.responsibleUserId) || null}
                onChange={(_, v) => setForm({ ...form, responsibleUserId: v ? v.id : null })}
                renderInput={(params) => <TextField {...params} label="Sorumlu Çalışan" size="small" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Yer / Konum"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notlar" multiline rows={3}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Oluşturan" disabled
                value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button variant="contained"
            onClick={handleSave}
            disabled={!form.customerId || !form.name || !form.activityType || createActivity.isPending || updateActivity.isPending}>
            {editingId ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Aktiviteyi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu aktiviteyi silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Activities
```

- [ ] **Adım 2: Commit**

```bash
git add frontend/src/pages/Activities.jsx
git commit -m "feat: Activities.jsx sayfasını oluştur — liste, filtreleme, create/edit/delete modal"
```

---

## Task 11: Layout ve App Routing

**Files:**
- Modify: `frontend/src/components/Layout.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Adım 1: Layout.jsx'e Aktiviteler menüsünü ekle**

`frontend/src/components/Layout.jsx` dosyasında `menuItems` dizisini güncelle:

```js
const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '◉' },
  { path: '/customers', label: 'Müşteriler', icon: '👥' },
  { path: '/activities', label: 'Aktiviteler', icon: '◎' },
  { path: '/projects', label: 'Projeler', icon: '≡' },
  { path: '/pipeline', label: 'Pipeline', icon: '▊' },
]
```

- [ ] **Adım 2: App.jsx'e route ekle**

`frontend/src/App.jsx` dosyasında:
1. Import satırına ekle:
```jsx
import Activities from './pages/Activities'
```
2. Route'lar arasına ekle (customers route'larının altına):
```jsx
<Route path="activities" element={<Activities />} />
```

- [ ] **Adım 3: Commit**

```bash
git add frontend/src/components/Layout.jsx \
        frontend/src/App.jsx
git commit -m "feat: Aktiviteler menü item ve route ekle"
```

---

## Task 12: CustomerDetail — Aktiviteler Bölümü

**Files:**
- Modify: `frontend/src/pages/CustomerDetail.jsx`

- [ ] **Adım 1: Import'ları ekle**

Mevcut import listesine şunları ekle:

```jsx
import { useActivitiesByCustomer, useCreateActivity, useDeleteActivity } from '../hooks/useActivities'
import { useUsers } from '../hooks/useUsers'
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip,
} from '@mui/material'
import { Event as ActivityIcon } from '@mui/icons-material'
```

- [ ] **Adım 2: Hook'ları ve state'i bileşen içine ekle**

`CustomerDetail` bileşeni içinde, mevcut `const createProject = useCreateProject()` satırının altına ekle:

```jsx
const { data: activities = [] } = useActivitiesByCustomer(id)
const { data: users = [] } = useUsers()
const createActivityMutation = useCreateActivity()
const deleteActivityMutation = useDeleteActivity()

const [activityDialogOpen, setActivityDialogOpen] = useState(false)
const [activityForm, setActivityForm] = useState({
  activityType: 'ZIYARET',
  name: '',
  status: 'ACIK',
  closeDate: '',
  location: '',
  notes: '',
  responsibleUserId: null,
})
```

- [ ] **Adım 3: Aktivite oluşturma handler ekle**

`handleCreateProject` fonksiyonunun altına ekle:

```jsx
const handleCreateActivity = async () => {
  try {
    await createActivityMutation.mutateAsync({
      customerId: customer.id,
      contactId: null,
      ...activityForm,
      closeDate: activityForm.closeDate || null,
    })
    setActivityDialogOpen(false)
    setActivityForm({
      activityType: 'ZIYARET',
      name: '',
      status: 'ACIK',
      closeDate: '',
      location: '',
      notes: '',
      responsibleUserId: null,
    })
  } catch (error) {
    console.error('Error creating activity:', error)
  }
}

const handleDeleteActivity = async (activityId) => {
  try {
    await deleteActivityMutation.mutateAsync({ id: activityId })
  } catch (error) {
    console.error('Error deleting activity:', error)
  }
}
```

- [ ] **Adım 4: Aktiviteler bölümünü JSX'e ekle**

Projeler bölümünü gösteren `<Card>` bloğunun hemen **altına** (return içinde) şu bloğu ekle:

```jsx
{/* Aktiviteler */}
<Card sx={{ mb: 3 }}>
  <CardContent sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" fontWeight={600}>
        Aktiviteler ({activities.length})
      </Typography>
      <Button size="small" startIcon={<AddIcon />} variant="outlined"
        onClick={() => setActivityDialogOpen(true)}>
        Aktivite Ekle
      </Button>
    </Box>

    {activities.length > 0 ? (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>No</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Adı</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Tip</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Sorumlu</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Kapanış</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map(activity => (
              <TableRow key={activity.id} hover>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'primary.main' }}>
                  {activity.activityNumber}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{activity.name}</TableCell>
                <TableCell>
                  <Chip label={
                    { ZIYARET: 'Ziyaret', GOREV: 'Görev', EPOSTA: 'E-Posta', TELEFON_ARAMASI: 'Telefon' }[activity.activityType] || activity.activityType
                  } size="small" variant="outlined" color="primary" sx={{ fontSize: 11, height: 20 }} />
                </TableCell>
                <TableCell>
                  <Chip label={
                    { ACIK: 'Açık', ISLENIYOR: 'İşleniyor', TAMAMLANDI: 'Tamamlandı' }[activity.status] || activity.status
                  } size="small" sx={{
                    fontSize: 11, height: 20,
                    bgcolor: activity.status === 'TAMAMLANDI' ? '#ecfdf5' : activity.status === 'ISLENIYOR' ? '#fffbeb' : '#eff6ff',
                    color: activity.status === 'TAMAMLANDI' ? '#059669' : activity.status === 'ISLENIYOR' ? '#d97706' : '#2563eb',
                  }} />
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>{activity.responsibleUserName || '-'}</TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {activity.closeDate ? new Date(activity.closeDate).toLocaleDateString('tr-TR') : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error"
                    onClick={() => handleDeleteActivity(activity.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        Henüz aktivite yok
      </Typography>
    )}
  </CardContent>
</Card>

{/* Aktivite Oluşturma Dialog */}
<Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Aktivite Ekle</DialogTitle>
  <DialogContent>
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12} sm={6}>
        <TextField select fullWidth size="small" label="Aktivite Tipi *"
          value={activityForm.activityType}
          onChange={e => setActivityForm({ ...activityForm, activityType: e.target.value })}>
          <MenuItem value="ZIYARET">Ziyaret</MenuItem>
          <MenuItem value="GOREV">Görev</MenuItem>
          <MenuItem value="EPOSTA">E-Posta</MenuItem>
          <MenuItem value="TELEFON_ARAMASI">Telefon Araması</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField select fullWidth size="small" label="Durum"
          value={activityForm.status}
          onChange={e => setActivityForm({ ...activityForm, status: e.target.value })}>
          <MenuItem value="ACIK">Açık</MenuItem>
          <MenuItem value="ISLENIYOR">İşleniyor</MenuItem>
          <MenuItem value="TAMAMLANDI">Tamamlandı</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth size="small" label="Adı *"
          value={activityForm.name}
          onChange={e => setActivityForm({ ...activityForm, name: e.target.value })} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth size="small" label="Kapanış Tarihi" type="date"
          value={activityForm.closeDate}
          onChange={e => setActivityForm({ ...activityForm, closeDate: e.target.value })}
          InputLabelProps={{ shrink: true }} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Autocomplete
          options={users}
          getOptionLabel={(u) => u ? `${u.firstName} ${u.lastName}` : ''}
          value={users.find(u => u.id === activityForm.responsibleUserId) || null}
          onChange={(_, v) => setActivityForm({ ...activityForm, responsibleUserId: v ? v.id : null })}
          renderInput={(params) => <TextField {...params} label="Sorumlu Çalışan" size="small" />}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth size="small" label="Yer / Konum"
          value={activityForm.location}
          onChange={e => setActivityForm({ ...activityForm, location: e.target.value })} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth size="small" label="Notlar" multiline rows={3}
          value={activityForm.notes}
          onChange={e => setActivityForm({ ...activityForm, notes: e.target.value })} />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setActivityDialogOpen(false)}>İptal</Button>
    <Button variant="contained"
      onClick={handleCreateActivity}
      disabled={!activityForm.name}>
      Oluştur
    </Button>
  </DialogActions>
</Dialog>
```

- [ ] **Adım 5: Commit**

```bash
git add frontend/src/pages/CustomerDetail.jsx
git commit -m "feat: CustomerDetail'e aktiviteler bölümü ve aktivite ekleme dialog'u ekle"
```

---

## Task 13: ProjectDetail — Eski Aktivite Kodunu Kaldır

**Files:**
- Modify: `frontend/src/pages/ProjectDetail.jsx`

- [ ] **Adım 1: useActivities import'unu kaldır**

`ProjectDetail.jsx` dosyasında şu satırı sil:
```jsx
import { useActivities, useCreateActivity, useDeleteActivity } from '../hooks/useActivities'
```

- [ ] **Adım 2: Aktivite state ve hook'larını kaldır**

Bileşen içinden şu satırları sil:
```jsx
const { data: activities } = useActivities(id)
const createActivity = useCreateActivity()
const deleteActivity = useDeleteActivity()
const [activityDialogOpen, setActivityDialogOpen] = useState(false)
const [activityForm, setActivityForm] = useState({...})
```

- [ ] **Adım 3: handleCreateActivity ve handleDeleteActivity fonksiyonlarını kaldır**

- [ ] **Adım 4: JSX'ten aktivite bölümünü ve dialog'unu kaldır**

`Aktiviteler ({activities?.length || 0})` başlıklı `<Card>` bloğunu ve aktivite oluşturma `<Dialog>` bloğunu sil.

- [ ] **Adım 5: Compile hatası olmadığını kontrol et**

```bash
cd /Users/ersinozdemir/FIKS-AI/FiksCrm/frontend
npm run build 2>&1 | tail -20
```

Beklenen: build başarılı, hata yok.

- [ ] **Adım 6: Commit**

```bash
git add frontend/src/pages/ProjectDetail.jsx
git commit -m "refactor: ProjectDetail'den eski proje bazlı aktivite bölümünü kaldır"
```

---

## Task 14: Son Doğrulama

- [ ] **Adım 1: Backend sağlıklı mı?**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# Aktivite oluştur:
curl -s -X POST http://localhost:8080/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":1,"activityType":"ZIYARET","name":"Test Ziyareti","status":"ACIK"}' | python3 -m json.tool

# Listeleme:
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/activities | python3 -m json.tool
```

Beklenen: `activityNumber: "Z10001"` içeren kayıt döner.

- [ ] **Adım 2: Frontend'i başlat ve UI'ı doğrula**

```bash
cd /Users/ersinozdemir/FIKS-AI/FiksCrm/frontend
npm run dev
```

Kontrol listesi:
- [ ] Sidebar'da "Aktiviteler" menüsü görünüyor
- [ ] `/activities` sayfası açılıyor, tablo var
- [ ] "Yeni Aktivite" butonu modal açıyor
- [ ] Müşteri seçilince İlgili Kişi dropdown aktif hale geliyor
- [ ] Aktivite oluşturulunca listede görünüyor (Z10001 formatında)
- [ ] Düzenle ikonu mevcut veriyi formda gösteriyor
- [ ] Sil onay dialog'u çalışıyor
- [ ] CustomerDetail'de Aktiviteler bölümü görünüyor
- [ ] CustomerDetail'den aktivite ekleniyor

- [ ] **Adım 3: Final commit**

```bash
git add -A
git commit -m "feat: aktivite modülü tamamlandı — bağımsız sayfa, CustomerDetail entegrasyonu, tam CRUD"
```
