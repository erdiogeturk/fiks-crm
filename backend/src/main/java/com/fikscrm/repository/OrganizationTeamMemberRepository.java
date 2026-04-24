package com.fikscrm.repository;

import com.fikscrm.entity.OrganizationTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrganizationTeamMemberRepository extends JpaRepository<OrganizationTeamMember, Long> {

    List<OrganizationTeamMember> findAllByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    boolean existsByOrganizationIdAndEmployeeId(Long organizationId, Long employeeId);
}
