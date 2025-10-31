package com.todoapp.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        var context = SpringApplication.run(BackendApplication.class, args);
        String port = context.getEnvironment().getProperty("server.port", "8080");
        System.out.println("🚀 ToDo App Backend is running on port " + port + "!");
    }

}
