package com.fikscrm.service;

import com.fikscrm.dto.EmployeeDTO;
import com.fikscrm.dto.EmployeeRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.Employee;
import com.fikscrm.entity.RoleType;
import com.fikscrm.entity.User;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.EmployeeRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeeDTO> getAll() {
        return employeeRepo.findAllByCompanyIdOrderByLastNameAscFirstNameAsc(companyId())
                .stream().map(this::toDTO).toList();
    }

    public EmployeeDTO getById(Long id) {
        return toDTO(find(id));
    }

    public List<EmployeeDTO> getActive() {
        return employeeRepo.findActiveByCompanyId(companyId())
                .stream().map(this::toDTO).toList();
    }

    public List<EmployeeDTO> search(String q) {
        return employeeRepo.search(companyId(), q)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public EmployeeDTO create(EmployeeRequest req) {
        validate(req, null);
        Company co = company();

        Employee emp = Employee.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .birthDate(req.getBirthDate())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .registrationNo(req.getRegistrationNo())
                .email(req.getEmail())
                .phone(req.getPhone())
                .department(req.getDepartment())
                .title(req.getTitle())
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(co)
                .build();

        if (req.isCreateUser() && req.getUsername() != null && !req.getUsername().isBlank()
                && req.getPassword() != null && !req.getPassword().isBlank()) {
            User user = User.builder()
                    .username(req.getUsername())
                    .password(passwordEncoder.encode(req.getPassword()))
                    .firstName(req.getFirstName())
                    .lastName(req.getLastName())
                    .email(req.getEmail())
                    .phone(req.getPhone())
                    .role(RoleType.SALES_PERSON)
                    .company(co)
                    .enabled(true)
                    .build();
            emp.setLinkedUser(userRepo.save(user));
        }

        return toDTO(employeeRepo.save(emp));
    }

    @Transactional
    public EmployeeDTO update(Long id, EmployeeRequest req) {
        validate(req, id);
        Employee emp = find(id);

        emp.setFirstName(req.getFirstName());
        emp.setLastName(req.getLastName());
        emp.setBirthDate(req.getBirthDate());
        emp.setStartDate(req.getStartDate());
        emp.setEndDate(req.getEndDate());
        emp.setRegistrationNo(req.getRegistrationNo());
        emp.setEmail(req.getEmail());
        emp.setPhone(req.getPhone());
        emp.setDepartment(req.getDepartment());
        emp.setTitle(req.getTitle());
        if (req.getStatus() != null) emp.setStatus(req.getStatus());

        if (emp.getLinkedUser() != null) {
            User user = emp.getLinkedUser();
            user.setFirstName(req.getFirstName());
            user.setLastName(req.getLastName());
            user.setEmail(req.getEmail());
            user.setPhone(req.getPhone());
            if ("Pasif".equals(emp.getStatus())) user.setEnabled(false);
            userRepo.save(user);
        }

        return toDTO(employeeRepo.save(emp));
    }

    @Transactional
    public void delete(Long id) {
        Employee emp = find(id);
        emp.setLinkedUser(null);
        employeeRepo.delete(emp);
    }

    private void validate(EmployeeRequest req, Long excludeId) {
        long exId = excludeId != null ? excludeId : -1L;
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && employeeRepo.existsByEmailAndCompanyIdAndIdNot(req.getEmail(), companyId(), exId)) {
            throw new IllegalArgumentException("Bu e-posta adresi zaten kullanımda.");
        }
        if (req.getRegistrationNo() != null
                && employeeRepo.existsByRegistrationNoAndCompanyIdAndIdNot(req.getRegistrationNo(), companyId(), exId)) {
            throw new IllegalArgumentException("Bu sicil numarası zaten kullanımda.");
        }
    }

    private Employee find(Long id) {
        return employeeRepo.findById(id)
                .filter(e -> e.getCompany().getId().equals(companyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Çalışan bulunamadı: " + id));
    }

    private EmployeeDTO toDTO(Employee e) {
        return EmployeeDTO.builder()
                .id(e.getId())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .fullName(e.getFirstName() + " " + e.getLastName())
                .birthDate(e.getBirthDate())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .registrationNo(e.getRegistrationNo())
                .email(e.getEmail())
                .phone(e.getPhone())
                .department(e.getDepartment())
                .title(e.getTitle())
                .status(e.getStatus())
                .linkedUserId(e.getLinkedUser() != null ? e.getLinkedUser().getId() : null)
                .linkedUsername(e.getLinkedUser() != null ? e.getLinkedUser().getUsername() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private Long companyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."))
                .getCompany().getId();
    }

    private Company company() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."))
                .getCompany();
    }
}
