package com.fikscrm.controller;

import com.fikscrm.dto.ActivityDTO;
import com.fikscrm.dto.ActivityRequest;
import com.fikscrm.dto.ApiResponse;
import com.fikscrm.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getAllActivities() {
        return ResponseEntity.ok(ApiResponse.success(activityService.getAllActivities()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDTO>> getActivityById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getActivityById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ActivityDTO>>> getActivitiesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.getActivitiesByCustomer(customerId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityDTO>> createActivity(@Valid @RequestBody ActivityRequest request) {
        ActivityDTO activity = activityService.createActivity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Aktivite oluşturuldu", activity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDTO>> updateActivity(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Aktivite güncellendi", activityService.updateActivity(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.ok(ApiResponse.success("Aktivite silindi", null));
    }
}
