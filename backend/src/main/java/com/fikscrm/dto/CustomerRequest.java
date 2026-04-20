package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CustomerRequest {
    private String customerNo;
    private String externalNo;
    private String role;
    
    @NotBlank(message = "Customer name is required")
    private String name;
    
    private String name2;
    private String name3;
    private String name4;
    private String customerType;
    private String status;
    private String taxOffice;
    private String taxNo;
    private String responsible;
    private String country;
    private String city;
    private String district;
    private String neighborhood;
    private String postalCode;
    private String phone;
    private String mobile;
    private String email;
    private String billingAddress;
    private String shippingAddress;
    private String logoUrl;
    private String notes;
    private String sector;
    private String website;
}
