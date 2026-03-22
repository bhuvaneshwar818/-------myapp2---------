package com.securechat.repository;

import com.securechat.model.Connection;
import com.securechat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    List<Connection> findByUserAndStatus(User user, Connection.ConnectionStatus status);

    @Query("SELECT c FROM Connection c WHERE (c.user = ?1 AND c.connectedUser = ?2) OR (c.user = ?2 AND c.connectedUser = ?1)")
    Optional<Connection> findBetweenUsers(User user1, User user2);

    List<Connection> findByConnectedUserAndStatus(User connectedUser, Connection.ConnectionStatus status);
}
