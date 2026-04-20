package com.fikscrm.service;

import com.fikscrm.dto.ContactDTO;
import com.fikscrm.dto.ContactRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.Contact;
import com.fikscrm.entity.Customer;
import com.fikscrm.entity.User;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.CompanyRepository;
import com.fikscrm.repository.ContactRepository;
import com.fikscrm.repository.CustomerRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public List<ContactDTO> getContactsByCustomer(Long customerId) {
        return contactRepository.findByCustomerIdOrderByIsPrimaryDesc(customerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ContactDTO getContactById(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        return mapToDTO(contact);
    }

    @Transactional
    public ContactDTO createContact(ContactRequest request) {
        Long companyId = getCurrentUserCompanyId();
        
        Customer customer = customerRepository.findByIdAndCompanyId(request.getCustomerId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        if (request.isPrimary()) {
            contactRepository.clearPrimaryByCustomerId(customer.getId());
        }

        Contact contact = Contact.builder()
                .name(request.getName())
                .title(request.getTitle())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .notes(request.getNotes())
                .isPrimary(request.isPrimary())
                .customer(customer)
                .build();

        contact = contactRepository.save(contact);
        return mapToDTO(contact);
    }

    @Transactional
    public ContactDTO updateContact(Long id, ContactRequest request) {
        Long companyId = getCurrentUserCompanyId();
        
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getCustomer().getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));

        if (request.isPrimary() && !contact.isPrimary()) {
            contactRepository.clearPrimaryByCustomerId(contact.getCustomer().getId());
        }

        contact.setName(request.getName());
        contact.setTitle(request.getTitle());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setMobile(request.getMobile());
        contact.setNotes(request.getNotes());
        contact.setPrimary(request.isPrimary());

        contact = contactRepository.save(contact);
        return mapToDTO(contact);
    }

    @Transactional
    public void deleteContact(Long id) {
        Long companyId = getCurrentUserCompanyId();
        Contact contact = contactRepository.findById(id)
                .filter(c -> c.getCustomer().getCompany().getId().equals(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        contactRepository.delete(contact);
    }

    private ContactDTO mapToDTO(Contact contact) {
        return ContactDTO.builder()
                .id(contact.getId())
                .customerId(contact.getCustomer().getId())
                .customerName(contact.getCustomer().getName())
                .name(contact.getName())
                .title(contact.getTitle())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .mobile(contact.getMobile())
                .notes(contact.getNotes())
                .isPrimary(contact.isPrimary())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }
}
