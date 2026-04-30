package com.fikscrm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrgTeamMemberRequest {
    @NotNull
    private Long employeeId;
    private String teamRole;
    private Long positionId;
    private String status;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Long managerId;
    private LocalDate joinedAt;
}
