package com.electronics.backend.services;

import com.electronics.backend.dto.AdminRegistrationDto;
import com.electronics.backend.dto.CustomerRegistrationDto;
import com.electronics.backend.dto.MagasinierCreationDto;
import com.electronics.backend.dto.MagasinierUpdateDto;
import com.electronics.backend.dto.AdminCreateUserDto;
import com.electronics.backend.dto.AdminUpdateUserDto;
import com.electronics.backend.model.Admin;
import com.electronics.backend.model.Customer;
import com.electronics.backend.model.Magasinier;
import com.electronics.backend.model.User;
import com.electronics.backend.repository.AdminRepository;
import com.electronics.backend.repository.CustomerRepository;
import com.electronics.backend.repository.MagasinierRepository;
import com.electronics.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final CustomerRepository customerRepository;
    private final MagasinierRepository magasinierRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleAuthenticatorUtils googleAuthService;

    public AuthService(UserRepository userRepository,
                       AdminRepository adminRepository,
                       CustomerRepository customerRepository,
                       MagasinierRepository magasinierRepository,
                       PasswordEncoder passwordEncoder,
                       GoogleAuthenticatorUtils googleAuthService) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.customerRepository = customerRepository;
        this.magasinierRepository = magasinierRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleAuthService = googleAuthService;
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        return user;
    }

    public boolean verifyGoogleAuth(Long userId, int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user instanceof Admin && user.isGoogleAuthEnabled()) {
            return googleAuthService.verifyCode(user.getGoogleAuthSecret(), String.valueOf(code));
        }

        return true;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Admin registerAdmin(AdminRegistrationDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        Admin admin = new Admin();
        admin.setFirstName(dto.getFirstName());
        admin.setLastName(dto.getLastName());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));
        admin.setEnabled(true);
        admin.setGoogleAuthEnabled(dto.isEnableGoogleAuth());

        if (dto.isEnableGoogleAuth()) {
            String secret = googleAuthService.generateSecret();
            admin.setGoogleAuthSecret(secret);
        }

        return adminRepository.save(admin);
    }

    @Transactional
    public Customer registerCustomer(CustomerRegistrationDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        Customer customer = new Customer();
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPassword(passwordEncoder.encode(dto.getPassword()));
        customer.setEnabled(true);

        return customerRepository.save(customer);
    }

    // ========== MÉTHODES GÉNÉRIQUES (leur version) ==========

    @Transactional
    public User adminCreateUser(AdminCreateUserDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        String role = dto.getRole() == null ? "" : dto.getRole().toUpperCase();

        switch (role) {
            case "ADMIN" -> {
                Admin admin = new Admin();
                admin.setFirstName(dto.getFirstName());
                admin.setLastName(dto.getLastName());
                admin.setEmail(dto.getEmail());
                admin.setPassword(passwordEncoder.encode(dto.getPassword()));
                admin.setEnabled(true);
                return adminRepository.save(admin);
            }

            case "MAGASINIER" -> {
                Magasinier m = new Magasinier();
                m.setFirstName(dto.getFirstName());
                m.setLastName(dto.getLastName());
                m.setEmail(dto.getEmail());
                m.setPassword(passwordEncoder.encode(dto.getPassword()));
                m.setEnabled(true);
                return magasinierRepository.save(m);
            }

            default -> throw new RuntimeException("Role invalide: " + dto.getRole());
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User adminUpdateUser(Long id, AdminUpdateUserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email already used");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getEnabled() != null) user.setEnabled(dto.getEnabled());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void adminDeleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    // ========== MÉTHODES SPÉCIFIQUES MAGASINIER (votre version - optionnel) ==========
    // Vous pouvez garder ces méthodes si votre frontend les utilise

    @Transactional
    public Magasinier createMagasinier(MagasinierCreationDto dto) {
        // Convertir en AdminCreateUserDto et utiliser adminCreateUser
        AdminCreateUserDto adminDto = new AdminCreateUserDto();
        adminDto.setFirstName(dto.getFirstName());
        adminDto.setLastName(dto.getLastName());
        adminDto.setEmail(dto.getEmail());
        adminDto.setPassword(dto.getPassword());
        adminDto.setRole("MAGASINIER");

        User user = adminCreateUser(adminDto);
        return (Magasinier) user;
    }

    @Transactional(readOnly = true)
    public List<Magasinier> getAllMagasiniers() {
        return magasinierRepository.findAll();
    }
}