package com.fikscrm.service;

import com.fikscrm.dto.OrgTeamMemberDTO;
import com.fikscrm.dto.OrgTeamMemberRequest;
import com.fikscrm.entity.Employee;
import com.fikscrm.entity.Organization;
import com.fikscrm.entity.OrganizationTeamMember;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.EmployeeRepository;
import com.fikscrm.repository.OrganizationRepository;
import com.fikscrm.repository.OrganizationTeamMemberRepository;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrgTeamMemberService {

    private final OrganizationTeamMemberRepository teamRepo;
    private final OrganizationRepository orgRepo;
    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;

    public List<OrgTeamMemberDTO> getTeam(Long orgId) {
        return teamRepo.findAllByOrganizationIdOrderByCreatedAtDesc(orgId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public OrgTeamMemberDTO addMember(Long orgId, OrgTeamMemberRequest req) {
        if (teamRepo.existsByOrganizationIdAndEmployeeId(orgId, req.getEmployeeId())) {
            throw new IllegalArgumentException("Bu çalışan zaten ekipte.");
        }

        Organization org = orgRepo.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizasyon bulunamadı: " + orgId));
        Employee emp = employeeRepo.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Çalışan bulunamadı: " + req.getEmployeeId()));

        OrganizationTeamMember member = OrganizationTeamMember.builder()
                .organization(org)
                .employee(emp)
                .teamRole(req.getTeamRole())
                .joinedAt(req.getJoinedAt())
                .company(org.getCompany())
                .build();

        return toDTO(teamRepo.save(member));
    }

    @Transactional
    public void removeMember(Long orgId, Long memberId) {
        OrganizationTeamMember member = teamRepo.findById(memberId)
                .filter(m -> m.getOrganization().getId().equals(orgId))
                .orElseThrow(() -> new ResourceNotFoundException("Ekip üyesi bulunamadı."));
        teamRepo.delete(member);
    }

    private OrgTeamMemberDTO toDTO(OrganizationTeamMember m) {
        Employee e = m.getEmployee();
        return OrgTeamMemberDTO.builder()
                .id(m.getId())
                .employeeId(e.getId())
                .employeeFullName(e.getFirstName() + " " + e.getLastName())
                .employeeTitle(e.getTitle())
                .employeeDepartment(e.getDepartment())
                .employeeEmail(e.getEmail())
                .teamRole(m.getTeamRole())
                .joinedAt(m.getJoinedAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
