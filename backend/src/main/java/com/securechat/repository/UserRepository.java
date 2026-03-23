package com.securechat.repository;

import com.securechat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    
    List<User> findByUsernameContaining(String username);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.isOnline = false WHERE u.lastActive < :threshold OR u.lastActive IS NULL")
    void markOfflineUsers(@org.springframework.data.repository.query.Param("threshold") java.util.Date threshold);
}
