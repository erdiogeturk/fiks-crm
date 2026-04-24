package com.fikscrm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrgTeamMemberRequest {
    @NotNull
    private Long employeeId;
    private String teamRole;
    private LocalDate joinedAt;
}
