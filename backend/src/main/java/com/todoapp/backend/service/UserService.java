package com.todoapp.backend.service;

import com.todoapp.backend.model.User;
import com.todoapp.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * UserDetailsService implementation for loading user-specific data during authentication.
 * This service is used by Spring Security to authenticate and authorize users.
 * 
 * <p>Responsibilities:</p>
 * <ul>
 *   <li>Load user details from database for authentication</li>
 *   <li>Provide user registration functionality</li>
 *   <li>Manage user queries and retrieval</li>
 *   <li>Encode passwords securely</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user in the system.
     * 
     * @param name User's full name
     * @param email User's email address (must be unique)
     * @param rawPassword User's plain text password (will be encoded)
     * @return The created user entity
     * @throws IllegalArgumentException if email already exists
     */
    @Transactional
    public User register(String name, String email, String rawPassword) {
        logger.info("Attempting to register new user with email: {}", email);
        
        if (userRepository.existsByEmail(email)) {
            logger.warn("Registration failed: User with email {} already exists", email);
            throw new IllegalArgumentException("User with email already exists");
        }
        
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        
        User savedUser = userRepository.save(user);
        logger.info("Successfully registered user with email: {}", email);
        
        return savedUser;
    }

    /**
     * Find a user by email address.
     * 
     * @param email User's email address
     * @return Optional containing the user if found, empty otherwise
     */
    public Optional<User> findByEmail(String email) {
        logger.debug("Looking up user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    /**
     * Find a user by user ID.
     * 
     * @param userId User's ID
     * @return Optional containing the user if found, empty otherwise
     */
    public Optional<User> findById(Long userId) {
        logger.debug("Looking up user by ID: {}", userId);
        return userRepository.findById(userId);
    }

    /**
     * Check if a user exists by email.
     * 
     * @param email User's email address
     * @return true if user exists, false otherwise
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Update user password.
     * 
     * @param userId User's ID
     * @param newPassword New plain text password
     * @return Updated user entity
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional
    public User updatePassword(Long userId, String newPassword) {
        logger.info("Updating password for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        User updatedUser = userRepository.save(user);
        
        logger.info("Password updated successfully for user ID: {}", userId);
        return updatedUser;
    }

    /**
     * Update user profile information.
     * 
     * @param userId User's ID
     * @param name New name
     * @return Updated user entity
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional
    public User updateProfile(Long userId, String name) {
        logger.info("Updating profile for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));
        
        user.setName(name);
        User updatedUser = userRepository.save(user);
        
        logger.info("Profile updated successfully for user ID: {}", userId);
        return updatedUser;
    }

    /**
     * Load user-specific data for Spring Security authentication.
     * This method is called by Spring Security during the authentication process.
     * 
     * @param username The username identifying the user (email in our case)
     * @return A fully populated UserDetails object
     * @throws UsernameNotFoundException if the user could not be found
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Loading user by username (email): {}", username);
        
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        // Grant authorities (roles) to the user
        Collection<GrantedAuthority> authorities = getAuthorities(user);

        logger.debug("User '{}' loaded successfully with {} authorities", 
                   username, authorities.size());

        // Return Spring Security UserDetails
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                true, // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities
        );
    }

    /**
     * Get authorities (roles) for a user.
     * Override this method to implement role-based access control.
     * 
     * @param user The user entity
     * @return Collection of granted authorities
     */
    private Collection<GrantedAuthority> getAuthorities(User user) {
        // Default role for all users
        // In the future, you can extend this to fetch roles from database
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    /**
     * Validate password for a user.
     * Useful for password change operations where you need to verify the old password.
     * 
     * @param email User's email
     * @param rawPassword Plain text password to validate
     * @return true if password matches, false otherwise
     */
    public boolean validatePassword(String email, String rawPassword) {
        logger.debug("Validating password for user: {}", email);
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean matches = passwordEncoder.matches(rawPassword, user.getPassword());
            logger.debug("Password validation result for {}: {}", email, matches);
            return matches;
        }
        
        logger.warn("Password validation failed: User not found with email {}", email);
        return false;
    }
}
