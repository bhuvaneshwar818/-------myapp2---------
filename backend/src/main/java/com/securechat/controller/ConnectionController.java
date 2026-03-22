package com.securechat.controller;

import com.securechat.model.Connection;
import com.securechat.model.User;
import com.securechat.payload.response.MessageResponse;
import com.securechat.repository.ConnectionRepository;
import com.securechat.repository.UserRepository;
import com.securechat.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    @Autowired
    ConnectionRepository connectionRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ConnectionService connectionService;


    @PostMapping("/request/{id}")
    public ResponseEntity<?> sendRequest(@PathVariable Long id) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User currentUser = userRepository.findByUsername(username).get();
        User targetUser = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("You cannot connect with yourself"));
        }

        Optional<Connection> existing = connectionRepository.findBetweenUsers(currentUser, targetUser);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Connection already exists or is pending"));
        }

        Connection connection = Connection.builder()
                .user(currentUser)
                .connectedUser(targetUser)
                .status(Connection.ConnectionStatus.PENDING)
                .build();

        connectionRepository.save(connection);
        return ResponseEntity.ok(new MessageResponse("Request sent successfully"));
    }

    @PostMapping("/accept/{id}")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id) {
        connectionService.acceptConnection(id);
        return ResponseEntity.ok(new MessageResponse("Request accepted"));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User currentUser = userRepository.findByUsername(username).get();
        return ResponseEntity.ok(connectionRepository.findByConnectedUserAndStatus(currentUser, Connection.ConnectionStatus.PENDING));
    }
}
