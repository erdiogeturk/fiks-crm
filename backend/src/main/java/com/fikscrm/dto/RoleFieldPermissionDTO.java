package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleFieldPermissionDTO {
    private Long   id;
    private String roleType;
    private String tableName;
    private String columnName;
    private String permission; // READ, WRITE, NONE
}
