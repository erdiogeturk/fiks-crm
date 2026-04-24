package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.CurrencyDTO;
import com.fikscrm.dto.lookup.CurrencyRequest;
import com.fikscrm.entity.lookup.CurrencyDef;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.CurrencyDefRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CurrencyService extends LookupBaseService {

    private final CurrencyDefRepository repo;

    public CurrencyService(UserRepository userRepository, CurrencyDefRepository repo) {
        super(userRepository);
        this.repo = repo;
    }

    public List<CurrencyDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CurrencyDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CurrencyDTO getById(Long id) {
        return toDTO(repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Currency", "id", id)));
    }

    public List<CurrencyDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CurrencyDTO create(CurrencyRequest req) {
        CurrencyDef e = CurrencyDef.builder()
                .code(req.getCode().trim().toUpperCase()).name(req.getName().trim())
                .symbol(req.getSymbol()).status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany()).build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public CurrencyDTO update(Long id, CurrencyRequest req) {
        CurrencyDef e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Currency", "id", id));
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        e.setSymbol(req.getSymbol());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        CurrencyDef e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Currency", "id", id));
        repo.delete(e);
    }

    private CurrencyDTO toDTO(CurrencyDef e) {
        return CurrencyDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .symbol(e.getSymbol()).status(e.getStatus())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
