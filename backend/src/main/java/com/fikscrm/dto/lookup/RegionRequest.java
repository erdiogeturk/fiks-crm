package com.fikscrm.dto.lookup;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegionRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private Long countryId;
    private String status;
}
