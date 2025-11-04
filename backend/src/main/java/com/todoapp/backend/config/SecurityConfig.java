package com.todoapp.backend.config;

import com.todoapp.backend.security.JwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security Configuration for JWT-based authentication.
 * 
 * <p>This configuration:</p>
 * <ul>
 *   <li>Disables CSRF (not needed for stateless JWT authentication)</li>
 *   <li>Enables CORS for frontend communication</li>
 *   <li>Configures stateless session management</li>
 *   <li>Sets up public and protected endpoints</li>
 *   <li>Integrates JWT authentication filter</li>
 * </ul>
 * 
 * <p><b>Public Endpoints:</b></p>
 * <ul>
 *   <li>/api/auth/** - Registration and login</li>
 *   <li>/error - Error handling</li>
 *   <li>/public/** - Public resources</li>
 * </ul>
 * 
 * <p><b>Protected Endpoints:</b></p>
 * <ul>
 *   <li>/api/todos/** - Requires valid JWT token</li>
 *   <li>All other /api/** endpoints - Requires authentication</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    /**
     * Password encoder bean using BCrypt hashing algorithm.
     * BCrypt automatically handles salt generation and is resistant to brute-force attacks.
     * 
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        logger.info("Initializing BCryptPasswordEncoder for password hashing");
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication manager bean for handling authentication requests.
     * Used by AuthController for login functionality.
     * 
     * @param configuration Spring's authentication configuration
     * @return AuthenticationManager instance
     * @throws Exception if authentication manager cannot be created
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        logger.info("Initializing AuthenticationManager");
        return configuration.getAuthenticationManager();
    }

    /**
     * Main security filter chain configuration.
     * Configures all security aspects including CSRF, CORS, session management, and authorization rules.
     * 
     * @param http HttpSecurity builder
     * @param jwtFilter Custom JWT authentication filter
     * @return Configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        logger.info("Configuring Security Filter Chain");
        
        http
            // Disable CSRF - not needed for stateless JWT authentication
            // CSRF protection is for session-based authentication
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable CORS with custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configure session management as STATELESS
            // No server-side sessions - all state in JWT token
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Allow CORS preflight requests (OPTIONS method)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Public endpoints - no authentication required
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/public/**").permitAll()
                
                // Health check endpoints (optional)
                .requestMatchers("/actuator/health").permitAll()
                
                // All other /api/** endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                
                // Allow everything else (static resources, etc.)
                .anyRequest().permitAll()
            )
            
            // Add JWT filter before Spring Security's authentication filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Disable HTTP Basic authentication (we're using JWT)
            .httpBasic(AbstractHttpConfigurer::disable)
            
            // Disable form login (we're using JWT)
            .formLogin(AbstractHttpConfigurer::disable);

        logger.info("Security Filter Chain configured successfully");
        return http.build();
    }

    /**
     * CORS configuration to allow requests from frontend.
     * Configure allowed origins, methods, and headers for cross-origin requests.
     * 
     * <p><b>Security Note:</b> In production, replace wildcard origins with specific domains.</p>
     * 
     * @return CorsConfigurationSource with allowed origins and methods
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        logger.info("Configuring CORS settings");
        
        CorsConfiguration config = new CorsConfiguration();
        
        // Allowed origins - frontend URLs
        // TODO: In production, use specific domains instead of localhost
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ));
        
        // Allowed HTTP methods
        config.setAllowedMethods(List.of(
            "GET", 
            "POST", 
            "PUT", 
            "PATCH", 
            "DELETE", 
            "OPTIONS"
        ));
        
        // Allowed headers
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With"
        ));
        
        // Expose headers to frontend
        config.setExposedHeaders(List.of(
            "Authorization",
            "X-Total-Count"
        ));
        
        // Allow credentials (cookies, authorization headers)
        // Set to true if you need to send cookies or credentials
        config.setAllowCredentials(false);
        
        // Cache preflight requests for 1 hour
        config.setMaxAge(3600L);
        
        // Register CORS configuration for all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        logger.info("CORS configured for origins: {}", config.getAllowedOrigins());
        return source;
    }
}
