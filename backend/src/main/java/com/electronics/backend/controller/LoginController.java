package com.electronics.backend.controller;

import com.electronics.backend.repository.UserRepository;
import com.electronics.backend.services.GoogleAuthenticatorUtils;
import com.electronics.backend.services.jwt.UserServiceImpl;
import com.electronics.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")  // Changé de "/api/login" à "/api/auth"
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private JwtUtil jwtUtils;

    @Autowired
    private GoogleAuthenticatorUtils googleAuthenticatorUtils;

    @Autowired
    private UserRepository userRepository; // Ajouté

}
