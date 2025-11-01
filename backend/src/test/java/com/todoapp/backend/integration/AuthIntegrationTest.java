package com.todoapp.backend.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class AuthIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @SuppressWarnings({"rawtypes","unchecked"})
    public void registerLoginAndAccessProtectedEndpoint() {
        // Register
        Map<String,Object> regBody = Map.of(
                "name", "itest",
                "email", "itest@example.com",
                "password", "Password!23"
        );

    ResponseEntity<Map> regRes = restTemplate.postForEntity("/api/auth/register", regBody, Map.class);
        assertEquals(HttpStatus.CREATED, regRes.getStatusCode(), "register should return 201 Created");
        assertNotNull(regRes.getBody());
        Object tokenObj = regRes.getBody().get("accessToken");
        assertNotNull(tokenObj, "accessToken should be present on register");
        String token = tokenObj.toString();

        // Login
        Map<String,Object> loginBody = Map.of(
                "email", "itest@example.com",
                "password", "Password!23"
        );
    ResponseEntity<Map> loginRes = restTemplate.postForEntity("/api/auth/login", loginBody, Map.class);
        assertEquals(HttpStatus.OK, loginRes.getStatusCode());
        assertNotNull(loginRes.getBody().get("accessToken"));

        // Create a todo using the token
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String,Object> todoBody = Map.of(
                "title", "Integration Test Todo",
                "description", "Created by integration test",
                "completed", false
        );

        HttpEntity<Map<String,Object>> createEntity = new HttpEntity<>(todoBody, headers);
        ResponseEntity<Map> createRes = restTemplate.postForEntity("/api/todos", createEntity, Map.class);
        assertEquals(HttpStatus.OK, createRes.getStatusCode(), "Creating todo should return 200 OK");
        assertNotNull(createRes.getBody());
        Object createdId = createRes.getBody().get("id");
        assertNotNull(createdId, "Created todo should have an id");

        // List todos and verify the created item is present
        HttpEntity<Void> listEntity = new HttpEntity<>(headers);
        ResponseEntity<List> todosRes = restTemplate.exchange("/api/todos", HttpMethod.GET, listEntity, List.class);
        assertEquals(HttpStatus.OK, todosRes.getStatusCode());
        List<?> todos = todosRes.getBody();
        assertNotNull(todos);
        boolean found = todos.stream().filter(Objects::nonNull).anyMatch(o -> {
            try {
                Map m = (Map) o;
                return "Integration Test Todo".equals(m.get("title"));
            } catch (ClassCastException ex) {
                return false;
            }
        });
        assertTrue(found, "Created todo should appear in the list");
    }
}
