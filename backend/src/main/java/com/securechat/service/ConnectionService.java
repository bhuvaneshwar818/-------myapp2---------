package com.securechat.service;

import com.securechat.model.Connection;
import com.securechat.model.User;
import com.securechat.repository.ConnectionRepository;
import com.securechat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConnectionService {

    @Autowired
    ConnectionRepository connectionRepository;

    @Autowired
    UserRepository userRepository;

    @Transactional
    public void acceptConnection(Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (connection.getStatus() == Connection.ConnectionStatus.PENDING) {
            connection.setStatus(Connection.ConnectionStatus.ACCEPTED);
            
            // Increment trust scores
            User user1 = connection.getUser();
            User user2 = connection.getConnectedUser();

            updateTrust(user1, 2); // +2% for getting a request accepted
            updateTrust(user2, 1); // +1% for accepting

            connectionRepository.save(connection);
            userRepository.save(user1);
            userRepository.save(user2);
        }
    }

    private void updateTrust(User user, int increment) {
        int newTrust = user.getTrustPercent() + increment;
        if (newTrust > 100) newTrust = 100;
        user.setTrustPercent(newTrust);
        user.setUntrustPercent(100 - newTrust);
    }

    @Transactional
    public void breakTrust(User user) {
        user.setTrustBreakCount(user.getTrustBreakCount() + 1);
        int newTrust = user.getTrustPercent() - 10;
        if (newTrust < 0) newTrust = 0;
        user.setTrustPercent(newTrust);
        user.setUntrustPercent(100 - newTrust);
        userRepository.save(user);
    }
}
