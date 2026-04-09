package com.shikshasathi.backend.core.domain.school;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;

@Getter
@Setter
@Document(collection = "attendances")
public class AttendanceRecord extends BaseEntity {

    @Id
    private String id;

    @Field("class_id")
    private String classId;

    @Field("student_id")
    private String studentId;

    /**
     * Date stored as ISO string "YYYY-MM-DD" in IST timezone.
     * Use getLocalDate() / setDate(LocalDate) for type-safe access.
     */
    @Field("date")
    private String date;

    @Field("status") // PRESENT, ABSENT, LATE, EXCUSED
    private String status;

    /**
     * Get date as LocalDate for type-safe operations.
     */
    public LocalDate getLocalDate() {
        return date != null ? LocalDate.parse(date) : null;
    }

    /**
     * Set date from LocalDate, stored as ISO string.
     */
    public void setDate(LocalDate localDate) {
        this.date = localDate != null ? localDate.toString() : null;
    }
}
