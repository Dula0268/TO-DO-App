package com.todoapp.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    // Simple in-memory user store for local development only
    private static final Map<String, UserRecord> USERS = new ConcurrentHashMap<>();

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        if (req == null || req.email == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Invalid request"));
        }
        if (USERS.containsKey(req.email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(null, null, "User already exists"));
        }
        USERS.put(req.email, new UserRecord(req.name, req.email, req.password));
        String token = "dev-token-" + UUID.randomUUID();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, token, "Registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        if (req == null || req.email == null) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Invalid request"));
        }
        UserRecord u = USERS.get(req.email);
        if (u == null || (u.password != null && !u.password.equals(req.password))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, "Invalid credentials"));
        }
        String token = "dev-token-" + UUID.randomUUID();
        return ResponseEntity.ok(new AuthResponse(token, token, "OK"));
    }

    // --- DTOs / simple records ---
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
        public String token;
        public String accessToken;
        public String message;

        public AuthResponse(String token, String accessToken, String message) {
            this.token = token;
            this.accessToken = accessToken;
            this.message = message;
        }
    }

    private static class UserRecord {
        public final String name;
        public final String email;
        public final String password;

        public UserRecord(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }
    }
}
