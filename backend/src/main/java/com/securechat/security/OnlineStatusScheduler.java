package com.securechat.security;

import com.securechat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class OnlineStatusScheduler {

    @Autowired
    private UserRepository userRepository;

    @Scheduled(fixedRate = 15000)
    public void checkOnlineStatus() {
        // Mark users offline if they haven't pinged in 20 seconds
        Date threshold = new Date(System.currentTimeMillis() - 20000);
        userRepository.markOfflineUsers(threshold);
    }
}
