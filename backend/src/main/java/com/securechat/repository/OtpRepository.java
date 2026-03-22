package com.securechat.repository;

import com.securechat.model.OtpLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpLog, Long> {
    Optional<OtpLog> findByEmailAndOtpAndIsUsedFalse(String email, String otp);
}
