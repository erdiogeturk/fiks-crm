package com.fikscrm.service;

import com.fikscrm.dto.RoleDTO;
import com.fikscrm.dto.RoleRequest;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepo;
    private final RoleFieldPermissionRepository permissionRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<RoleDTO> getAll() {
        return roleRepo.findAllByCompanyIdOrderBySystemDescLabelAsc(companyId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public RoleDTO getById(Long id) {
        return toDTO(find(id));
    }

    public RoleDTO create(RoleRequest req) {
        String normalizedName = req.getName().toUpperCase().replace(" ", "_");
        if (roleRepo.findByCompanyIdAndName(companyId(), normalizedName).isPresent()) {
            throw new IllegalArgumentException("Bu isimde bir rol zaten mevcut.");
        }
        Role role = Role.builder()
                .name(normalizedName)
                .label(req.getLabel())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : "Taslak")
                .system(false)
                .createdBy(currentUserFullName())
                .updatedBy(currentUserFullName())
                .company(company())
                .build();
        return toDTO(roleRepo.save(role));
    }

    public RoleDTO update(Long id, RoleRequest req) {
        Role role = find(id);
        if (role.isSystem()) {
            throw new IllegalArgumentException("Sistem rolleri düzenlenemez.");
        }
        String normalizedName = req.getName().toUpperCase().replace(" ", "_");
        if (roleRepo.existsByCompanyIdAndNameAndIdNot(companyId(), normalizedName, id)) {
            throw new IllegalArgumentException("Bu isimde bir rol zaten mevcut.");
        }
        role.setName(normalizedName);
        role.setLabel(req.getLabel());
        role.setDescription(req.getDescription());
        if (req.getStatus() != null) role.setStatus(req.getStatus());
        role.setUpdatedBy(currentUserFullName());
        return toDTO(roleRepo.save(role));
    }

    public RoleDTO copy(Long sourceId, RoleRequest req) {
        Role source = find(sourceId);
        String normalizedName = req.getName().toUpperCase().replace(" ", "_");
        if (roleRepo.findByCompanyIdAndName(companyId(), normalizedName).isPresent()) {
            throw new IllegalArgumentException("Bu isimde bir rol zaten mevcut.");
        }
        Company comp = company();
        Role newRole = roleRepo.save(Role.builder()
                .name(normalizedName)
                .label(req.getLabel())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : "Taslak")
                .system(false)
                .createdBy(currentUserFullName())
                .updatedBy(currentUserFullName())
                .company(comp)
                .build());

        List<RoleFieldPermission> sourcePerms = permissionRepo.findAllByCompanyIdAndRoleType(comp.getId(), source.getName());
        List<RoleFieldPermission> copies = sourcePerms.stream()
                .map(p -> RoleFieldPermission.builder()
                        .company(comp)
                        .roleType(newRole.getName())
                        .tableName(p.getTableName())
                        .columnName(p.getColumnName())
                        .permission(p.getPermission())
                        .build())
                .toList();
        permissionRepo.saveAll(copies);

        return toDTO(newRole);
    }

    public void delete(Long id) {
        Role role = find(id);
        if (role.isSystem()) {
            throw new IllegalArgumentException("Sistem rolleri silinemez.");
        }
        roleRepo.delete(role);
    }

    private Role find(Long id) {
        return roleRepo.findById(id)
                .filter(r -> r.getCompany().getId().equals(companyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Rol bulunamadı: " + id));
    }

    private RoleDTO toDTO(Role r) {
        return RoleDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .label(r.getLabel())
                .description(r.getDescription())
                .system(r.isSystem())
                .status(r.getStatus())
                .createdBy(r.getCreatedBy())
                .updatedBy(r.getUpdatedBy())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
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
