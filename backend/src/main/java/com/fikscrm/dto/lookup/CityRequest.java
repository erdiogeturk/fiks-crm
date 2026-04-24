package com.fikscrm.dto.lookup;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CityRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private Long countryId;
    private Long regionId;
    private String status;
}
