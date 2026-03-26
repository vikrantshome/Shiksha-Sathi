package com.shikshasathi.backend.core.domain.teacher;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "profiles")
public class Profile extends BaseEntity {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("name")
    private String name;

    @Field("school")
    private String school;

    @Field("board")
    private String board;
}
