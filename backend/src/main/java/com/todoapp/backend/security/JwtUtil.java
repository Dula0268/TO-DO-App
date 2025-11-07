package com.todoapp.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

/**
 * Single clean JwtUtil implementation.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final String jwtSecret;
    private final long jwtExpirationMs;
    private final boolean failFastOnInit;

    private Key signingKey;

    public JwtUtil(@Value("${jwt.secret:defaultTestSecret_defaultTestSecret}") String jwtSecret,
                   @Value("${jwt.expiration:3600000}") long jwtExpirationMs,
                   @Value("${jwt.fail-fast:false}") boolean failFastOnInit) {
        this.jwtSecret = jwtSecret == null ? "" : jwtSecret;
        this.jwtExpirationMs = jwtExpirationMs <= 0 ? 3600000L : jwtExpirationMs;
        this.failFastOnInit = failFastOnInit;
    }

    @PostConstruct
    void init() {
        try {
            if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
                String msg = "JWT secret is not configured or empty";
                if (failFastOnInit) {
                    throw new IllegalStateException(msg);
                } else {
                    logger.warn(msg + "; using fallback default for tests");
                }
            }

            byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

            if (secretBytes.length < 32) {
                logger.warn("Provided JWT secret is shorter than 32 bytes; padding to meet minimum length for HS256.");
                StringBuilder sb = new StringBuilder(jwtSecret == null ? "defaultTestSecret" : jwtSecret);
                while (sb.toString().getBytes(StandardCharsets.UTF_8).length < 32) {
                    sb.append(jwtSecret == null ? "defaultTestSecret" : jwtSecret);
                }
                secretBytes = sb.toString().getBytes(StandardCharsets.UTF_8);
            }

            signingKey = Keys.hmacShaKeyFor(secretBytes);
        } catch (Exception ex) {
            logger.error("Failed to initialize JwtUtil signing key: {}", ex.getMessage(), ex);
            if (failFastOnInit) {
                throw new IllegalStateException("Failed to initialize JwtUtil signing key", ex);
            }
            signingKey = Keys.hmacShaKeyFor("defaultTestSecret_defaultTestSecret_defaultTest".getBytes(StandardCharsets.UTF_8));
        }
    }

    public String generateToken(String subject) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey)
                .compact();
    }

    public String generateTokenWithClaims(String subject, Map<String, Object> claims) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey)
                .compact();
    }

    public String getSubject(String token) {
        Claims claims = getClaims(token);
        return claims == null ? null : claims.getSubject();
    }

    public Claims getClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception ex) {
            logger.debug("Failed to parse JWT claims: {}", ex.getMessage());
            return null;
        }
    }

    public Object getClaim(String token, String claimName) {
        Claims claims = getClaims(token);
        return claims == null ? null : claims.get(claimName);
    }

    public Date getExpirationDate(String token) {
        Claims claims = getClaims(token);
        return claims == null ? null : claims.getExpiration();
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDate(token);
            return expiration == null || expiration.before(new Date());
        } catch (Exception ex) {
            logger.debug("Error checking token expiration: {}", ex.getMessage());
            return true;
        }
    }

    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) return false;
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException ex) {
            logger.debug("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.debug("JWT token is expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.debug("JWT token is unsupported: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.debug("JWT claims string is empty: {}", ex.getMessage());
        } catch (Exception ex) {
            logger.debug("Unexpected error validating JWT: {}", ex.getMessage());
        }
        return false;
    }

    public boolean validateTokenForSubject(String token, String subject) {
        try {
            String tokenSubject = getSubject(token);
            return validateToken(token) && tokenSubject != null && tokenSubject.equals(subject);
        } catch (Exception ex) {
            logger.debug("Error validating token for subject: {}", ex.getMessage());
            return false;
        }
    }

    public long getRemainingTime(String token) {
        try {
            Date expiration = getExpirationDate(token);
            if (expiration == null) return 0;
            long remainingTime = expiration.getTime() - new Date().getTime();
            return Math.max(0, remainingTime);
        } catch (Exception ex) {
            logger.debug("Error getting remaining time: {}", ex.getMessage());
            return 0;
        }
    }
}
