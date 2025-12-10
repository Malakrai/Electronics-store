package com.electronics.backend.services;

import com.electronics.backend.model.User;
import com.electronics.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println(" CustomUserDetailsService - Recherche utilisateur: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println(" Utilisateur non trouvé: " + email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        System.out.println(" Utilisateur trouvé: " + user.getEmail());
        System.out.println(" Password dans DB: " + (user.getPassword() != null ? "[PRESENT]" : "[NULL]"));
        System.out.println(" UserType: " + user.getUserType());
        System.out.println(" Enabled: " + user.isEnabled());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                true, true, true,
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        String role = user.getUserType();
        System.out.println(" Conversion rôle: " + role + " -> ROLE_" + role);

        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
