package com.fikscrm.repository;

import com.fikscrm.entity.SalesDocumentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesDocumentItemRepository extends JpaRepository<SalesDocumentItem, Long> {

    List<SalesDocumentItem> findAllBySalesDocumentIdOrderBySortOrderAsc(Long docId);

    void deleteAllBySalesDocumentId(Long docId);
}
