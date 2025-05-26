package com.example.platform.controller.user;

import com.example.platform.dto.auth.LoginRequest;
import com.example.platform.dto.OrganizerProfileResponse;
import com.example.platform.dto.auth.RegistrationRequest;
import com.example.platform.model.User;
import com.example.platform.service.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
public class UserController {


    private final UserService userService;


    public UserController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegistrationRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.verify(request));
    }

    @GetMapping("/api/organizers/{organizerId}")
    public ResponseEntity<OrganizerProfileResponse> getOrganizerProfile(@PathVariable Long organizerId) {
        return ResponseEntity.ok(userService.getOrganizerProfile(organizerId));
    }
    @GetMapping("/organizers/{username}")
    public ResponseEntity<OrganizerProfileResponse> getOrganizerProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getOrganizerProfile(username));
    }

}


