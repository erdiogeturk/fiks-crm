package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String customerNo;
    private String externalNo;
    private String role;
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
    private Integer projectCount;
    private Integer contactCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
