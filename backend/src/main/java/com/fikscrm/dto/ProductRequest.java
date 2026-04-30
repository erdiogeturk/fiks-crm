package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "Ürün adı zorunludur")
    private String name;

    private String code;

    private String description;

    private BigDecimal price;

    private String currency;

    private String unit;

    private String category;

    private String status;
}
