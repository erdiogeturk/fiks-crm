package com.fikscrm.repository.lookup;

import com.fikscrm.entity.lookup.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByCompanyIdOrderByNameAsc(Long companyId);
    Optional<City> findByIdAndCompanyId(Long id, Long companyId);
    List<City> findByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);
    List<City> findByCountryIdAndCompanyIdAndStatusOrderByNameAsc(Long countryId, Long companyId, String status);
    boolean existsByCodeAndCompanyId(String code, Long companyId);

    @Query("SELECT c FROM City c WHERE c.company.id = :companyId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<City> search(Long companyId, String q);
}
