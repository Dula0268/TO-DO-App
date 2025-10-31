package com.todoapp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.todoapp.backend.model.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long> {
}
