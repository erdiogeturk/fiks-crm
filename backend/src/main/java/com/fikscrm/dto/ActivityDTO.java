package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {
    private Long id;
    private String activityNumber;
    private Long customerId;
    private String customerName;
    private Long contactId;
    private String contactName;
    private String activityType;
    private String name;
    private String status;
    private LocalDate closeDate;
    private String location;
    private String notes;
    private Long createdById;
    private String createdByName;
    private Long responsibleUserId;
    private String responsibleUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
