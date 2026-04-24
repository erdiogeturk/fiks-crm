package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<District> findByIdAndCompanyId(Long id, Long companyId);
    List<District> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    List<District> findByCityIdAndCompanyIdAndStatusOrderByNameAsc(Long cityId, Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT d FROM District d WHERE d.company.id = :companyId AND " +
           "(LOWER(d.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(d.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<District> search(Long companyId, String q);
}
