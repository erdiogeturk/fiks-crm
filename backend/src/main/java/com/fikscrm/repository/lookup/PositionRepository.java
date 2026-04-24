package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<Position> findByIdAndCompanyId(Long id, Long companyId);
    List<Position> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT p FROM Position p WHERE p.company.id = :companyId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Position> search(Long companyId, String q);
}
