package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.ProjectDTO;
import com.fikscrm.dto.ProjectRequest;
import com.fikscrm.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getAllProjects() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(@PathVariable Long id) {
        ProjectDTO project = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getProjectsByCustomer(@PathVariable Long customerId) {
        List<ProjectDTO> projects = projectService.getProjectsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getProjectsByStatus(@PathVariable String status) {
        List<ProjectDTO> projects = projectService.getProjectsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> searchProjects(@RequestParam String q) {
        List<ProjectDTO> projects = projectService.searchProjects(q);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectDTO project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(
            @PathVariable Long id, 
            @Valid @RequestBody ProjectRequest request) {
        ProjectDTO project = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
    }
}
