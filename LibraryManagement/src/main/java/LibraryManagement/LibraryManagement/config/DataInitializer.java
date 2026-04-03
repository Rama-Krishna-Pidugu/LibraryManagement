package LibraryManagement.LibraryManagement.config;

import LibraryManagement.LibraryManagement.entity.Role;
import LibraryManagement.LibraryManagement.entity.User;
import LibraryManagement.LibraryManagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@library.com").isEmpty()) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail("admin@library.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }

            if (userRepository.findByEmail("student@library.com").isEmpty()) {
                User student = new User();
                student.setName("Student");
                student.setEmail("student@library.com");
                student.setPassword(passwordEncoder.encode("student123"));
                student.setRole(Role.STUDENT);
                userRepository.save(student);
            }
        };
    }
}
