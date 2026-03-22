package com.securechat.repository;

import com.securechat.model.PrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivacySettingsRepository extends JpaRepository<PrivacySettings, Long> {
}
