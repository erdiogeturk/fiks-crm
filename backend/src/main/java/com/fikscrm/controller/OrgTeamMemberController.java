package com.fikscrm.controller;

import com.fikscrm.dto.ApiResponse;
import com.fikscrm.dto.OrgTeamMemberDTO;
import com.fikscrm.dto.OrgTeamMemberRequest;
import com.fikscrm.service.OrgTeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations/{orgId}/team")
@RequiredArgsConstructor
public class OrgTeamMemberController {

    private final OrgTeamMemberService teamService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrgTeamMemberDTO>>> getTeam(@PathVariable Long orgId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeam(orgId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrgTeamMemberDTO>> addMember(
            @PathVariable Long orgId,
            @Valid @RequestBody OrgTeamMemberRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(teamService.addMember(orgId, req)));
    }

    @GetMapping("/{memberId}")
    public ResponseEntity<ApiResponse<OrgTeamMemberDTO>> getMember(
            @PathVariable Long orgId,
            @PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getById(orgId, memberId)));
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<ApiResponse<OrgTeamMemberDTO>> updateMember(
            @PathVariable Long orgId,
            @PathVariable Long memberId,
            @Valid @RequestBody OrgTeamMemberRequest req) {
        return ResponseEntity.ok(ApiResponse.success(teamService.update(orgId, memberId, req)));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long orgId,
            @PathVariable Long memberId) {
        teamService.removeMember(orgId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
