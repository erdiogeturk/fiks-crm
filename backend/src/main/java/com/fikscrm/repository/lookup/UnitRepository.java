package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<Unit> findByIdAndCompanyId(Long id, Long companyId);
    List<Unit> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT u FROM Unit u WHERE u.company.id = :companyId AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(u.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Unit> search(Long companyId, String q);
}
