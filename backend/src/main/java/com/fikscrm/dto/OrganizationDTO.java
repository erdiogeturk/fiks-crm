package com.fikscrm.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrganizationDTO {
    private Long id;
    private String code;
    private String name;
    private Long parentId;
    private String parentName;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String status;
    private boolean everActivated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
