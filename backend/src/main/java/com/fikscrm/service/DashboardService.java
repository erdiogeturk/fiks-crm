package com.fikscrm.service;

import com.fikscrm.dto.DashboardDTO;
import com.fikscrm.entity.Project;
import com.fikscrm.entity.ProjectStatus;
import com.fikscrm.entity.User;
import com.fikscrm.repository.CompanyRepository;
import com.fikscrm.repository.ProjectRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final CustomerService customerService;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public DashboardDTO getDashboard() {
        Long companyId = getCurrentUserCompanyId();
        
        long totalProjects = projectRepository.countByCompanyId(companyId);
        long totalCustomers = customerService.getCustomerCount();
        long wonProjects = projectRepository.countByCompanyAndStatus(companyId, ProjectStatus.WON);
        long lostProjects = projectRepository.countByCompanyAndStatus(companyId, ProjectStatus.LOST);
        BigDecimal wonAmount = projectRepository.sumAmountByCompanyAndStatus(companyId, ProjectStatus.WON);
        
        int winRate = 0;
        long closedCount = wonProjects + lostProjects;
        if (closedCount > 0) {
            winRate = (int) Math.round((wonProjects * 100.0) / closedCount);
        }

        List<ProjectStatus> activeStatuses = List.of(ProjectStatus.LEAD, ProjectStatus.PROPOSAL, 
                ProjectStatus.NEGOTIATION, ProjectStatus.ONHOLD);
        long activeProjects = 0;
        BigDecimal pipelineAmount = BigDecimal.ZERO;
        BigDecimal weightedAmount = BigDecimal.ZERO;
        
        var activeProjectsList = projectRepository.findByCompanyIdAndStatusIn(companyId, activeStatuses);
        for (var project : activeProjectsList) {
            activeProjects++;
            pipelineAmount = pipelineAmount.add(project.getAmount());
            if (project.getProbability() != null && project.getAmount() != null) {
                BigDecimal weight = project.getAmount()
                        .multiply(BigDecimal.valueOf(project.getProbability()))
                        .divide(BigDecimal.valueOf(100));
                weightedAmount = weightedAmount.add(weight);
            }
        }

        Map<String, Long> projectsByStatus = new HashMap<>();
        Map<String, BigDecimal> amountByStatus = new HashMap<>();
        
        for (ProjectStatus status : ProjectStatus.values()) {
            long count = projectRepository.countByCompanyAndStatus(companyId, status);
            BigDecimal amount = projectRepository.sumAmountByCompanyAndStatus(companyId, status);
            projectsByStatus.put(status.name(), count);
            amountByStatus.put(status.name(), amount != null ? amount : BigDecimal.ZERO);
        }

        List<DashboardDTO.UpcomingActionDTO> upcomingActions = getUpcomingActions(activeProjectsList);

        return DashboardDTO.builder()
                .totalProjects(totalProjects)
                .totalCustomers(totalCustomers)
                .wonProjects(wonProjects)
                .wonAmount(wonAmount != null ? wonAmount : BigDecimal.ZERO)
                .pipelineAmount(pipelineAmount)
                .weightedAmount(weightedAmount)
                .activeProjects(activeProjects)
                .winRate(winRate)
                .projectsByStatus(projectsByStatus)
                .amountByStatus(amountByStatus)
                .upcomingActions(upcomingActions)
                .build();
    }

    private List<DashboardDTO.UpcomingActionDTO> getUpcomingActions(List<Project> activeProjects) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy", new Locale("tr", "TR"));
        
        return activeProjects.stream()
                .filter(p -> p.getNextAction() != null && !p.getNextAction().isEmpty())
                .sorted(Comparator.comparing(
                        p -> p.getNextActionDate() != null ? p.getNextActionDate() : LocalDate.MAX
                ))
                .limit(5)
                .map(p -> DashboardDTO.UpcomingActionDTO.builder()
                        .id(p.getId())
                        .customer(p.getCustomer() != null ? p.getCustomer().getName() : "N/A")
                        .projectName(p.getProjectName())
                        .nextAction(p.getNextAction())
                        .nextActionDate(p.getNextActionDate() != null ? 
                                p.getNextActionDate().format(formatter) : "")
                        .priority(p.getPriority() != null ? p.getPriority().name() : "MEDIUM")
                        .build())
                .collect(Collectors.toList());
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getCompany().getId();
    }
}
