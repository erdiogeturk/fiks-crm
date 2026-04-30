package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDocumentDTO {
    private Long id;
    private String documentNo;
    private String documentType;
    private LocalDate documentDate;
    private LocalDate dueDate;
    private Long customerId;
    private String customerName;
    private Long contactId;
    private String contactName;
    private String status;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal totalAmount;
    private String notes;
    private Long companyId;
    private String createdByName;
    private LocalDateTime createdAt;
    private List<SalesDocumentItemDTO> items;
}
