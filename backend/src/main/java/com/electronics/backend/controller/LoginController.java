package com.electronics.backend.controller;

import com.electronics.backend.dto.LoginRequest;
import com.electronics.backend.dto.LoginResponse;
import com.electronics.backend.model.User;
import com.electronics.backend.repository.UserRepository;
import com.electronics.backend.services.AuthServiceT;
import com.electronics.backend.services.GoogleAuthenticatorUtils;
import com.electronics.backend.services.jwt.UserServiceImpl;
import com.electronics.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
