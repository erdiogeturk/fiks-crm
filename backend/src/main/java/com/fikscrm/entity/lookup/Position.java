package com.fikscrm.entity.lookup;

import com.fikscrm.entity.Company;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lkp_positions", uniqueConstraints = @UniqueConstraint(columnNames = {"code", "company_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Position {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 256)
    private String name;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Aktif";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
