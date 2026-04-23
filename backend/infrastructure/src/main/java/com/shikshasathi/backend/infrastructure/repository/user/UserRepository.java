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
     * Find distinct school names from users that contain the given query (case-insensitive).
     * Returns up to `limit` results. Skips null/empty school names.
     */
    @Aggregation(pipeline = {
            "{ $match: { school: { $regex: ?0, $options: 'i' }, school: { $ne: null }, school: { $ne: '' } } }",
            "{ $group: { _id: '$school' } }",
            "{ $project: { school: '$_id', _id: 0 } }",
            "{ $sort: { school: 1 } }",
            "{ $limit: ?1 }",
            "{ $group: { _id: null, schools: { $push: '$school' } } }",
            "{ $project: { _id: 0, schools: 1 } }"
    })
    List<org.bson.Document> findDistinctSchoolNamesRaw(String query, int limit);

    default List<String> findDistinctSchoolNames(String query, int limit) {
        List<org.bson.Document> results = findDistinctSchoolNamesRaw(query, limit);
        if (results.isEmpty()) return List.of();
        return (List<String>) results.get(0).get("schools");
    }
}
