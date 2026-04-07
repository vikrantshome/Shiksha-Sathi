package com.shikshasathi.backend.core.domain.user;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "users")
public class User extends BaseEntity {

    @Id
    private String id;

    @Field("name")
    private String name;

    @Field("email")
    private String email;

    @Field("phone")
    private String phone;

    @Field("password_hash")
    private String passwordHash;

    @Field("role")
    private Role role;

    @Field("school_id")
    private String schoolId;

    @Field("school")
    private String school; // School/Institute name

    @Field("roll_number")
    private String rollNumber;

    @Field("is_active")
    private boolean active = true;

    @Field("last_login_at")
    private Long lastLoginAt;
}
