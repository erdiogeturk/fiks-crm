package com.fikscrm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_fields",
       uniqueConstraints = @UniqueConstraint(columnNames = {"company_id", "entity_type", "column_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomField {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String entityType;   // CrmEntityType name

    @Column(nullable = false, length = 100)
    private String tableName;

    @Column(nullable = false, length = 100)
    private String columnName;   // cf_xxx in DB

    @Column(nullable = false, length = 255)
    private String label;

    @Column(nullable = false, length = 50)
    private String dataType;     // TEXT | LONG_TEXT | NUMBER | DECIMAL | DATE | DATETIME | BOOLEAN | SELECT

    private Integer fieldLength; // for TEXT type

    @Column(nullable = false)
    @Builder.Default
    private Boolean nullable = true;

    @Column(length = 500)
    private String defaultValue;

    @Column(columnDefinition = "TEXT")
    private String selectOptions; // comma-separated for SELECT type

    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE | INACTIVE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
