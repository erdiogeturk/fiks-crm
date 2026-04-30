package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.RoleFieldPermissionDTO;
import com.fikscrm.dto.RoleTablePermissionsRequest;
import com.fikscrm.service.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role-permissions")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    /** All field permissions for a given role (all tables). */
    @GetMapping("/{roleType}")
    public ResponseEntity<ApiResponse<List<RoleFieldPermissionDTO>>> getByRole(
            @PathVariable String roleType) {
        return ResponseEntity.ok(ApiResponse.success(rolePermissionService.getByRole(roleType)));
    }

    /** Field permissions for a given role + specific table. */
    @GetMapping("/{roleType}/{tableName}")
    public ResponseEntity<ApiResponse<List<RoleFieldPermissionDTO>>> getByRoleAndTable(
            @PathVariable String roleType,
            @PathVariable String tableName) {
        return ResponseEntity.ok(ApiResponse.success(rolePermissionService.getByRoleAndTable(roleType, tableName)));
    }

    /**
     * Bulk-save permissions for a role + table.
     * Replaces all existing records for the given company + roleType + tableName.
     * NONE-valued entries are not persisted (absence = NONE).
     */
    @PutMapping("/{roleType}/{tableName}")
    public ResponseEntity<ApiResponse<List<RoleFieldPermissionDTO>>> saveForTable(
            @PathVariable String roleType,
            @PathVariable String tableName,
            @Valid @RequestBody RoleTablePermissionsRequest req) {
        // Ensure path variables are authoritative — override body values if mismatched
        req.setRoleType(roleType);
        req.setTableName(tableName);
        return ResponseEntity.ok(ApiResponse.success(rolePermissionService.saveForTable(req)));
    }
}
