package com.fikscrm.repository;

import com.fikscrm.entity.RoleFieldPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RoleFieldPermissionRepository extends JpaRepository<RoleFieldPermission, Long> {

    List<RoleFieldPermission> findAllByCompanyIdAndRoleType(Long companyId, String roleType);

    List<RoleFieldPermission> findAllByCompanyIdAndRoleTypeAndTableName(
        Long companyId, String roleType, String tableName);

    @Modifying
    @Transactional
    @Query("DELETE FROM RoleFieldPermission r WHERE r.company.id = :companyId AND r.roleType = :roleType AND r.tableName = :tableName")
    void deleteAllByCompanyIdAndRoleTypeAndTableName(
        @Param("companyId") Long companyId,
        @Param("roleType") String roleType,
        @Param("tableName") String tableName);
}
