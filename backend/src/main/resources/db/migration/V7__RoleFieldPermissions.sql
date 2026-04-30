CREATE TABLE role_field_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    role_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    permission VARCHAR(10) NOT NULL DEFAULT 'READ',
    CONSTRAINT fk_rfp_company FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE KEY uq_rfp (company_id, role_type, table_name, column_name),
    INDEX idx_rfp_company_role (company_id, role_type)
);
