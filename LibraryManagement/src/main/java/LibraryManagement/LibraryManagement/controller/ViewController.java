package LibraryManagement.LibraryManagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({"/", "/index"})
    public String index() {
        return "index";
    }

    @GetMapping("/ui/login")
    public String login() {
        return "login";
    }

    @GetMapping("/ui/admin")
    public String admin() {
        return "admin";
    }

    @GetMapping("/ui/student")
    public String student() {
        return "student";
    }
}
