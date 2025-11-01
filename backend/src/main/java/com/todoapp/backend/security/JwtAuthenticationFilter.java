package com.todoapp.backend.security;

import com.todoapp.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Filter that runs once per request to authenticate a user based on the JWT.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String header = request.getHeader("Authorization");

            // Check for "Bearer <token>"
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);

                // Validate the token signature and expiration
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getSubject(token);

                    // Only authenticate if no user is currently set in the context
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userService.loadUserByUsername(username);

                        // Use user’s authorities; if none, assign ROLE_USER by default
                        List<GrantedAuthority> authorities = new ArrayList<>(userDetails.getAuthorities());
                        if (authorities.isEmpty()) {
                            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                        }

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Set authenticated user in the SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
        } catch (Exception ex) {
            // Log and continue the chain (don't block entire request)
            System.err.println("JWT authentication failed: " + ex.getMessage());
        }

        // Always continue the filter chain
        filterChain.doFilter(request, response);
    }
}
