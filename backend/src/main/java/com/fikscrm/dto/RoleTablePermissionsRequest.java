package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class RoleTablePermissionsRequest {

    @NotBlank
    private String roleType;

    @NotBlank
    private String tableName;

    private List<ColumnPermission> columns;

    @Data
    public static class ColumnPermission {
        private String columnName;
        private String permission; // READ, WRITE, NONE
    }
}
