package com.todoapp.backend.controller;

import com.todoapp.backend.dto.request.LoginRequestDTO;
import com.todoapp.backend.dto.request.RegisterRequestDTO;
import com.todoapp.backend.dto.response.AuthResponseDTO;
import com.todoapp.backend.dto.response.VerifyResponseDTO;
import com.todoapp.backend.model.User;
import com.todoapp.backend.security.JwtUtil;
import com.todoapp.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    // ---------------- REGISTER ----------------
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null || req.getName() == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new AuthResponseDTO(null, "Invalid request"));
        }
        try {
            User user = userService.register(req.getName(), req.getEmail(), req.getPassword());
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new AuthResponseDTO(token, "Registered successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new AuthResponseDTO(null, ex.getMessage()));
        }
    }

    // ---------------- LOGIN ----------------
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO req) {
        if (req == null || req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new AuthResponseDTO(null, "Invalid request"));
        }
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            String token = jwtUtil.generateToken(auth.getName());
            return ResponseEntity
                    .ok(new AuthResponseDTO(token, "Login successful"));
        } catch (AuthenticationException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDTO(null, "Invalid credentials"));
        }
    }

    // ---------------- VERIFY TOKEN ----------------
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader(name = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        boolean valid = jwtUtil.validateToken(token);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String subject = jwtUtil.getSubject(token);
        String name = null;
        try {
            var userOpt = userService.findByEmail(subject);
            if (userOpt.isPresent()) {
                name = userOpt.get().getName();
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(new VerifyResponseDTO(subject, name));
    }
}
