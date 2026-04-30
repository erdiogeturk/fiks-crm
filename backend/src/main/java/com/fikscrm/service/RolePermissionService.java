package com.fikscrm.service;

import com.fikscrm.dto.RoleFieldPermissionDTO;
import com.fikscrm.dto.RoleTablePermissionsRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.Role;
import com.fikscrm.entity.RoleFieldPermission;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.RoleFieldPermissionRepository;
import com.fikscrm.repository.RoleRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RolePermissionService {

    private final RoleFieldPermissionRepository rolePermRepo;
    private final RoleRepository roleRepo;
    private final UserRepository userRepo;

    /** Returns all field permissions for the given role, scoped to the current company. */
    @Transactional(readOnly = true)
    public List<RoleFieldPermissionDTO> getByRole(String roleType) {
        return rolePermRepo.findAllByCompanyIdAndRoleType(companyId(), roleType)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Returns all field permissions for a specific role + table, scoped to the current company. */
    @Transactional(readOnly = true)
    public List<RoleFieldPermissionDTO> getByRoleAndTable(String roleType, String tableName) {
        return rolePermRepo.findAllByCompanyIdAndRoleTypeAndTableName(companyId(), roleType, tableName)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Bulk-saves permissions for one role + table combination.
     * Deletes all existing records for companyId + roleType + tableName,
     * then inserts only entries where permission != NONE.
     * Absence of a row implies NONE — no need to persist NONE explicitly.
     */
    public List<RoleFieldPermissionDTO> saveForTable(RoleTablePermissionsRequest req) {
        Long cid = companyId();
        Company comp = company();

        // Remove all existing permissions for this role + table
        rolePermRepo.deleteAllByCompanyIdAndRoleTypeAndTableName(cid, req.getRoleType(), req.getTableName());

        if (req.getColumns() == null || req.getColumns().isEmpty()) {
            return List.of();
        }

        // Persist only READ or WRITE — skip NONE
        List<RoleFieldPermission> toSave = req.getColumns().stream()
            .filter(col -> col.getPermission() != null && !"NONE".equalsIgnoreCase(col.getPermission()))
            .map(col -> RoleFieldPermission.builder()
                .company(comp)
                .roleType(req.getRoleType())
                .tableName(req.getTableName())
                .columnName(col.getColumnName())
                .permission(col.getPermission().toUpperCase())
                .build())
            .collect(Collectors.toList());

        List<RoleFieldPermission> saved = rolePermRepo.saveAll(toSave);

        // Touch the role's updatedAt / updatedBy
        roleRepo.findByCompanyIdAndName(cid, req.getRoleType()).ifPresent(role -> {
            role.setUpdatedBy(currentUserFullName());
            role.setUpdatedAt(LocalDateTime.now());
            roleRepo.save(role);
        });

        return saved.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private RoleFieldPermissionDTO toDTO(RoleFieldPermission entity) {
        return RoleFieldPermissionDTO.builder()
            .id(entity.getId())
            .roleType(entity.getRoleType())
            .tableName(entity.getTableName())
            .columnName(entity.getColumnName())
            .permission(entity.getPermission())
            .build();
    }

    private Long companyId() {
        return currentUser().getCompany().getId();
    }

    private Company company() {
        return currentUser().getCompany();
    }

    private String currentUserFullName() {
        var u = currentUser();
        return u.getFirstName() + " " + u.getLastName();
    }

    private com.fikscrm.entity.User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."));
    }
}
