package com.example.platform.repository;

import com.example.platform.model.Fund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FundRepository extends JpaRepository<Fund, Long> {

    @Query("SELECT f FROM Fund f WHERE f.status = 'ACTIVE' AND f.endDate < :today")
    List<Fund> findActiveFundsWithPastEndDate(@Param("today") LocalDate today);

    @Query("SELECT f FROM Fund f WHERE f.owner.id = :ownerId")
    List<Fund> findByOwnerId(@Param("ownerId") Long ownerId);
}
