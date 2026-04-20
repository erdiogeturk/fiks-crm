package com.fikscrm.dto;

import com.fikscrm.entity.Priority;
import com.fikscrm.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProjectRequest {
    private Long customerId;
    
    @NotBlank(message = "Project name is required")
    private String projectName;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private String currency = "EUR";
    private LocalDate date;
    private ProjectStatus status = ProjectStatus.LEAD;
    private Priority priority = Priority.MEDIUM;
    private String segment;
    private String source;
    private Integer probability = 20;
    private String contact;
    private String contactEmail;
    private String contactPhone;
    private String notes;
    private String nextAction;
    private LocalDate nextActionDate;
    private String logoUrl;
}
