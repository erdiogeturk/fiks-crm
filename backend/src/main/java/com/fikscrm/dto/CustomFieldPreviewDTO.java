package com.fikscrm.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CustomFieldPreviewDTO {
    private String       entityType;
    private String       entityLabel;
    private String       tableName;
    private String       label;
    private String       columnName;
    private String       dataType;
    private String       dbDataType;
    private Integer      fieldLength;
    private boolean      nullable;
    private String       defaultValue;
    private List<String> selectOptions;
    private String       ddlStatement;
    private boolean      columnAlreadyExists; // warn if column is already in DB
}
