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
    Optional<User> findByPhone(String phone);

    /**
     * Find distinct school names from users that contain the given query (case-insensitive).
     * Returns up to `limit` results. Skips null/empty school names.
     */
    @Aggregation(pipeline = {
            "{ $match: { school: { $regex: ?0, $options: 'i' }, school: { $ne: null }, school: { $ne: '' } } }",
            "{ $group: { _id: { $toLower: '$school' }, school: { $first: '$school' } } }",
            "{ $match: { school: { $ne: null }, school: { $ne: '' } } }",
            "{ $project: { _id: 0, school: 1 } }",
            "{ $sort: { school: 1 } }",
            "{ $limit: ?1 }"
    })
    List<String> findDistinctSchoolNames(String query, int limit);
}
