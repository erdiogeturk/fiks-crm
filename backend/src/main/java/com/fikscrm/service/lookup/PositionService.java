package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.PositionDTO;
import com.fikscrm.dto.lookup.PositionRequest;
import com.fikscrm.entity.lookup.Position;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PositionService extends LookupBaseService {

    private final PositionRepository repo;

    public PositionService(UserRepository userRepository, PositionRepository repo) {
        super(userRepository);
        this.repo = repo;
    }

    public List<PositionDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PositionDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PositionDTO getById(Long id) {
        return toDTO(repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id)));
    }

    public List<PositionDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public PositionDTO create(PositionRequest req) {
        Position e = Position.builder()
                .code(req.getCode().trim().toUpperCase()).name(req.getName().trim())
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany()).build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public PositionDTO update(Long id, PositionRequest req) {
        Position e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Position e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Position", "id", id));
        repo.delete(e);
    }

    private PositionDTO toDTO(Position e) {
        return PositionDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .status(e.getStatus()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
