package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrganizationRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private Long parentId;
    private LocalDate validFrom;
    private LocalDate validTo;
    private String status;
}
