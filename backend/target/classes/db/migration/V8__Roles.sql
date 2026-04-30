-- V8__Roles.sql
-- Dynamic roles table — allows creating company-specific custom roles.
-- System roles are pre-seeded and cannot be deleted.

CREATE TABLE roles (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT       NOT NULL,
    name       VARCHAR(100) NOT NULL,
    label      VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_system  BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_role_company_name UNIQUE (company_id, name),
    CONSTRAINT fk_roles_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX idx_roles_company ON roles(company_id);

-- Seed system roles for every existing company
INSERT INTO roles (company_id, name, label, description, is_system)
SELECT id, 'SUPER_ADMIN',    'Süper Yönetici',     'Tüm sistem yetkilerine sahip.', TRUE  FROM companies;

INSERT INTO roles (company_id, name, label, description, is_system)
SELECT id, 'COMPANY_ADMIN',  'Şirket Yöneticisi',  'Tüm modüllere tam erişim. Kullanıcı ve ayar yönetimi yapabilir.', TRUE FROM companies;

INSERT INTO roles (company_id, name, label, description, is_system)
SELECT id, 'SALES_PERSON',   'Satış Temsilcisi',   'Müşteri, aktivite ve satış belgelerine erişim. Sistem ayarlarına erişemez.', TRUE FROM companies;

INSERT INTO roles (company_id, name, label, description, is_system)
SELECT id, 'READ_ONLY',      'Salt Okunur',        'Tüm verileri görüntüleyebilir, düzenleme ve silme işlemi yapamaz.', TRUE FROM companies;
