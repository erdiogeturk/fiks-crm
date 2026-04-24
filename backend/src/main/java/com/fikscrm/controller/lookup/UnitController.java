package com.fikscrm.controller.lookup;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.lookup.UnitDTO;
import com.fikscrm.dto.lookup.UnitRequest;
import com.fikscrm.service.lookup.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lookup/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UnitDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(service.getActive()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UnitDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(service.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UnitDTO>> create(@Valid @RequestBody UnitRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitDTO>> update(@PathVariable Long id, @Valid @RequestBody UnitRequest req) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
