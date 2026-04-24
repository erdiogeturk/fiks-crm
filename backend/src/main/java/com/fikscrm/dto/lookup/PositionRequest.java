package com.fikscrm.dto.lookup;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class PositionRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private String status;
}
