package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String label;

    private String description;
    private String status;
}
