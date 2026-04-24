package com.fikscrm.controller.lookup;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.lookup.DistrictDTO;
import com.fikscrm.dto.lookup.DistrictRequest;
import com.fikscrm.service.lookup.DistrictService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lookup/districts")
@RequiredArgsConstructor
public class DistrictController {

    private final DistrictService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DistrictDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DistrictDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(service.getActive()));
    }

    @GetMapping("/active/by-city/{cityId}")
    public ResponseEntity<ApiResponse<List<DistrictDTO>>> getActiveByCity(@PathVariable Long cityId) {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveByCity(cityId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DistrictDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(service.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DistrictDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DistrictDTO>> create(@Valid @RequestBody DistrictRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DistrictDTO>> update(@PathVariable Long id, @Valid @RequestBody DistrictRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
