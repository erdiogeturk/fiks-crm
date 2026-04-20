package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactRequest {
    private Long customerId;
    
    @NotBlank(message = "Contact name is required")
    private String name;
    
    private String title;
    private String email;
    private String phone;
    private String mobile;
    private String notes;
    private boolean isPrimary = false;
}
