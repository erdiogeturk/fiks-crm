package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String name;
    private String title;
    private String email;
    private String phone;
    private String mobile;
    private String notes;
    private boolean isPrimary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
