package com.fikscrm.repository;

import com.fikscrm.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findAllByCompanyIdOrderByLastNameAscFirstNameAsc(Long companyId);

    @Query("SELECT e FROM Employee e WHERE e.company.id = :companyId AND e.status = 'Aktif' ORDER BY e.lastName, e.firstName")
    List<Employee> findActiveByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT e FROM Employee e WHERE e.company.id = :companyId AND (" +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.lastName)  LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(e.email)     LIKE LOWER(CONCAT('%', :q, '%'))" +
           ") ORDER BY e.lastName, e.firstName")
    List<Employee> search(@Param("companyId") Long companyId, @Param("q") String q);

    boolean existsByEmailAndCompanyIdAndIdNot(String email, Long companyId, Long excludeId);
    boolean existsByRegistrationNoAndCompanyIdAndIdNot(Integer registrationNo, Long companyId, Long excludeId);
}
