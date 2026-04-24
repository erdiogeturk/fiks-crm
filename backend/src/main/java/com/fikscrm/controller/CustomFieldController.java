package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.ColumnInfoDTO;
import com.fikscrm.dto.CustomFieldPreviewDTO;
import com.fikscrm.dto.CustomFieldRequest;
import com.fikscrm.service.CustomFieldService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/custom-fields")
@RequiredArgsConstructor
public class CustomFieldController {

    private final CustomFieldService customFieldService;

    /** Full column list: system columns + custom fields for given entity type */
    @GetMapping("/{entityType}/columns")
    public ResponseEntity<ApiResponse<List<ColumnInfoDTO>>> getColumns(@PathVariable String entityType) {
        return ResponseEntity.ok(ApiResponse.success(customFieldService.getColumns(entityType)));
    }

    /** Generate DDL preview — no DB changes */
    @PostMapping("/{entityType}/preview")
    public ResponseEntity<ApiResponse<CustomFieldPreviewDTO>> preview(
            @PathVariable String entityType,
            @Valid @RequestBody CustomFieldRequest req) {
        return ResponseEntity.ok(ApiResponse.success(customFieldService.preview(entityType, req)));
    }

    /** Apply DDL + save metadata — user has confirmed the preview */
    @PostMapping("/{entityType}/apply")
    public ResponseEntity<ApiResponse<ColumnInfoDTO>> apply(
            @PathVariable String entityType,
            @Valid @RequestBody CustomFieldRequest req) {
        return ResponseEntity.ok(ApiResponse.success(customFieldService.apply(entityType, req)));
    }

    /** Soft-delete: marks custom field INACTIVE (column stays in DB) */
    @DeleteMapping("/{entityType}/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable String entityType,
            @PathVariable Long id) {
        customFieldService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
