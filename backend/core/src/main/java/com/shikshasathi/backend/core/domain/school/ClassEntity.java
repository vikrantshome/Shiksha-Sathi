package com.shikshasathi.backend.core.domain.school;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Getter
@Setter
@Document(collection = "classes")
public class ClassEntity extends BaseEntity {

    @Id
    private String id;

    @Field("school_id")
    private String schoolId;

    @Field("name")
    private String name;

    @Field("section")
    private String section;

    @Field("grade")
    private String grade; // Grade/Class level (e.g., "10", "11")

    @Field("teacher_ids")
    private List<String> teacherIds;

    @Field("student_ids")
    private List<String> studentIds;

    @Field("is_active")
    private boolean active = true;
}
