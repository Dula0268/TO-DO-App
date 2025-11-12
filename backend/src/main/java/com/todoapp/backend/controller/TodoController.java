package com.todoapp.backend.controller;

import com.todoapp.backend.dto.request.TodoRequestDTO;
import com.todoapp.backend.dto.response.ApiResponseDTO;
import com.todoapp.backend.dto.response.TodoResponseDTO;
import com.todoapp.backend.model.Todo;
import com.todoapp.backend.model.User;
import com.todoapp.backend.repository.TodoRepository;
import com.todoapp.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:3000")
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoController(TodoRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    // ---------------- GET ALL TODOS ----------------
    @GetMapping
    public ResponseEntity<ApiResponseDTO> getAllTodos(
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean completed,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Todo> todos = todoRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        if (priority != null && !priority.isEmpty()) {
            todos = todos.stream()
                    .filter(t -> priority.equals(t.getPriority()))
                    .collect(Collectors.toList());
        }

        if (category != null && !category.isEmpty()) {
            todos = todos.stream()
                    .filter(t -> category.equals(t.getCategory()))
                    .collect(Collectors.toList());
        }

        if (completed != null) {
            todos = todos.stream()
                    .filter(t -> completed == t.isCompleted())
                    .collect(Collectors.toList());
        }

        List<TodoResponseDTO> response = todos.stream()
                .map(TodoResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponseDTO(200, "Todos fetched successfully", response));
    }

    // ---------------- CREATE TODO ----------------
    @PostMapping
    public ResponseEntity<ApiResponseDTO> createTodo(@RequestBody TodoRequestDTO dto, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Todo todo = new Todo();
        todo.setTitle(dto.getTitle());
        todo.setDescription(dto.getDescription());
        todo.setPriority(dto.getPriority());
        todo.setCategory(dto.getCategory());
        todo.setCompleted(dto.isCompleted());
        todo.setUser(user);

        Todo saved = todoRepository.save(todo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDTO(201, "Todo created successfully", TodoResponseDTO.fromEntity(saved)));
    }

    // ---------------- UPDATE TODO ----------------
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> updateTodo(
            @PathVariable Long id,
            @RequestBody TodoRequestDTO dto,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only update your own todos");
        }

        if (dto.getTitle() != null) todo.setTitle(dto.getTitle());
        if (dto.getDescription() != null) todo.setDescription(dto.getDescription());
        if (dto.getPriority() != null) todo.setPriority(dto.getPriority());
        if (dto.getCategory() != null) todo.setCategory(dto.getCategory());
        todo.setCompleted(dto.isCompleted());

        Todo updated = todoRepository.save(todo);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Todo updated successfully", TodoResponseDTO.fromEntity(updated)));
    }

    // ---------------- DELETE TODO ----------------
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO> deleteTodo(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own todos");
        }

        todoRepository.delete(todo);
        return ResponseEntity.ok(new ApiResponseDTO(200, "Todo deleted successfully", null));
    }
}
