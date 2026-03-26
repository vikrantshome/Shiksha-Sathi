package com.shikshasathi.backend.api.events;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationEventListener {

    @Async
    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Sending notification to User {}: {}", event.getUserId(), event.getMessage());
        // Integration with push notifications or email would go here
    }
}
