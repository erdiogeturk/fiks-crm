package com.fikscrm.repository;

import com.fikscrm.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    List<Customer> findByCompanyId(Long companyId);
    
    List<Customer> findByCompanyIdOrderByNameAsc(Long companyId);
    
    @Query("SELECT c FROM Customer c WHERE c.company.id = :companyId AND LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Customer> searchByName(@Param("companyId") Long companyId, @Param("search") String search);
    
    Optional<Customer> findByIdAndCompanyId(Long id, Long companyId);
    
    long countByCompanyId(Long companyId);
}
