package com.securechat.service;

import com.securechat.model.Message;
import com.securechat.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message save(Message message) {
        if ("EVAPORATING".equals(message.getType())) {
            message.setEvaporateAt(LocalDateTime.now().plusSeconds(30)); // Default 30s
        }
        return messageRepository.save(message);
    }

    @Scheduled(fixedRate = 5000)
    public void deleteEvaporatedMessages() {
        // Find messages where evaporateAt is in the past
        // (Simplified implementation)
        messageRepository.findAll().forEach(m -> {
            if (m.getEvaporateAt() != null && m.getEvaporateAt().isBefore(LocalDateTime.now())) {
                messageRepository.delete(m);
            }
        });
    }
}
