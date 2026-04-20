package com.fikscrm.dto;

import com.fikscrm.entity.Priority;
import com.fikscrm.entity.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerLogoUrl;
    private String projectName;
    private BigDecimal amount;
    private String currency;
    private LocalDate date;
    private ProjectStatus status;
    private Priority priority;
    private String segment;
    private String source;
    private Integer probability;
    private String contact;
    private String contactEmail;
    private String contactPhone;
    private String notes;
    private String nextAction;
    private LocalDate nextActionDate;
    private String logoUrl;
    private Integer activityCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
