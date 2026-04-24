package com.fikscrm.repository;

import com.fikscrm.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<Organization> findByIdAndCompanyId(Long id, Long companyId);

    // Active orgs where validFrom <= today — used for parent search help
    @Query("SELECT o FROM Organization o WHERE o.company.id = :companyId AND o.status = 'Aktif' " +
           "AND (o.validFrom IS NULL OR o.validFrom <= :today) ORDER BY o.name ASC")
    List<Organization> findActiveForSearchHelp(Long companyId, LocalDate today);

    @Query("SELECT o FROM Organization o WHERE o.company.id = :companyId AND " +
           "(LOWER(o.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(o.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Organization> search(Long companyId, String q);
}
