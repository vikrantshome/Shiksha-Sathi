package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.school.AttendanceRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClassServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClassService classService;

    private User teacherOwner;
    private User anotherTeacher;
    private ClassEntity mockedClass;

    @BeforeEach
    void setUp() {
        teacherOwner = new User();
        teacherOwner.setId("teacherOwnedId");
        teacherOwner.setEmail("teacher@owner.com");

        anotherTeacher = new User();
        anotherTeacher.setId("maliciousTeacher");
        anotherTeacher.setEmail("hacker@fake.com");

        mockedClass = new ClassEntity();
        mockedClass.setId("class123");
        mockedClass.setTeacherIds(List.of("teacherOwnedId"));
    }

    @Test
    void getClassById_Authorized_ReturnsClass() {
        when(userRepository.findByEmail("teacher@owner.com")).thenReturn(Optional.of(teacherOwner));
        when(classRepository.findById("class123")).thenReturn(Optional.of(mockedClass));

        ClassEntity result = classService.getClassById("class123", "teacher@owner.com");

        assertNotNull(result);
        assertEquals("class123", result.getId());
    }

    @Test
    void getClassById_Unauthorized_ThrowsAccessDenied() {
        when(userRepository.findByEmail("hacker@fake.com")).thenReturn(Optional.of(anotherTeacher));
        when(classRepository.findById("class123")).thenReturn(Optional.of(mockedClass));

        assertThrows(AccessDeniedException.class, () -> classService.getClassById("class123", "hacker@fake.com"));
    }

    @Test
    void archiveClass_Unauthorized_ThrowsExceptionAndDoesNotSave() {
        when(userRepository.findByEmail("hacker@fake.com")).thenReturn(Optional.of(anotherTeacher));
        when(classRepository.findById("class123")).thenReturn(Optional.of(mockedClass));

        assertThrows(AccessDeniedException.class, () -> classService.archiveClass("class123", "hacker@fake.com"));
        verify(classRepository, never()).save(any());
    }
}
