package com.fikscrm.repository;

import com.fikscrm.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    List<Role> findAllByCompanyIdOrderBySystemDescLabelAsc(Long companyId);
    Optional<Role> findByCompanyIdAndName(Long companyId, String name);
    boolean existsByCompanyIdAndNameAndIdNot(Long companyId, String name, Long id);
}
