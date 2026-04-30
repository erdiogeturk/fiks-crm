package com.fikscrm.repository;

import com.fikscrm.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByCompanyIdOrderByNameAsc(Long companyId);

    List<Product> findAllByCompanyIdAndStatusOrderByNameAsc(Long companyId, String status);

    boolean existsByCompanyIdAndCode(Long companyId, String code);

    boolean existsByCompanyIdAndCodeAndIdNot(Long companyId, String code, Long id);
}
