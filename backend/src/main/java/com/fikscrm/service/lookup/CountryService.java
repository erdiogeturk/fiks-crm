package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.CountryDTO;
import com.fikscrm.dto.lookup.CountryRequest;
import com.fikscrm.entity.lookup.Country;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.CountryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CountryService extends LookupBaseService {

    private final CountryRepository repo;

    public CountryService(UserRepository userRepository, CountryRepository repo) {
        super(userRepository);
        this.repo = repo;
    }

    public List<CountryDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CountryDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CountryDTO getById(Long id) {
        Country e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Country", "id", id));
        return toDTO(e);
    }

    public List<CountryDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CountryDTO create(CountryRequest req) {
        Country e = Country.builder()
                .code(req.getCode().trim().toUpperCase())
                .name(req.getName().trim())
                .phoneCode(req.getPhoneCode())
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany())
                .build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public CountryDTO update(Long id, CountryRequest req) {
        Country e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Country", "id", id));
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        e.setPhoneCode(req.getPhoneCode());
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Country e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Country", "id", id));
        repo.delete(e);
    }

    private CountryDTO toDTO(Country e) {
        return CountryDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .phoneCode(e.getPhoneCode()).status(e.getStatus())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
