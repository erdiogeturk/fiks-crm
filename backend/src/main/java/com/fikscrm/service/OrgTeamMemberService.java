package com.fikscrm.service;

import com.fikscrm.dto.OrgTeamMemberDTO;
import com.fikscrm.dto.OrgTeamMemberRequest;
import com.fikscrm.entity.Employee;
import com.fikscrm.entity.Organization;
import com.fikscrm.entity.OrganizationTeamMember;
import com.fikscrm.entity.lookup.Position;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.EmployeeRepository;
import com.fikscrm.repository.OrganizationRepository;
import com.fikscrm.repository.OrganizationTeamMemberRepository;
import com.fikscrm.repository.UserRepository;
import com.fikscrm.repository.lookup.PositionRepository;
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
    private final PositionRepository positionRepo;

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

        Employee manager = req.getManagerId() != null
                ? employeeRepo.findById(req.getManagerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Çalışan bulunamadı: " + req.getManagerId()))
                : null;

        Position position = req.getPositionId() != null
                ? positionRepo.findById(req.getPositionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Pozisyon bulunamadı: " + req.getPositionId()))
                : null;

        OrganizationTeamMember member = OrganizationTeamMember.builder()
                .organization(org)
                .employee(emp)
                .teamRole(req.getTeamRole())
                .position(position)
                .status(req.getStatus() != null ? req.getStatus() : "Aktif")
                .validFrom(req.getValidFrom())
                .validTo(req.getValidTo())
                .manager(manager)
                .joinedAt(req.getJoinedAt())
                .company(org.getCompany())
                .build();

        return toDTO(teamRepo.save(member));
    }

    public OrgTeamMemberDTO getById(Long orgId, Long memberId) {
        return toDTO(findMember(orgId, memberId));
    }

    @Transactional
    public OrgTeamMemberDTO update(Long orgId, Long memberId, OrgTeamMemberRequest req) {
        OrganizationTeamMember m = findMember(orgId, memberId);

        Employee manager = req.getManagerId() != null
                ? employeeRepo.findById(req.getManagerId())
                        .orElseThrow(() -> new ResourceNotFoundException("Çalışan bulunamadı: " + req.getManagerId()))
                : null;

        Position position = req.getPositionId() != null
                ? positionRepo.findById(req.getPositionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Pozisyon bulunamadı: " + req.getPositionId()))
                : null;

        m.setTeamRole(req.getTeamRole());
        m.setPosition(position);
        m.setStatus(req.getStatus() != null ? req.getStatus() : m.getStatus());
        m.setValidFrom(req.getValidFrom());
        m.setValidTo(req.getValidTo());
        m.setManager(manager);
        m.setJoinedAt(req.getJoinedAt());

        return toDTO(teamRepo.save(m));
    }

    @Transactional
    public void removeMember(Long orgId, Long memberId) {
        teamRepo.delete(findMember(orgId, memberId));
    }

    private OrganizationTeamMember findMember(Long orgId, Long memberId) {
        return teamRepo.findById(memberId)
                .filter(m -> m.getOrganization().getId().equals(orgId))
                .orElseThrow(() -> new ResourceNotFoundException("Ekip üyesi bulunamadı."));
    }

    private OrgTeamMemberDTO toDTO(OrganizationTeamMember m) {
        Employee e = m.getEmployee();
        Employee mgr = m.getManager();
        return OrgTeamMemberDTO.builder()
                .id(m.getId())
                .employeeId(e.getId())
                .employeeFullName(e.getFirstName() + " " + e.getLastName())
                .employeeTitle(e.getTitle())
                .employeeDepartment(e.getDepartment())
                .employeeEmail(e.getEmail())
                .teamRole(m.getTeamRole())
                .positionId(m.getPosition() != null ? m.getPosition().getId() : null)
                .positionName(m.getPosition() != null ? m.getPosition().getName() : null)
                .status(m.getStatus())
                .validFrom(m.getValidFrom())
                .validTo(m.getValidTo())
                .managerId(mgr != null ? mgr.getId() : null)
                .managerFullName(mgr != null ? mgr.getFirstName() + " " + mgr.getLastName() : null)
                .joinedAt(m.getJoinedAt())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
