package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Long> {
    List<Region> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<Region> findByIdAndCompanyId(Long id, Long companyId);
    List<Region> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    List<Region> findByCountryIdAndCompanyIdAndStatusOrderByNameAsc(Long countryId, Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT r FROM Region r WHERE r.company.id = :companyId AND " +
           "(LOWER(r.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Region> search(Long companyId, String q);
}
