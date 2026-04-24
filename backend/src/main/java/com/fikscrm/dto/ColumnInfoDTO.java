package com.fikscrm.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ColumnInfoDTO {
    private String  columnName;
    private String  label;
    private String  dbDataType;   // native DB type: VARCHAR, BIGINT, etc.
    private String  fieldType;    // our abstraction: TEXT, NUMBER, etc.
    private Integer maxLength;
    private boolean nullable;
    private String  defaultValue;
    private boolean custom;       // true = added via custom fields
    private Long    customFieldId;
    private String  selectOptions;
    private String  status;       // ACTIVE / INACTIVE — only for custom fields
}
