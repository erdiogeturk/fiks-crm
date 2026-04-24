package com.fikscrm.service.lookup;

import com.fikscrm.entity.User;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;

@RequiredArgsConstructor
public abstract class LookupBaseService {

    protected final UserRepository userRepository;

    protected Long getCurrentUserCompanyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany().getId();
    }

    protected com.fikscrm.entity.Company getCurrentUserCompany() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return user.getCompany();
    }
}
