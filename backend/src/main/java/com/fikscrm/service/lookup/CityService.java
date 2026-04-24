package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.CityDTO;
import com.fikscrm.dto.lookup.CityRequest;
import com.fikscrm.entity.lookup.City;
import com.fikscrm.entity.lookup.Country;
import com.fikscrm.entity.lookup.Region;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.CityRepository;
import com.fikscrm.repository.lookup.CountryRepository;
import com.fikscrm.repository.lookup.RegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CityService extends LookupBaseService {

    private final CityRepository repo;
    private final CountryRepository countryRepo;
    private final RegionRepository regionRepo;

    public CityService(UserRepository userRepository, CityRepository repo,
                       CountryRepository countryRepo, RegionRepository regionRepo) {
        super(userRepository);
        this.repo = repo;
        this.countryRepo = countryRepo;
        this.regionRepo = regionRepo;
    }

    public List<CityDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CityDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CityDTO> getActiveByCountry(Long countryId) {
        return repo.findByCountryIdAndCompanyIdAndStatusOrderByNameAsc(countryId, getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CityDTO getById(Long id) {
        return toDTO(repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id)));
    }

    public List<CityDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CityDTO create(CityRequest req) {
        Long cid = getCurrentUserCompanyId();
        Country country = req.getCountryId() != null ? countryRepo.findByIdAndCompanyId(req.getCountryId(), cid).orElse(null) : null;
        Region region = req.getRegionId() != null ? regionRepo.findByIdAndCompanyId(req.getRegionId(), cid).orElse(null) : null;
        City e = City.builder()
                .code(req.getCode().trim().toUpperCase()).name(req.getName().trim())
                .country(country).region(region)
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany()).build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public CityDTO update(Long id, CityRequest req) {
        Long cid = getCurrentUserCompanyId();
        City e = repo.findByIdAndCompanyId(id, cid)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));
        Country country = req.getCountryId() != null ? countryRepo.findByIdAndCompanyId(req.getCountryId(), cid).orElse(null) : null;
        Region region = req.getRegionId() != null ? regionRepo.findByIdAndCompanyId(req.getRegionId(), cid).orElse(null) : null;
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        e.setCountry(country);
        e.setRegion(region);
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        City e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));
        repo.delete(e);
    }

    private CityDTO toDTO(City e) {
        return CityDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .countryId(e.getCountry() != null ? e.getCountry().getId() : null)
                .countryName(e.getCountry() != null ? e.getCountry().getName() : null)
                .regionId(e.getRegion() != null ? e.getRegion().getId() : null)
                .regionName(e.getRegion() != null ? e.getRegion().getName() : null)
                .status(e.getStatus()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
