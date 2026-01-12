package com.electronics.backend.services;

import com.electronics.backend.dto.AdminRegistrationDto;
import com.electronics.backend.dto.CustomerRegistrationDto;
import com.electronics.backend.dto.MagasinierCreationDto;
import com.electronics.backend.dto.MagasinierUpdateDto;
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

    // ========== CRUD MAGASINIERS ==========

    // CREATE
    @Transactional
    public Magasinier createMagasinier(MagasinierCreationDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        Magasinier magasinier = new Magasinier();
        magasinier.setFirstName(dto.getFirstName());
        magasinier.setLastName(dto.getLastName());
        magasinier.setEmail(dto.getEmail());
        magasinier.setPassword(passwordEncoder.encode(dto.getPassword()));
        magasinier.setEnabled(true);

        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            magasinier.setPhone(dto.getPhone().trim());
        }

        if (dto.getAddress() != null && !dto.getAddress().trim().isEmpty()) {
            magasinier.setAddress(dto.getAddress().trim());
        }

        // Champs spécifiques Magasinier (si présents dans le DTO)
        if (dto.getDepartment() != null) {
            magasinier.setDepartment(dto.getDepartment());
        }

        if (dto.getEmployeeId() != null) {
            magasinier.setEmployeeCode(dto.getEmployeeId());
        }

        return magasinierRepository.save(magasinier);
    }

    // READ ALL
    @Transactional(readOnly = true)
    public List<Magasinier> getAllMagasiniers() {
        return magasinierRepository.findAll();
    }

    // READ ONE
    @Transactional(readOnly = true)
    public Magasinier getMagasinierById(Long id) {
        return magasinierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Magasinier not found with id: " + id));
    }

    // UPDATE
    @Transactional
    public Magasinier updateMagasinier(Long id, MagasinierUpdateDto dto) {
        Magasinier magasinier = getMagasinierById(id);

        // Vérifier si l'email est modifié et s'il n'existe pas déjà
        if (!magasinier.getEmail().equals(dto.getEmail()) &&
                userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        // Mettre à jour les champs
        magasinier.setFirstName(dto.getFirstName());
        magasinier.setLastName(dto.getLastName());
        magasinier.setEmail(dto.getEmail());

        // Mettre à jour le mot de passe seulement si fourni
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            magasinier.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        // Mettre à jour les champs optionnels
        magasinier.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        magasinier.setAddress(dto.getAddress() != null ? dto.getAddress().trim() : null);

        return magasinierRepository.save(magasinier);
    }

    // DELETE
    @Transactional
    public void deleteMagasinier(Long id) {
        Magasinier magasinier = getMagasinierById(id);
        magasinierRepository.delete(magasinier);
    }

    // ========== MÉTHODES UTILITAIRES ==========

    @Transactional(readOnly = true)
    public List<Magasinier> searchMagasiniers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllMagasiniers();
        }

        String searchTerm = "%" + keyword.trim().toLowerCase() + "%";
        return magasinierRepository.searchByKeyword(searchTerm);
    }

    @Transactional
    public void toggleMagasinierStatus(Long id) {
        Magasinier magasinier = getMagasinierById(id);
        magasinier.setEnabled(!magasinier.isEnabled());
        magasinierRepository.save(magasinier);
    }
}
