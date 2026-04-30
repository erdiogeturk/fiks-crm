package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.SalesDocumentDTO;
import com.fikscrm.dto.SalesDocumentRequest;
import com.fikscrm.service.SalesDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-documents")
@RequiredArgsConstructor
public class SalesDocumentController {

    private final SalesDocumentService salesDocumentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesDocumentDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(salesDocumentService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesDocumentDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(salesDocumentService.getById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<SalesDocumentDTO>>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(salesDocumentService.getByCustomer(customerId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SalesDocumentDTO>> create(@Valid @RequestBody SalesDocumentRequest request) {
        SalesDocumentDTO created = salesDocumentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Satış belgesi oluşturuldu", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesDocumentDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody SalesDocumentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Satış belgesi güncellendi", salesDocumentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        salesDocumentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Satış belgesi silindi", null));
    }
}
