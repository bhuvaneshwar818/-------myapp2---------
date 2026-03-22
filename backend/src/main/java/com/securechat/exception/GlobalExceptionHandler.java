package com.securechat.exception;

import com.securechat.payload.response.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        return ResponseEntity.status(401).body(new MessageResponse("Invalid credentials"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex) {
        ex.printStackTrace(); // Print full stack trace to backend console
        return ResponseEntity.status(500).body(new MessageResponse("Server Crash: " + ex.toString()));
    }
}
