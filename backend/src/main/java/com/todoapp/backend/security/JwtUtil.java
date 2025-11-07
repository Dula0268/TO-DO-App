package com.todoapp.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

/**
 * JWT Utility class for generating, validating, and extracting information from JWT tokens.
 * Uses HMAC SHA-256 algorithm for signing tokens.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

@Value("${app.jwt.secret}")
private String jwtSecret;

@Value("${app.jwt.expiration-seconds:3600}")
private long jwtExpirationSeconds;

    /**
     * Generate signing key from secret
     */
    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT token with subject (username/email)
     * @param subject The subject of the token (typically username or email)
     * @return Generated JWT token
     */
    public String generateToken(String subject) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationSeconds * 1000L);

        
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate JWT token with subject and additional claims
     * @param subject The subject of the token
     * @param claims Additional claims to include in the token
     * @return Generated JWT token
     */
    public String generateTokenWithClaims(String subject, Map<String, Object> claims) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationSeconds * 1000L);

        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract subject (username/email) from token
     * @param token JWT token
     * @return Subject from token
     */
    public String getSubject(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extract all claims from token
     * @param token JWT token
     * @return Claims object
     */
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extract specific claim from token
     * @param token JWT token
     * @param claimName Name of the claim
     * @return Claim value
     */
    public Object getClaim(String token, String claimName) {
        return getClaims(token).get(claimName);
    }

    /**
     * Extract expiration date from token
     * @param token JWT token
     * @return Expiration date
     */
    public Date getExpirationDate(String token) {
        return getClaims(token).getExpiration();
    }

    /**
     * Check if token is expired
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = getExpirationDate(token);
            return expiration.before(new Date());
        } catch (JwtException ex) {
            logger.error("Error checking token expiration: {}", ex.getMessage());
            return true;
        }
    }

    /**
     * Validate JWT token
     * @param token JWT token to validate
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            logger.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("JWT token is expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("JWT token is unsupported: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Validate token and check if it belongs to the given subject
     * @param token JWT token
     * @param subject Expected subject (username/email)
     * @return true if valid and matches subject
     */
    public boolean validateTokenForSubject(String token, String subject) {
        try {
            String tokenSubject = getSubject(token);
            return validateToken(token) && tokenSubject.equals(subject);
        } catch (JwtException ex) {
            logger.error("Error validating token for subject: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Get remaining time in milliseconds until token expires
     * @param token JWT token
     * @return Remaining time in milliseconds, or 0 if expired
     */
    public long getRemainingTime(String token) {
        try {
            Date expiration = getExpirationDate(token);
            long remainingTime = expiration.getTime() - new Date().getTime();
            return Math.max(0, remainingTime);
        } catch (JwtException ex) {
            logger.error("Error getting remaining time: {}", ex.getMessage());
            return 0;
        }
    }
}
