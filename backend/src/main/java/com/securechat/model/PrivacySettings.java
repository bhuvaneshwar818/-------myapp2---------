package com.securechat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "privacy_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrivacySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean blockIncomingRequests = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private boolean isProfilePublic = true;

    @Builder.Default
    @Column(columnDefinition = "boolean default false")
    private boolean hideOnlineStatus = false;

    @Builder.Default
    @Column(columnDefinition = "int default 0")
    private int defaultEvaporationTime = 0;
}
