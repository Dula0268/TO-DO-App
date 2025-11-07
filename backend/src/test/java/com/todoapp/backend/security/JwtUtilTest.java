package com.todoapp.backend.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    @Test
    void generateAndValidateToken_happyPath() {
        JwtUtil jwtUtil = new JwtUtil("testing_jwt_secret_must_be_long_enough_12345", 3600000L, false);
        jwtUtil.init();
        String token = jwtUtil.generateToken("user1");

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("user1", jwtUtil.getSubject(token));
    }

    @Test
    void invalidToken_isRejected() {
        JwtUtil jwtUtil = new JwtUtil("testing_jwt_secret_must_be_long_enough_12345", 3600000L, false);
        jwtUtil.init();

        String bad = "this.is.not.a.valid.token";
        assertFalse(jwtUtil.validateToken(bad));
        assertNull(jwtUtil.getSubject(bad));
    }

    @Test
    void failFast_onMissingSecret_throws() {
        JwtUtil jwtUtil = new JwtUtil("", 3600000L, true);
        assertThrows(IllegalStateException.class, jwtUtil::init);
    }
}
