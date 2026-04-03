# Library Management System (Spring Boot)

A simple role-based Library Management System built with Spring Boot and Spring Security.  
It provides separate experiences for **admin** and **student** users to manage books and transactions through a web UI.

### Features

- **Authentication & Authorization**
  - Email/password login using Spring Security.
  - Role-based access control with `ADMIN` and `STUDENT` roles.
  - Public endpoints for login and static assets; protected admin/student dashboards.

- **User Management**
  - Default admin and student users are automatically seeded on startup.
  - Users stored in a relational database via Spring Data JPA.

- **Book & Transaction Management**
  - Admin endpoints to manage books.
  - Student endpoints to view/borrow/return books.
  - Basic transaction tracking between students and books.

- **UI**
  - Thymeleaf templates under `src/main/resources/templates`:
    - `index.html`, `login.html`, `admin.html`, `student.html`
  - Static assets (CSS/JS) under `src/main/resources/static/assets`.

---

### Tech Stack

- **Backend**: Spring Boot, Spring Web, Spring Data JPA, Spring Security  
- **View Layer**: Thymeleaf templates  
- **Database**: Any JDBC-compatible DB (e.g., H2/MySQL/PostgreSQL), configured via `application.properties`  
- **Build Tool**: Maven  
- **Java Version**: 17+ (project currently run with Java 21 in IDE)

---

### Getting Started

#### Prerequisites

- **Java** 17 or later installed (JDK)
- **Maven** 3.9+ installed (or use the included `mvnw` / `mvnw.cmd`)
- A database configured in `src/main/resources/application.properties`  
  (for development you can use in-memory H2, if configured there).

#### Clone and Build

```bash
git clone <your-repo-url>.git
cd LibraryManagement
mvn clean install
```

#### Run the Application

Using Maven:

```bash
mvn spring-boot:run
```

Or using the generated jar:

```bash
java -jar target/LibraryManagement-0.0.1-SNAPSHOT.jar
```

By default, the application will start on `http://localhost:8080` (unless overridden in `application.properties`).

---

### Default Users

On startup, a `CommandLineRunner` seeds two users (see `DataInitializer`):

- **Admin**
  - Email: `admin@library.com`
  - Password: `admin123`
  - Role: `ADMIN`

- **Student**
  - Email: `student@library.com`
  - Password: `student123`
  - Role: `STUDENT`

Update or remove these defaults by editing `DataInitializer` and re-building the application.

---

### Security & Endpoints

The main security configuration is in `SecurityConfig`:

- **Public endpoints**
  - `/`, `/index`
  - `/ui/login`
  - `/auth/login`
  - `/assets/**`

- **Admin-only**
  - `/ui/admin`
  - `/api/admin/**`

- **Student-only**
  - `/ui/student`
  - `/api/student/**`

All other endpoints require authentication.

---

### Project Structure (Key Packages)

- `LibraryManagementApplication` – Spring Boot entry point.
- `config` – Security and data initialization (`SecurityConfig`, `DataInitializer`).
- `controller` – Web controllers for admin, student, auth, and view navigation.
- `service` – Business logic for users, books, and transactions.
- `repository` – Spring Data JPA repositories.
- `entity` – JPA entities (`User`, `Book`, `Transaction`, `Role`).
- `dto` – DTO classes such as `LoginRequest`.
- `exception` – Global exception handling and custom exceptions.

---

### Running Tests

```bash
mvn test
```

---

### Customization

- **Database config**: edit `src/main/resources/application.properties`.
- **Seed users**: change or extend seeding logic in `DataInitializer`.
- **Security rules**: adjust access rules in `SecurityConfig`.
- **UI**: update templates in `src/main/resources/templates` and assets in `src/main/resources/static/assets`.

---

### License

Add your preferred license here (e.g., MIT, Apache 2.0) or keep it private for internal use.

