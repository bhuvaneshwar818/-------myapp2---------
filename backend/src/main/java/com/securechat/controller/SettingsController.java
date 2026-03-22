package com.securechat.controller;

import com.securechat.model.PrivacySettings;
import com.securechat.model.User;
import com.securechat.repository.PrivacySettingsRepository;
import com.securechat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PrivacySettingsRepository privacyRepository;

    @GetMapping("/privacy")
    public ResponseEntity<?> getPrivacySettings() {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByUsername(username).orElseThrow();
        return ResponseEntity.ok(user.getPrivacySettings());
    }

    @PutMapping("/privacy")
    public ResponseEntity<?> updatePrivacySettings(@RequestBody PrivacySettings newSettings) {
        String username = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        User user = userRepository.findByUsername(username).orElseThrow();
        
        PrivacySettings settings = user.getPrivacySettings();
        if (settings == null) {
            settings = PrivacySettings.builder().user(user).build();
        }
        
        settings.setBlockIncomingRequests(newSettings.isBlockIncomingRequests());
        settings.setProfilePublic(newSettings.isProfilePublic());
        settings.setHideOnlineStatus(newSettings.isHideOnlineStatus());
        settings.setDefaultEvaporationTime(newSettings.getDefaultEvaporationTime());
        
        privacyRepository.save(settings);
        return ResponseEntity.ok(settings);
    }
}
