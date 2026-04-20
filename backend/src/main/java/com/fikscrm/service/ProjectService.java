package com.fikscrm.service;

import com.fikscrm.dto.ProjectDTO;
import com.fikscrm.dto.ProjectRequest;
import com.fikscrm.entity.*;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public List<ProjectDTO> getAllProjects() {
        Long companyId = getCurrentUserCompanyId();
        return projectRepository.findByCompanyIdOrderByDateDesc(companyId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByCustomer(Long customerId) {
        return projectRepository.findByCustomerIdOrderByDateDesc(customerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByStatus(String status) {
        Long companyId = getCurrentUserCompanyId();
        ProjectStatus projectStatus = ProjectStatus.valueOf(status.toUpperCase());
        return projectRepository.findByCompanyAndStatusOrderByDate(companyId, projectStatus)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> searchProjects(String query) {
        Long companyId = getCurrentUserCompanyId();
        return projectRepository.searchByNameOrCustomer(companyId, query)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id) {
        Long companyId = getCurrentUserCompanyId();
        Project project = projectRepository.findById(id)
                .filter(p -> p.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return mapToDTO(project);
    }

    @Transactional
    public ProjectDTO createProject(ProjectRequest request) {
        Long companyId = getCurrentUserCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
        
        User currentUser = userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findByIdAndCompanyId(request.getCustomerId(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        }

        Project project = Project.builder()
                .projectName(request.getProjectName())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "EUR")
                .date(request.getDate())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .segment(request.getSegment())
                .source(request.getSource())
                .probability(request.getProbability() != null ? request.getProbability() : 20)
                .contact(request.getContact())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .notes(request.getNotes())
                .nextAction(request.getNextAction())
                .nextActionDate(request.getNextActionDate())
                .logoUrl(request.getLogoUrl())
                .customer(customer)
                .company(company)
                .createdBy(currentUser)
                .build();

        project = projectRepository.save(project);
        return mapToDTO(project);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectRequest request) {
        Long companyId = getCurrentUserCompanyId();
        Project project = projectRepository.findById(id)
                .filter(p -> p.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findByIdAndCompanyId(request.getCustomerId(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
            project.setCustomer(customer);
        }

        project.setProjectName(request.getProjectName());
        project.setAmount(request.getAmount());
        project.setCurrency(request.getCurrency());
        project.setDate(request.getDate());
        project.setStatus(request.getStatus());
        project.setPriority(request.getPriority());
        project.setSegment(request.getSegment());
        project.setSource(request.getSource());
        project.setProbability(request.getProbability());
        project.setContact(request.getContact());
        project.setContactEmail(request.getContactEmail());
        project.setContactPhone(request.getContactPhone());
        project.setNotes(request.getNotes());
        project.setNextAction(request.getNextAction());
        project.setNextActionDate(request.getNextActionDate());
        project.setLogoUrl(request.getLogoUrl());

        project = projectRepository.save(project);
        return mapToDTO(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Long companyId = getCurrentUserCompanyId();
        Project project = projectRepository.findById(id)
                .filter(p -> p.getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        projectRepository.delete(project);
    }

    public long getProjectCount() {
        Long companyId = getCurrentUserCompanyId();
        return projectRepository.countByCompanyId(companyId);
    }

    public long getWonProjectCount() {
        Long companyId = getCurrentUserCompanyId();
        return projectRepository.countByCompanyAndStatus(companyId, ProjectStatus.WON);
    }

    public BigDecimal getWonAmount() {
        Long companyId = getCurrentUserCompanyId();
        return projectRepository.sumAmountByCompanyAndStatus(companyId, ProjectStatus.WON);
    }

    private ProjectDTO mapToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .customerId(project.getCustomer() != null ? project.getCustomer().getId() : null)
                .customerName(project.getCustomer() != null ? project.getCustomer().getName() : null)
                .customerLogoUrl(project.getCustomer() != null ? project.getCustomer().getLogoUrl() : null)
                .projectName(project.getProjectName())
                .amount(project.getAmount())
                .currency(project.getCurrency())
                .date(project.getDate())
                .status(project.getStatus())
                .priority(project.getPriority())
                .segment(project.getSegment())
                .source(project.getSource())
                .probability(project.getProbability())
                .contact(project.getContact())
                .contactEmail(project.getContactEmail())
                .contactPhone(project.getContactPhone())
                .notes(project.getNotes())
                .nextAction(project.getNextAction())
                .nextActionDate(project.getNextActionDate())
                .logoUrl(project.getLogoUrl())
                .activityCount(0) // ARCH: Activities are now customer-linked (V4 refactor), not project-linked
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }
}
