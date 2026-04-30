package com.fikscrm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "role_field_permissions",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_rfp",
        columnNames = {"company_id", "role_type", "table_name", "column_name"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleFieldPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "role_type", nullable = false, length = 50)
    private String roleType;

    @Column(name = "table_name", nullable = false, length = 100)
    private String tableName;

    @Column(name = "column_name", nullable = false, length = 100)
    private String columnName;

    /** READ, WRITE, or NONE. Absence of a row implies NONE. */
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String permission = "READ";
}
