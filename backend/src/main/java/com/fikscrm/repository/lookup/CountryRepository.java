package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {
    List<Country> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<Country> findByIdAndCompanyId(Long id, Long companyId);
    List<Country> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT c FROM Country c WHERE c.company.id = :companyId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Country> search(Long companyId, String q);
}
