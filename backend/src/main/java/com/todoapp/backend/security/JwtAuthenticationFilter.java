package com.todoapp.backend.security;

import com.todoapp.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter that intercepts HTTP requests and validates JWT tokens.
 * This filter runs once per request to authenticate users based on the JWT token
 * present in the Authorization header.
 * 
 * <p>Expected Authorization header format: "Bearer {token}"</p>
 * 
 * <p>The filter performs the following steps:</p>
 * <ul>
 *   <li>Extracts JWT token from Authorization header</li>
 *   <li>Validates token signature and expiration</li>
 *   <li>Loads user details from database</li>
 *   <li>Sets authentication in SecurityContext</li>
 * </ul>
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final int BEARER_PREFIX_LENGTH = 7;

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String header = request.getHeader(AUTHORIZATION_HEADER);

            // Check for "Bearer <token>"
            if (header != null && header.startsWith(BEARER_PREFIX)) {
                String token = header.substring(BEARER_PREFIX_LENGTH);

                // Validate the token signature and expiration
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getSubject(token);

                    // Only authenticate if no user is currently set in the context
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userService.loadUserByUsername(username);

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, 
                                        null, 
                                        userDetails.getAuthorities()
                                );
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Set authenticated user in the SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
        } catch (Exception ex) {
            // Log and continue the chain (don't block entire request)
            logger.error("JWT authentication failed: {}", ex.getMessage());
        }

        // Always continue the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Determine if this filter should be applied to the given request.
     * Override this method to exclude certain paths from JWT authentication.
     * 
     * @param request HTTP request
     * @return true if filter should NOT be applied
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip JWT filter for public endpoints
        return path.startsWith("/api/auth/") || 
               path.equals("/error") ||
               path.startsWith("/public/");
    }
}
