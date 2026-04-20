package com.fikscrm.service;

import com.fikscrm.dto.CustomerDTO;
import com.fikscrm.dto.CustomerRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.Customer;
import com.fikscrm.entity.User;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.CompanyRepository;
import com.fikscrm.repository.ContactRepository;
import com.fikscrm.repository.CustomerRepository;
import com.fikscrm.repository.ProjectRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public List<CustomerDTO> getAllCustomers() {
        Long companyId = getCurrentUserCompanyId();
        return customerRepository.findByCompanyIdOrderByNameAsc(companyId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Long id) {
        Long companyId = getCurrentUserCompanyId();
        Customer customer = customerRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToDTO(customer);
    }

    public List<CustomerDTO> searchCustomers(String query) {
        Long companyId = getCurrentUserCompanyId();
        return customerRepository.searchByName(companyId, query)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerRequest request) {
        Long companyId = getCurrentUserCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Customer customer = Customer.builder()
                .customerNo(request.getCustomerNo())
                .externalNo(request.getExternalNo())
                .role(request.getRole())
                .name(request.getName())
                .name2(request.getName2())
                .name3(request.getName3())
                .name4(request.getName4())
                .customerType(request.getCustomerType())
                .status(request.getStatus() != null ? request.getStatus() : "Aktif")
                .taxOffice(request.getTaxOffice())
                .taxNo(request.getTaxNo())
                .responsible(request.getResponsible())
                .country(request.getCountry())
                .city(request.getCity())
                .district(request.getDistrict())
                .neighborhood(request.getNeighborhood())
                .postalCode(request.getPostalCode())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .email(request.getEmail())
                .billingAddress(request.getBillingAddress())
                .shippingAddress(request.getShippingAddress())
                .logoUrl(request.getLogoUrl())
                .notes(request.getNotes())
                .sector(request.getSector())
                .website(request.getWebsite())
                .company(company)
                .build();

        customer = customerRepository.save(customer);
        return mapToDTO(customer);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerRequest request) {
        Long companyId = getCurrentUserCompanyId();
        Customer customer = customerRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        customer.setCustomerNo(request.getCustomerNo());
        customer.setExternalNo(request.getExternalNo());
        customer.setRole(request.getRole());
        customer.setName(request.getName());
        customer.setName2(request.getName2());
        customer.setName3(request.getName3());
        customer.setName4(request.getName4());
        customer.setCustomerType(request.getCustomerType());
        customer.setStatus(request.getStatus());
        customer.setTaxOffice(request.getTaxOffice());
        customer.setTaxNo(request.getTaxNo());
        customer.setResponsible(request.getResponsible());
        customer.setCountry(request.getCountry());
        customer.setCity(request.getCity());
        customer.setDistrict(request.getDistrict());
        customer.setNeighborhood(request.getNeighborhood());
        customer.setPostalCode(request.getPostalCode());
        customer.setPhone(request.getPhone());
        customer.setMobile(request.getMobile());
        customer.setEmail(request.getEmail());
        customer.setBillingAddress(request.getBillingAddress());
        customer.setShippingAddress(request.getShippingAddress());
        customer.setLogoUrl(request.getLogoUrl());
        customer.setNotes(request.getNotes());
        customer.setSector(request.getSector());
        customer.setWebsite(request.getWebsite());

        customer = customerRepository.save(customer);
        return mapToDTO(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Long companyId = getCurrentUserCompanyId();
        Customer customer = customerRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customerRepository.delete(customer);
    }

    public long getCustomerCount() {
        Long companyId = getCurrentUserCompanyId();
        return customerRepository.countByCompanyId(companyId);
    }

    private CustomerDTO mapToDTO(Customer customer) {
        return CustomerDTO.builder()
                .id(customer.getId())
                .customerNo(customer.getCustomerNo())
                .externalNo(customer.getExternalNo())
                .role(customer.getRole())
                .name(customer.getName())
                .name2(customer.getName2())
                .name3(customer.getName3())
                .name4(customer.getName4())
                .customerType(customer.getCustomerType())
                .status(customer.getStatus())
                .taxOffice(customer.getTaxOffice())
                .taxNo(customer.getTaxNo())
                .responsible(customer.getResponsible())
                .country(customer.getCountry())
                .city(customer.getCity())
                .district(customer.getDistrict())
                .neighborhood(customer.getNeighborhood())
                .postalCode(customer.getPostalCode())
                .phone(customer.getPhone())
                .mobile(customer.getMobile())
                .email(customer.getEmail())
                .billingAddress(customer.getBillingAddress())
                .shippingAddress(customer.getShippingAddress())
                .logoUrl(customer.getLogoUrl())
                .notes(customer.getNotes())
                .sector(customer.getSector())
                .website(customer.getWebsite())
                .projectCount(projectRepository.findByCustomerIdOrderByDateDesc(customer.getId()).size())
                .contactCount(contactRepository.findByCustomerIdOrderByIsPrimaryDesc(customer.getId()).size())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    private Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }
}
