package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ActivityRequest {

    @NotNull(message = "Müşteri zorunludur")
    private Long customerId;

    private Long contactId;

    @NotBlank(message = "Aktivite tipi zorunludur")
    private String activityType;

    @NotBlank(message = "Aktivite adı zorunludur")
    private String name;

    private String status;
    private LocalDate closeDate;
    private String location;
    private String notes;
    private Long responsibleUserId;
}
