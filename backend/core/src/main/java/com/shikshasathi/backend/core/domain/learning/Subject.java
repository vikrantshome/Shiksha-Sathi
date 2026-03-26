package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "subjects")
public class Subject extends BaseEntity {

    @Id
    private String id;

    @Field("school_id")
    private String schoolId;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("is_active")
    private boolean active = true;
}
