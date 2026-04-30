package com.fikscrm.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrgTeamMemberDTO {
    private Long id;
    private Long employeeId;
    private String employeeFullName;
    private String employeeTitle;
    private String employeeDepartment;
    private String employeeEmail;
    private String teamRole;
    private Long positionId;
    private String positionName;
    private String status;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Long managerId;
    private String managerFullName;
    private LocalDate joinedAt;
    private LocalDateTime createdAt;
}
