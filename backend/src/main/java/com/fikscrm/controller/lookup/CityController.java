package com.fikscrm.controller.lookup;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.lookup.CityDTO;
import com.fikscrm.dto.lookup.CityRequest;
import com.fikscrm.service.lookup.CityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lookup/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CityDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CityDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(service.getActive()));
    }

    @GetMapping("/active/by-country/{countryId}")
    public ResponseEntity<ApiResponse<List<CityDTO>>> getActiveByCountry(@PathVariable Long countryId) {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveByCountry(countryId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CityDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(service.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CityDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CityDTO>> create(@Valid @RequestBody CityRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CityDTO>> update(@PathVariable Long id, @Valid @RequestBody CityRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
