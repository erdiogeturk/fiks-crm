package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.CurrencyDef;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CurrencyDefRepository extends JpaRepository<CurrencyDef, Long> {
    List<CurrencyDef> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<CurrencyDef> findByIdAndCompanyId(Long id, Long companyId);
    List<CurrencyDef> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT c FROM CurrencyDef c WHERE c.company.id = :companyId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<CurrencyDef> search(Long companyId, String q);
}
