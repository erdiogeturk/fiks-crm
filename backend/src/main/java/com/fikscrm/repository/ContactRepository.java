package com.fikscrm.repository;

import com.fikscrm.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    List<Contact> findByCustomerIdOrderByIsPrimaryDesc(Long customerId);
    
    List<Contact> findByCustomerId(Long customerId);
    
    @Modifying
    @Query("UPDATE Contact c SET c.isPrimary = false WHERE c.customer.id = :customerId")
    void clearPrimaryByCustomerId(@Param("customerId") Long customerId);
    
    long countByCustomerId(Long customerId);
}
