package com.todoapp.backend.controller;

import com.todoapp.backend.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest req) {
        if (req == null || req.email == null || req.password == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Invalid request", null, HttpStatus.BAD_REQUEST.value()));
        }

        try {
            User u = userService.register(req.name, req.email, req.password);
            String token = jwtUtil.generateToken(u.getEmail());
            AuthResponse data = new AuthResponse(token, "Registered");
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("User registered successfully", data, HttpStatus.CREATED.value()));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(ex.getMessage(), null, HttpStatus.CONFLICT.value()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) {
        if (req == null || req.email == null || req.password == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Invalid request", null, HttpStatus.BAD_REQUEST.value()));
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email, req.password)
            );
            String token = jwtUtil.generateToken(auth.getName());
            AuthResponse data = new AuthResponse(token, "OK");
            return ResponseEntity.ok(new ApiResponse<>("Login successful", data, HttpStatus.OK.value()));

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("Invalid credentials", null, HttpStatus.UNAUTHORIZED.value()));
        }
    }

    /**
     * Verify endpoint for clients to validate a token.
     * Returns 200 OK when token is valid, 401 when invalid/expired/missing.
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<VerifyResponse>> verifyToken(
            @RequestHeader(name = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("Missing or invalid token", null, HttpStatus.UNAUTHORIZED.value()));
        }

        String token = authHeader.substring(7);
        boolean valid = jwtUtil.validateToken(token);

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("Invalid or expired token", null, HttpStatus.UNAUTHORIZED.value()));
        }

        String subject = jwtUtil.getSubject(token);
        String name = null;

        try {
            var userOpt = userService.findByEmail(subject);
            if (userOpt.isPresent()) {
                name = userOpt.get().getName();
            }
        } catch (Exception e) {
            // Ignore and continue
        }

        VerifyResponse data = new VerifyResponse(subject, name);
        return ResponseEntity.ok(new ApiResponse<>("Token verified successfully", data, HttpStatus.OK.value()));
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
        public String name;

        public VerifyResponse(String subject, String name) {
            this.subject = subject;
            this.name = name;
        }
    }
}
