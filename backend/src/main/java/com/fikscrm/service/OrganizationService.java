package com.fikscrm.service;

import com.fikscrm.dto.OrganizationDTO;
import com.fikscrm.dto.OrganizationRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.Organization;
import com.fikscrm.entity.User;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.OrganizationRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository repo;
    private final UserRepository userRepository;

    public List<OrganizationDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(companyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public OrganizationDTO getById(Long id) {
        return toDTO(find(id));
    }

    public List<OrganizationDTO> getActiveForSearchHelp() {
        return repo.findActiveForSearchHelp(companyId(), LocalDate.now())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrganizationDTO> search(String q) {
        return repo.search(companyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public OrganizationDTO create(OrganizationRequest req) {
        validate(req, null);
        Organization parent = resolveParent(req.getParentId());
        Organization e = Organization.builder()
                .code(req.getCode().trim())
                .name(req.getName().trim())
                .parent(parent)
                .validFrom(req.getValidFrom())
                .validTo(req.getValidTo())
                .status(req.getStatus() != null ? req.getStatus() : "Taslak")
                .company(company())
                .build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public OrganizationDTO update(Long id, OrganizationRequest req) {
        validate(req, id);
        Organization e = find(id);
        Organization parent = resolveParent(req.getParentId());
        // Prevent self-reference
        if (parent != null && parent.getId().equals(id)) {
            throw new IllegalArgumentException("Organizasyon kendisine bağlı olamaz.");
        }
        e.setCode(req.getCode().trim());
        e.setName(req.getName().trim());
        e.setParent(parent);
        e.setValidFrom(req.getValidFrom());
        e.setValidTo(req.getValidTo());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private void validate(OrganizationRequest req, Long excludeId) {
        if (req.getValidFrom() != null && req.getValidTo() != null
                && !req.getValidFrom().isBefore(req.getValidTo())) {
            throw new IllegalArgumentException("Geçerlilik Başlangıç Tarihi, Bitiş Tarihi'nden küçük olmalıdır.");
        }
        if ("Aktif".equals(req.getStatus()) && req.getValidFrom() != null && req.getValidTo() != null) {
            LocalDate today = LocalDate.now();
            if (today.isBefore(req.getValidFrom()) || today.isAfter(req.getValidTo())) {
                throw new IllegalArgumentException("Organizasyon Durumu 'Aktif' olabilmesi için bugünkü tarih geçerlilik aralığında olmalıdır.");
            }
        }
    }

    private Organization resolveParent(Long parentId) {
        if (parentId == null) return null;
        return repo.findByIdAndCompanyId(parentId, companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", parentId));
    }

    private Organization find(Long id) {
        return repo.findByIdAndCompanyId(id, companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));
    }

    private OrganizationDTO toDTO(Organization e) {
        return OrganizationDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .parentId(e.getParent() != null ? e.getParent().getId() : null)
                .parentName(e.getParent() != null ? e.getParent().getName() : null)
                .validFrom(e.getValidFrom()).validTo(e.getValidTo())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }

    private Long companyId() {
        return company().getId();
    }

    private Company company() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany();
    }
}
