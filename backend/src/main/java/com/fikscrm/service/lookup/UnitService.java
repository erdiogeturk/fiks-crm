package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.UnitDTO;
import com.fikscrm.dto.lookup.UnitRequest;
import com.fikscrm.entity.lookup.Unit;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnitService extends LookupBaseService {

    private final UnitRepository repo;

    public UnitService(UserRepository userRepository, UnitRepository repo) {
        super(userRepository);
        this.repo = repo;
    }

    public List<UnitDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<UnitDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public UnitDTO getById(Long id) {
        return toDTO(repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id)));
    }

    public List<UnitDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public UnitDTO create(UnitRequest req) {
        Unit e = Unit.builder()
                .code(req.getCode().trim().toUpperCase()).name(req.getName().trim())
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany()).build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public UnitDTO update(Long id, UnitRequest req) {
        Unit e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Unit e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));
        repo.delete(e);
    }

    private UnitDTO toDTO(Unit e) {
        return UnitDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .status(e.getStatus()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
