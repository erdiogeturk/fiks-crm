package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesDocumentItemRequest {
    private Long productId;

    @NotBlank(message = "Ürün adı zorunludur")
    private String productName;

    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountRate;
    private String unit;
    private Integer sortOrder;
}
