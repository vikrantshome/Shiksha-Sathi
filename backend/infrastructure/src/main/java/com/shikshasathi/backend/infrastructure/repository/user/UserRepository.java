package com.shikshasathi.backend.infrastructure.repository.user;

import com.shikshasathi.backend.core.domain.user.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    /**
     * Find all users by phone number.
     * Returns a list because multiple students (e.g., siblings) may share the same parent phone.
     */
    List<User> findByPhone(String phone);

    /**
     * Find active teacher users by phone number.
     * Used for enforcing phone uniqueness during teacher signup.
     */
    List<User> findByPhoneAndRoleAndActive(String phone, com.shikshasathi.backend.core.domain.user.Role role, boolean active);

    /**
     * Find users whose school name contains the given query (case-insensitive).
     * Used as a base for the searchable school dropdown.
     */
    List<User> findBySchoolContainingIgnoreCase(String query);
}
