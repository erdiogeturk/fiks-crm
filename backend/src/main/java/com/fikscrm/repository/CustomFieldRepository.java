package com.fikscrm.repository;

import com.fikscrm.entity.CustomField;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomFieldRepository extends JpaRepository<CustomField, Long> {

    List<CustomField> findAllByCompanyIdAndEntityTypeOrderBySortOrderAscCreatedAtAsc(Long companyId, String entityType);

    boolean existsByCompanyIdAndEntityTypeAndColumnName(Long companyId, String entityType, String columnName);
}
