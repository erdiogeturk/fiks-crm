-- V2__Seed_Data.sql
-- Seed data for FiksCRM (MySQL)

-- Create default company
INSERT INTO companies (name, active) VALUES ('FiksCRM', true);

-- Create default admin user (password: admin123)
-- BCrypt hash for 'admin123'
INSERT INTO users (username, password, first_name, last_name, email, role, company_id, enabled)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye6IUH1q7gxLQkT3T3xHxkPHqYY3GLOc6', 'System', 'Admin', 'admin@fikscrm.com', 'SUPER_ADMIN', 1, true);
