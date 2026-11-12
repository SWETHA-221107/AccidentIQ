
package com.accidentiq.backend.repository;

import com.accidentiq.backend.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository
        extends JpaRepository<Incident, Long> {
}
