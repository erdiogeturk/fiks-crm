package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private LocalDate birthDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer registrationNo;
    private String email;
    private String phone;
    private String department;
    private String title;
    private String status;

    // User creation fields — only used on create
    private boolean createUser;
    private String username;
    private String password;
    private String userRole;
}
