package com.todoapp.backend.controller;

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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        if (req == null || req.email == null || req.password == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Invalid request"));
        }
        try {
            User u = userService.register(req.name, req.email, req.password);
            String token = jwtUtil.generateToken(u.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, "Registered"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new AuthResponse(null, ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        if (req == null || req.email == null || req.password == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, "Invalid request"));
        }
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email, req.password)
            );
            String token = jwtUtil.generateToken(auth.getName());
            return ResponseEntity.ok(new AuthResponse(token, "OK"));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(null, "Invalid credentials"));
        }
    }

    /**
     * Verify endpoint for clients to validate a token.
     * Returns 200 OK when token is valid, 401 when invalid/expired/missing.
     */
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
        // Optionally return subject (email) to the client
        String subject = jwtUtil.getSubject(token);
        return ResponseEntity.ok(new VerifyResponse(subject));
    }

    // DTOs
    public static class RegisterRequest {
        public String name;
        public String email;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class AuthResponse {
        public String accessToken;
        public String message;

        public AuthResponse(String accessToken, String message) {
            this.accessToken = accessToken;
            this.message = message;
        }
    }

    public static class VerifyResponse {
        public String subject;

        public VerifyResponse(String subject) {
            this.subject = subject;
        }
    }
}
