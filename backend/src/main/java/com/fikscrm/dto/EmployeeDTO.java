package com.fikscrm.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate birthDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer registrationNo;
    private String email;
    private String phone;
    private String department;
    private String title;
    private String status;
    private Long linkedUserId;
    private String linkedUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
