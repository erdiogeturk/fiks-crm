package com.fikscrm.service;

import com.fikscrm.dto.ActivityDTO;
import com.fikscrm.dto.ActivityRequest;
import com.fikscrm.entity.*;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ActivityDTO> getAllActivities() {
        Long companyId = getCurrentUserCompanyId();
        return activityRepository.findByCustomer_CompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesByCustomer(Long customerId) {
        Long companyId = getCurrentUserCompanyId();
        return activityRepository.findByCustomerIdAndCustomer_CompanyIdOrderByCreatedAtDesc(customerId, companyId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ActivityDTO getActivityById(Long id) {
        return mapToDTO(findById(id));
    }

    @Transactional
    public ActivityDTO createActivity(ActivityRequest request) {
        User currentUser = getCurrentUser();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Contact contact = null;
        if (request.getContactId() != null) {
            contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", request.getContactId()));
        }

        User responsibleUser = null;
        if (request.getResponsibleUserId() != null) {
            responsibleUser = userRepository.findById(request.getResponsibleUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getResponsibleUserId()));
        }

        Activity activity = Activity.builder()
                .activityNumber(java.util.UUID.randomUUID().toString())
                .customer(customer)
                .contact(contact)
                .activityType(request.getActivityType())
                .name(request.getName())
                .status(request.getStatus() != null ? request.getStatus() : "ACIK")
                .closeDate(request.getCloseDate())
                .location(request.getLocation())
                .notes(request.getNotes())
                .createdBy(currentUser)
                .responsibleUser(responsibleUser)
                .build();

        activity = activityRepository.save(activity);
        activity.setActivityNumber("Z1" + String.format("%04d", activity.getId()));
        activity = activityRepository.save(activity);
        return mapToDTO(activity);
    }

    @Transactional
    public ActivityDTO updateActivity(Long id, ActivityRequest request) {
        Activity activity = findById(id);

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Contact contact = null;
        if (request.getContactId() != null) {
            contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", request.getContactId()));
        }

        User responsibleUser = null;
        if (request.getResponsibleUserId() != null) {
            responsibleUser = userRepository.findById(request.getResponsibleUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getResponsibleUserId()));
        }

        activity.setCustomer(customer);
        activity.setContact(contact);
        activity.setActivityType(request.getActivityType());
        activity.setName(request.getName());
        if (request.getStatus() != null) activity.setStatus(request.getStatus());
        activity.setCloseDate(request.getCloseDate());
        activity.setLocation(request.getLocation());
        activity.setNotes(request.getNotes());
        activity.setResponsibleUser(responsibleUser);

        return mapToDTO(activityRepository.save(activity));
    }

    @Transactional
    public void deleteActivity(Long id) {
        activityRepository.delete(findById(id));
    }

    private Activity findById(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity", "id", id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }

    private ActivityDTO mapToDTO(Activity a) {
        return ActivityDTO.builder()
                .id(a.getId())
                .activityNumber(a.getActivityNumber())
                .customerId(a.getCustomer().getId())
                .customerName(a.getCustomer().getName())
                .contactId(a.getContact() != null ? a.getContact().getId() : null)
                .contactName(a.getContact() != null ? a.getContact().getName() : null)
                .activityType(a.getActivityType())
                .name(a.getName())
                .status(a.getStatus())
                .closeDate(a.getCloseDate())
                .location(a.getLocation())
                .notes(a.getNotes())
                .createdById(a.getCreatedBy().getId())
                .createdByName(a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName())
                .responsibleUserId(a.getResponsibleUser() != null ? a.getResponsibleUser().getId() : null)
                .responsibleUserName(a.getResponsibleUser() != null ?
                        a.getResponsibleUser().getFirstName() + " " + a.getResponsibleUser().getLastName() : null)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
