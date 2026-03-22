package com.securechat.exception;

import com.securechat.payload.response.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex) {
        ex.printStackTrace(); // Print full stack trace to backend console
        return ResponseEntity.status(500).body(new MessageResponse("Server Crash: " + ex.toString()));
    }
}
