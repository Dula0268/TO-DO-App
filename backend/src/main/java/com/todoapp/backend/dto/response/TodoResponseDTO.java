package com.todoapp.backend.dto.response;

import com.todoapp.backend.model.Todo;

public class TodoResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String priority;
    private String category;
    private boolean completed;

    public static TodoResponseDTO fromEntity(Todo todo) {
        TodoResponseDTO dto = new TodoResponseDTO();
        dto.setId(todo.getId());
        dto.setTitle(todo.getTitle());
        dto.setDescription(todo.getDescription());
        dto.setPriority(todo.getPriority());
        dto.setCategory(todo.getCategory());
        dto.setCompleted(todo.isCompleted());
        return dto;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
