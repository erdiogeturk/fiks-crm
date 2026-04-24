package com.fikscrm.service.lookup;

import com.fikscrm.dto.lookup.DistrictDTO;
import com.fikscrm.dto.lookup.DistrictRequest;
import com.fikscrm.entity.lookup.City;
import com.fikscrm.entity.lookup.District;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.CityRepository;
import com.fikscrm.repository.lookup.DistrictRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DistrictService extends LookupBaseService {

    private final DistrictRepository repo;
    private final CityRepository cityRepo;

    public DistrictService(UserRepository userRepository, DistrictRepository repo, CityRepository cityRepo) {
        super(userRepository);
        this.repo = repo;
        this.cityRepo = cityRepo;
    }

    public List<DistrictDTO> getAll() {
        return repo.findByCompanyIdOrderByNameAsc(getCurrentUserCompanyId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DistrictDTO> getActive() {
        return repo.findByCompanyIdAndStatusOrderByNameAsc(getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DistrictDTO> getActiveByCity(Long cityId) {
        return repo.findByCityIdAndCompanyIdAndStatusOrderByNameAsc(cityId, getCurrentUserCompanyId(), "Aktif")
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DistrictDTO getById(Long id) {
        return toDTO(repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("District", "id", id)));
    }

    public List<DistrictDTO> search(String q) {
        return repo.search(getCurrentUserCompanyId(), q).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public DistrictDTO create(DistrictRequest req) {
        Long cid = getCurrentUserCompanyId();
        City city = req.getCityId() != null ? cityRepo.findByIdAndCompanyId(req.getCityId(), cid).orElse(null) : null;
        District e = District.builder()
                .code(req.getCode().trim().toUpperCase()).name(req.getName().trim())
                .city(city).status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .company(getCurrentUserCompany()).build();
        return toDTO(repo.save(e));
    }

    @Transactional
    public DistrictDTO update(Long id, DistrictRequest req) {
        Long cid = getCurrentUserCompanyId();
        District e = repo.findByIdAndCompanyId(id, cid)
                .orElseThrow(() -> new ResourceNotFoundException("District", "id", id));
        City city = req.getCityId() != null ? cityRepo.findByIdAndCompanyId(req.getCityId(), cid).orElse(null) : null;
        e.setCode(req.getCode().trim().toUpperCase());
        e.setName(req.getName().trim());
        e.setCity(city);
        if (req.getStatus() != null) e.setStatus(req.getStatus());
        return toDTO(repo.save(e));
    }

    @Transactional
    public void delete(Long id) {
        District e = repo.findByIdAndCompanyId(id, getCurrentUserCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("District", "id", id));
        repo.delete(e);
    }

    private DistrictDTO toDTO(District e) {
        return DistrictDTO.builder()
                .id(e.getId()).code(e.getCode()).name(e.getName())
                .cityId(e.getCity() != null ? e.getCity().getId() : null)
                .cityName(e.getCity() != null ? e.getCity().getName() : null)
                .status(e.getStatus()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
