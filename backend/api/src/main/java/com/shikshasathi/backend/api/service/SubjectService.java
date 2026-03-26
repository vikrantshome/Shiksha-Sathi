package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Subject;
import com.shikshasathi.backend.infrastructure.repository.learning.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> getSubjectsBySchool(String schoolId) {
        return subjectRepository.findBySchoolId(schoolId);
    }

    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }
}
