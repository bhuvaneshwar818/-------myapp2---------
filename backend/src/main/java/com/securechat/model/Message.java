package com.securechat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String type; // NORMAL, SECRET, EVAPORATING
    private LocalDateTime timestamp;
    private boolean isRead;
    
    // For evaporating messages
    private LocalDateTime evaporateAt;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
