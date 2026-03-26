package com.shikshasathi.backend.api.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Base Controller establishing API Versioning Conventions
 * All domain controllers should extend this class to inherit /api/v1 routing.
 */
@RestController
@RequestMapping("/api/v1")
public abstract class BaseController {
}
