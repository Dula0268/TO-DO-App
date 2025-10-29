DATABASE SETUP GUIDE

SECURITY FIRST

For security best practices and guidance, please refer to SECURITY_GUIDE.md.
Prerequisites
- PostgreSQL installed on your machine
- PostgreSQL running (default port: 5432)
- Access to psql command line

Quick Setup

IMPORTANT: Before running, edit schema.sql and replace 'your_secure_password_here' with your actual password from .env

Run the complete setup:
psql -U postgres -f "db/schema.sql"

Verify it worked:
psql -U todo_user -d todo_db
\dt
\q

Database Credentials

Use these placeholders and replace with actual values from .env:

Item     Value                    Notes
Database todo_db                  Fixed name
User     todo_user                Fixed name  
Password ${DB_PASSWORD}           From your .env file
Port     5432                     Default PostgreSQL port


Verify Setup

Connect as todo_user:
psql -U todo_user -d todo_db

Inside psql, run:
\dt              List all tables
\d users         Describe users table
\d todos         Describe todos table
SELECT * FROM users;
SELECT * FROM todos;
\q

Test Data

INSERT INTO users (username, email, password)
VALUES ('dula', 'dula@example.com', 'hashedpassword');

INSERT INTO todos (title, description, user_id)
VALUES ('Setup database', 'Complete PostgreSQL setup', 1);

SELECT * FROM todos;

Spring Boot Configuration

Use these settings in application.properties (replace placeholders with .env values):

spring.datasource.url=jdbc:postgresql://localhost:5432/todo_db
spring.datasource.username=todo_user
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate

Better practice for production:
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

Quick Command Reference

psql -U postgres               Admin access
psql -U todo_user -d todo_db  App user access
psql -U postgres -f file.sql  Run SQL file
\l                            List databases
\c database_name              Connect to DB
\dt                           List tables
\d table_name                 Describe table
\q                            Exit