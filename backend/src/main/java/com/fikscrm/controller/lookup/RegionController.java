package com.fikscrm.controller.lookup;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.lookup.RegionDTO;
import com.fikscrm.dto.lookup.RegionRequest;
import com.fikscrm.service.lookup.RegionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lookup/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegionDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<RegionDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(service.getActive()));
    }

    @GetMapping("/active/by-country/{countryId}")
    public ResponseEntity<ApiResponse<List<RegionDTO>>> getActiveByCountry(@PathVariable Long countryId) {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveByCountry(countryId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<RegionDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(service.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegionDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RegionDTO>> create(@Valid @RequestBody RegionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RegionDTO>> update(@PathVariable Long id, @Valid @RequestBody RegionRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
