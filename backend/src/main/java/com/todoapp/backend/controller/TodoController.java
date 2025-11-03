package com.todoapp.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.todoapp.backend.model.Todo;
import com.todoapp.backend.model.User;
import com.todoapp.backend.repository.TodoRepository;
import com.todoapp.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:3000") // allow frontend requests
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoController(TodoRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Todo> getAllTodos(
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean completed,
            Authentication authentication
    ) {
        // Get the authenticated user's email
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get only todos for the current user
        List<Todo> todos = todoRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .toList();
        
        // Filter by priority if specified
        if (priority != null && !priority.isEmpty()) {
            todos = todos.stream()
                    .filter(t -> priority.equals(t.getPriority()))
                    .toList();
        }
        
        // Filter by category if specified
        if (category != null && !category.isEmpty()) {
            todos = todos.stream()
                    .filter(t -> category.equals(t.getCategory()))
                    .toList();
        }
        
        // Filter by completed status if specified
        if (completed != null) {
            todos = todos.stream()
                    .filter(t -> completed == t.isCompleted())
                    .toList();
        }
        
        return todos;
    }

    @PostMapping
    public Todo createTodo(@RequestBody Todo todo, Authentication authentication) {
        // Get the authenticated user's email from JWT
        String userEmail = authentication.getName();
        
        // Find the user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Set the user on the todo
        todo.setUser(user);
        
        return todoRepository.save(todo);
    }

    @PutMapping("/{id}")
    public Todo updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails, Authentication authentication) {
        // Get the authenticated user
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Todo todo = todoRepository.findById(id).orElseThrow();
        
        // Verify the todo belongs to the current user
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only update your own todos");
        }
        
        todo.setTitle(todoDetails.getTitle());
        todo.setDescription(todoDetails.getDescription());
        todo.setCompleted(todoDetails.isCompleted());
        if (todoDetails.getPriority() != null) {
            todo.setPriority(todoDetails.getPriority());
        }
        if (todoDetails.getCategory() != null) {
            todo.setCategory(todoDetails.getCategory());
        }
        return todoRepository.save(todo);
    }

    @DeleteMapping("/{id}")
    public void deleteTodo(@PathVariable Long id, Authentication authentication) {
        // Get the authenticated user
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Todo todo = todoRepository.findById(id).orElseThrow();
        
        // Verify the todo belongs to the current user
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own todos");
        }
        
        todoRepository.deleteById(id);
    }
}
