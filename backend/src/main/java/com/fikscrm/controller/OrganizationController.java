package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.OrganizationDTO;
import com.fikscrm.dto.OrganizationRequest;
import com.fikscrm.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/search-help")
    public ResponseEntity<ApiResponse<List<OrganizationDTO>>> getActiveForSearchHelp() {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveForSearchHelp()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<OrganizationDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(service.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrganizationDTO>> create(@Valid @RequestBody OrganizationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationDTO>> update(
            @PathVariable Long id, @Valid @RequestBody OrganizationRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
