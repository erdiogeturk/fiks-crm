package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.UserDTO;
import com.fikscrm.dto.UserRequest;
import com.fikscrm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> create(@Valid @RequestBody UserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(userService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> update(@PathVariable Long id, @Valid @RequestBody UserRequest req) {
        return ResponseEntity.ok(ApiResponse.success(userService.update(id, req)));
    }

    @PatchMapping("/{id}/toggle-enabled")
    public ResponseEntity<ApiResponse<UserDTO>> toggleEnabled(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.toggleEnabled(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/by-role/{role}")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(ApiResponse.success(userService.getByRole(role)));
    }

    @GetMapping("/roles/summary")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getRoleSummary() {
        return ResponseEntity.ok(ApiResponse.success(userService.getRoleSummary()));
    }
}
