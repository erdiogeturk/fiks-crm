package com.fikscrm.dto.lookup;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CurrencyRequest {
    @NotBlank private String code;
    @NotBlank private String name;
    private String symbol;
    private String status;
}
