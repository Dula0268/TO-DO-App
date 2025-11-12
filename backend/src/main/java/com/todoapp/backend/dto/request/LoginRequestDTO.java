package com.todoapp.backend.dto.request;

public class LoginRequestDTO {
    private String email;
    private String password;

    // Getters & setters
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
