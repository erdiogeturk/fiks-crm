package com.fikscrm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "roles",
    uniqueConstraints = @UniqueConstraint(name = "uq_role_company_name", columnNames = {"company_id", "name"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Internal key stored in users.role (e.g. COMPANY_ADMIN, CUSTOM_MANAGER) */
    @Column(nullable = false, length = 100)
    private String name;

    /** Turkish display label */
    @Column(nullable = false, length = 100)
    private String label;

    @Column(length = 255)
    private String description;

    /** System roles cannot be deleted */
    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private boolean system = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Taslak";

    @Column(length = 100)
    private String createdBy;

    @Column(length = 100)
    private String updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
