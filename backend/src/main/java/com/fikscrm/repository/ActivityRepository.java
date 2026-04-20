package com.fikscrm.repository;

import com.fikscrm.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findAllByOrderByCreatedAtDesc();

    List<Activity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Activity> findByCustomer_CompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Activity> findByCustomerIdAndCustomer_CompanyIdOrderByCreatedAtDesc(Long customerId, Long companyId);
}
