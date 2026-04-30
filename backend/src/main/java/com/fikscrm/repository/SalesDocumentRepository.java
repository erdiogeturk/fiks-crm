package com.fikscrm.repository;

import com.fikscrm.entity.SalesDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesDocumentRepository extends JpaRepository<SalesDocument, Long> {

    List<SalesDocument> findAllByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<SalesDocument> findAllByCompanyIdAndCustomerIdOrderByCreatedAtDesc(Long companyId, Long customerId);

    List<SalesDocument> findAllByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    Optional<SalesDocument> findByIdAndCompanyId(Long id, Long companyId);
}
