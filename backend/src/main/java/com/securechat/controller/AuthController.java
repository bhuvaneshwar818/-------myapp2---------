package com.securechat.controller;

import com.securechat.model.OtpLog;
import com.securechat.model.User;

import com.securechat.payload.request.LoginRequest;
import com.securechat.payload.request.SignupRequest;
import com.securechat.payload.response.JwtResponse;
import com.securechat.payload.response.MessageResponse;
import com.securechat.repository.OtpRepository;
import com.securechat.repository.UserRepository;
import com.securechat.security.JwtUtils;
import com.securechat.security.UserDetailsImpl;
import com.securechat.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    OtpRepository otpRepository;

    @Autowired
    EmailService emailService;


    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .phone(signUpRequest.getPhone())
                .gender(signUpRequest.getGender())
                .dob(signUpRequest.getDob())
                .trustPercent(100)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/send-signup-otp")
    public ResponseEntity<?> sendSignupOtp(@RequestParam("email") String email) {
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpLog otpLog = OtpLog.builder()
                .email(email)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .build();
        otpRepository.save(otpLog);
        
        emailService.sendEmail(email, "SecureChat Verification Code", "Your verification OTP is: " + otp);
        return ResponseEntity.ok(new MessageResponse("OTP sent successfully to " + email));
    }

    @PostMapping("/forgot-username")
    public ResponseEntity<?> forgotUsername(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String phone = request.get("phone");
        String dobStr = request.get("dob"); // Expected format: yyyy-MM-dd
        
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPhone().equals(phone)) {
            try {
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
                String userDobStr = sdf.format(user.get().getDob());
                if (dobStr.equals(userDobStr)) {
                    emailService.sendEmail(user.get().getEmail(), "Your SecureChat Username", 
                        "Hi " + user.get().getFirstName() + ", your username is: " + user.get().getUsername());
                    return ResponseEntity.ok(new MessageResponse("Username sent to registered email."));
                }
            } catch (Exception e) {}
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: User details do not match any existing account."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent() && user.get().getEmail().equals(email)) {
            String otp = String.format("%06d", new java.util.Random().nextInt(999999));
            com.securechat.model.OtpLog otpLog = com.securechat.model.OtpLog.builder()
                    .email(user.get().getEmail())
                    .otp(otp)
                    .expiryTime(java.time.LocalDateTime.now().plusMinutes(10))
                    .build();
            otpRepository.save(otpLog);
            emailService.sendEmail(user.get().getEmail(), "SecureChat Reset OTP", "Your OTP is: " + otp);
            return ResponseEntity.ok(new MessageResponse("OTP sent to registered email."));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Username and matching email do not exist."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam("email") String email, @RequestParam("otp") String otp) {
        System.out.println("ATTEMPTING OTP VERIFY -> Email: '" + email + "' OTP: '" + otp + "'");
        Optional<com.securechat.model.OtpLog> otpLog = otpRepository.findByEmailAndOtpAndIsUsedFalse(email, otp);
        if (otpLog.isPresent()) {
            boolean isAfter = otpLog.get().getExpiryTime().isAfter(java.time.LocalDateTime.now());
            System.out.println("OTP MATCH FOUND! Valid Time Remaining? " + isAfter + " | DB_TIME: " + otpLog.get().getExpiryTime() + " | SYSTEM_TIME: " + java.time.LocalDateTime.now());
            if (isAfter) {
                otpLog.get().setUsed(true);
                otpRepository.save(otpLog.get());
                System.out.println("SUCCESSFULLY VERIFIED AND MARKED USED.");
                return ResponseEntity.ok(new MessageResponse("OTP verified successfully."));
            }
        } else {
            System.out.println("FAILED TO FIND OTP! Either email doesn't match perfectly, OTP is wrong, or isUsed is already true!");
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired OTP."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            user.get().setPassword(encoder.encode(newPassword));
            userRepository.save(user.get());
            return ResponseEntity.ok(new MessageResponse("Password reset successfully."));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ")
        );
        return ResponseEntity.badRequest().body(new MessageResponse("Validation Error: " + errors.toString()));
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new MessageResponse("JSON Parsing Error: " + ex.getMessage()));
    }
}
