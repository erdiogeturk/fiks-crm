package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.EmployeeDTO;
import com.fikscrm.dto.EmployeeRequest;
import com.fikscrm.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getActive()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.search(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDTO>> create(@Valid @RequestBody EmployeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(employeeService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest req) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
