-- V5__Products.sql
-- Products table for FiksCRM

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(18,2),
    currency VARCHAR(10) DEFAULT 'TRY',
    unit VARCHAR(50),
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif',
    company_id BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_product_company FOREIGN KEY (company_id) REFERENCES companies(id),
    INDEX idx_products_company (company_id),
    INDEX idx_products_status (status)
);
