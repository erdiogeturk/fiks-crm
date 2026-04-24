package com.fikscrm.dto;

import com.fikscrm.entity.RoleType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserRequest {

    @NotBlank
    private String username;

    private String password; // required on create, optional on update

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String email;
    private String phone;
    private RoleType role;
    private boolean enabled = true;
}
