package com.todoapp.backend.dto.response;

public class VerifyResponseDTO {
    private String subject;
    private String name;

    public VerifyResponseDTO(String subject, String name) {
        this.subject = subject;
        this.name = name;
    }

    public String getSubject() {
        return subject;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}
