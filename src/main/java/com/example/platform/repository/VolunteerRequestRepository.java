package com.example.platform.repository;

import com.example.platform.model.User;
import com.example.platform.model.VolunteerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRequestRepository extends JpaRepository<VolunteerRequest, Long> {

    List<VolunteerRequest> findByFundId(Long fundId);
    List<VolunteerRequest> findByVolunteerId(Long volunteerId);
    Optional<VolunteerRequest> findByVolunteerAndFundId(User volunteer, Long fundId);

}
