package com.shikshasathi.backend.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;

/**
 * MongoDB configuration for IST timezone handling.
 * Stores LocalDate as ISO string "YYYY-MM-DD" to avoid UTC conversion issues.
 */
@Configuration
public class MongoConfig {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Custom conversions for LocalDate ↔ String to preserve IST dates in MongoDB.
     */
    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new LocalDateToStringConverter(),
                new StringToLocalDateConverter(),
                new DateToLocalDateConverter()
        ));
    }

    /**
     * Convert LocalDate to ISO string "YYYY-MM-DD" for MongoDB storage.
     */
    static class LocalDateToStringConverter implements Converter<LocalDate, String> {
        @Override
        public String convert(LocalDate source) {
            return source.format(DATE_FORMAT);
        }
    }

    /**
     * Convert ISO string "YYYY-MM-DD" back to LocalDate.
     */
    static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(String source) {
            return LocalDate.parse(source, DATE_FORMAT);
        }
    }

    /**
     * Convert MongoDB Date (java.util.Date) to LocalDate in IST timezone.
     * This handles legacy data stored as timestamps.
     */
    static class DateToLocalDateConverter implements Converter<Date, LocalDate> {
        @Override
        public LocalDate convert(Date source) {
            return source.toInstant().atZone(IST).toLocalDate();
        }
    }
}
