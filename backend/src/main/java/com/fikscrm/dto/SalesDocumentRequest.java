package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class SalesDocumentRequest {

    @NotBlank(message = "Belge tipi zorunludur")
    private String documentType;

    private LocalDate documentDate;
    private LocalDate dueDate;

    @NotNull(message = "Müşteri zorunludur")
    private Long customerId;

    private Long contactId;

    private String status;
    private String currency;
    private String notes;

    private List<SalesDocumentItemRequest> items;
}
