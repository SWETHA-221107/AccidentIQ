
package com.accidentiq.backend.controller;

import com.accidentiq.backend.Incident;
import com.accidentiq.backend.dto.CreateIncidentRequest;
import com.accidentiq.backend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentService.getAllIncidents();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Incident createIncident(
            @Valid @RequestBody CreateIncidentRequest request) {
        return incidentService.createIncident(request);
    }
    @PatchMapping("/{id}/status")
public Incident updateIncidentStatus(
        @PathVariable Long id,
        @RequestBody java.util.Map<String, String> request) {

    String status = request.get("status");

    if (status == null || status.isBlank()) {
        throw new org.springframework.web.server.ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Status is required"
        );
    }

    return incidentService.updateIncidentStatus(id, status);
}
}
