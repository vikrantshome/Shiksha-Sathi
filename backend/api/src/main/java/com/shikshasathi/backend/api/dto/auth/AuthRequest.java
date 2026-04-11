package com.shikshasathi.backend.api.dto.auth;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String phone;
    private String password;

    /**
     * When multiple users share the same phone (e.g., sibling students),
     * this field specifies which user to authenticate.
     * Only used when the initial login returned a candidates list.
     */
    private String selectUserId;
}
