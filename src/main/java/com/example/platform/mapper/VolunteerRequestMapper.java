package com.example.platform.mapper;


import com.example.platform.dto.volunteer.VolunteerRequestDto;
import com.example.platform.dto.volunteer.VolunteerRequestResponse;
import com.example.platform.model.VolunteerRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface VolunteerRequestMapper {


    @Mapping(target = "id", source = "id")
    @Mapping(target = "fundId", source = "fund.id")
    @Mapping(target = "fundTitle", source = "fund.title")
    @Mapping(target = "volunteerName", source = "volunteer.username")
    @Mapping(target = "telegram", source = "telegram")
    @Mapping(target = "createdAt", source = "createdAt")
    VolunteerRequestResponse toResponse(VolunteerRequest request);


    @Mapping(target = "volunteer", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "telegram", source = "telegram")
    VolunteerRequest toEntity(VolunteerRequestDto dto);

}
