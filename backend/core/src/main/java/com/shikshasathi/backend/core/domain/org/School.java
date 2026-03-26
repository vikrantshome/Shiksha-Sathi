package com.shikshasathi.backend.core.domain.org;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Getter
@Setter
@Document(collection = "schools")
public class School extends BaseEntity {

    @Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("name")
    private String name;

    @Field("address")
    private String address;

    @Field("contact_email")
    private String contactEmail;

    @Field("is_active")
    private boolean active = true;
}
