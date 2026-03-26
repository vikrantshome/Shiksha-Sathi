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

    @Field("date")
    private LocalDate date;

    @Field("status") // PRESENT, ABSENT, LATE, EXCUSED
    private String status;
}
