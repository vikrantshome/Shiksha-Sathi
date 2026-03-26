package com.shikshasathi.backend.api.events;

import org.springframework.context.ApplicationEvent;

public class NotificationEvent extends ApplicationEvent {

    private final String userId;
    private final String message;

    public NotificationEvent(Object source, String userId, String message) {
        super(source);
        this.userId = userId;
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public String getMessage() {
        return message;
    }
}
