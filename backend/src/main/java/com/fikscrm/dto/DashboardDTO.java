package com.fikscrm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalProjects;
    private long totalCustomers;
    private long wonProjects;
    private BigDecimal wonAmount;
    private BigDecimal pipelineAmount;
    private BigDecimal weightedAmount;
    private long activeProjects;
    private int winRate;
    private Map<String, Long> projectsByStatus;
    private Map<String, BigDecimal> amountByStatus;
    private List<UpcomingActionDTO> upcomingActions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingActionDTO {
        private Long id;
        private String customer;
        private String projectName;
        private String nextAction;
        private String nextActionDate;
        private String priority;
    }
}
