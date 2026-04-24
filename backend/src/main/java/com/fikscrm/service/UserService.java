package com.fikscrm.service;

import com.fikscrm.dto.UserDTO;
import com.fikscrm.dto.UserRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.RoleType;
import com.fikscrm.entity.User;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAll() {
        return userRepo.findAllByCompanyIdOrderByLastNameAscFirstNameAsc(companyId())
                .stream().map(this::toDTO).toList();
    }

    public UserDTO getById(Long id) {
        return toDTO(find(id));
    }

    @Transactional
    public UserDTO create(UserRequest req) {
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new IllegalArgumentException("Şifre zorunludur.");
        }
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Bu kullanıcı adı zaten kullanımda.");
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Bu e-posta adresi zaten kullanımda.");
        }

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .role(req.getRole() != null ? req.getRole() : RoleType.SALES_PERSON)
                .company(company())
                .enabled(true)
                .build();

        return toDTO(userRepo.save(user));
    }

    @Transactional
    public UserDTO update(Long id, UserRequest req) {
        User user = find(id);

        if (!user.getUsername().equals(req.getUsername())
                && userRepo.existsByUsernameAndIdNot(req.getUsername(), id)) {
            throw new IllegalArgumentException("Bu kullanıcı adı zaten kullanımda.");
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && userRepo.existsByEmailAndIdNot(req.getEmail(), id)) {
            throw new IllegalArgumentException("Bu e-posta adresi zaten kullanımda.");
        }

        user.setUsername(req.getUsername());
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        if (req.getRole() != null) user.setRole(req.getRole());
        user.setEnabled(req.isEnabled());

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return toDTO(userRepo.save(user));
    }

    @Transactional
    public UserDTO toggleEnabled(Long id) {
        User user = find(id);
        user.setEnabled(!user.isEnabled());
        return toDTO(userRepo.save(user));
    }

    @Transactional
    public void delete(Long id) {
        userRepo.delete(find(id));
    }

    public List<UserDTO> getByRole(RoleType role) {
        return userRepo.findAllByCompanyIdAndRoleOrderByLastNameAscFirstNameAsc(companyId(), role)
                .stream().map(this::toDTO).toList();
    }

    public Map<String, Long> getRoleSummary() {
        Map<String, Long> summary = new java.util.LinkedHashMap<>();
        userRepo.countByRoleForCompany(companyId())
                .forEach(row -> summary.put(((RoleType) row[0]).name(), (Long) row[1]));
        return summary;
    }

    private User find(Long id) {
        return userRepo.findById(id)
                .filter(u -> u.getCompany().getId().equals(companyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + id));
    }

    private UserDTO toDTO(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .fullName(u.getFirstName() + " " + u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole())
                .enabled(u.isEnabled())
                .companyId(u.getCompany().getId())
                .createdAt(u.getCreatedAt())
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
