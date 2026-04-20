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
