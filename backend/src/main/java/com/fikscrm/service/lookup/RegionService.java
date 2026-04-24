package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.RegionDTO;
import com.fikscrm.dto.lookup.RegionRequest;
import com.fikscrm.entity.lookup.Country;
import com.fikscrm.entity.lookup.Region;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.CountryRepository;
import com.fikscrm.repository.lookup.RegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegionService extends LookupBaseService {

    private final RegionRepository repo;
    private final CountryRepository countryRepo;

    public RegionService(UserRepository userRepository, RegionRepository repo, CountryRepository countryRepo) {
        super(userRepository);
        this.repo = repo;
        this.countryRepo = countryRepo;
    }

    public List<RegionDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<RegionDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<RegionDTO> getActiveByCountry(Long countryId) {
        return repo.findByCountryIdAndCompanyIdAndStatusOrderByNameAsc(countryId, getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public RegionDTO getById(Long id) {
        return toDTO(repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", id)));
    }

    public List<RegionDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public RegionDTO create(RegionRequest req) {
        Country country = req.getCountryId() != null
                ? countryRepo.findByIdAndCompanyId(req.getCountryId(), getCurrentUserCompanyId()).orElse(null)
                : null;
        Region e = Region.builder()
                .code(req.getCode().trim().toUpperCase()).name(req.getName().trim())
                .country(country).status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany()).build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public RegionDTO update(Long id, RegionRequest req) {
        Region e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", id));
        Country country = req.getCountryId() != null
                ? countryRepo.findByIdAndCompanyId(req.getCountryId(), getCurrentUserCompanyId()).orElse(null)
                : null;
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        e.setCountry(country);
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        Region e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", id));
        repo.delete(e);
    }

    private RegionDTO toDTO(Region e) {
        return RegionDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .countryId(e.getCountry() != null ? e.getCountry().getId() : null)
                .countryName(e.getCountry() != null ? e.getCountry().getName() : null)
                .status(e.getStatus()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
