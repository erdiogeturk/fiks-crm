package com.fikscrm.controller.lookup;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.lookup.CountryDTO;
import com.fikscrm.dto.lookup.CountryRequest;
import com.fikscrm.service.lookup.CountryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lookup/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CountryDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CountryDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(service.getActive()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CountryDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(service.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CountryDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CountryDTO>> create(@Valid @RequestBody CountryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CountryDTO>> update(@PathVariable Long id, @Valid @RequestBody CountryRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
