package com.securechat.repository;

import com.securechat.model.Message;
import com.securechat.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender = ?1 AND m.recipient = ?2) OR (m.sender = ?2 AND m.recipient = ?1) ORDER BY m.timestamp DESC")
    List<Message> findChatHistory(User user1, User user2, Pageable pageable);

    List<Message> findByRecipientAndIsReadFalse(User recipient);
}
