package com.fikscrm.repository;

import com.fikscrm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsernameAndIdNot(String username, Long id);
    boolean existsByEmailAndIdNot(String email, Long id);
    List<User> findAllByCompanyIdOrderByLastNameAscFirstNameAsc(Long companyId);
    List<User> findAllByCompanyIdAndRoleOrderByLastNameAscFirstNameAsc(Long companyId, String role);

    @Query("SELECT u.role, COUNT(u) FROM User u WHERE u.company.id = :companyId GROUP BY u.role")
    List<Object[]> countByRoleForCompany(@Param("companyId") Long companyId);
}
