package com.fikscrm.repository;

import com.fikscrm.entity.Project;
import com.fikscrm.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByCompanyIdOrderByDateDesc(Long companyId);
    
    List<Project> findByCustomerIdOrderByDateDesc(Long customerId);
    
    List<Project> findByCompanyIdAndStatus(Long companyId, ProjectStatus status);
    
    List<Project> findByCompanyIdAndStatusIn(Long companyId, List<ProjectStatus> statuses);
    
    @Query("SELECT p FROM Project p WHERE p.company.id = :companyId AND " +
           "(LOWER(p.projectName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Project> searchByNameOrCustomer(@Param("companyId") Long companyId, @Param("search") String search);
    
    @Query("SELECT p FROM Project p WHERE p.company.id = :companyId AND p.status = :status " +
           "ORDER BY p.date DESC")
    List<Project> findByCompanyAndStatusOrderByDate(@Param("companyId") Long companyId, 
                                                      @Param("status") ProjectStatus status);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Project p WHERE p.company.id = :companyId AND p.status = :status")
    BigDecimal sumAmountByCompanyAndStatus(@Param("companyId") Long companyId, @Param("status") ProjectStatus status);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.company.id = :companyId AND p.status = :status")
    long countByCompanyAndStatus(@Param("companyId") Long companyId, @Param("status") ProjectStatus status);
    
    long countByCompanyId(Long companyId);
}
