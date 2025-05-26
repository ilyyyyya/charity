package com.example.platform.mapper;


import com.example.platform.dto.fund.FundRequest;
import com.example.platform.dto.fund.FundResponse;
import com.example.platform.model.Fund;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FundMapper {

    Fund toEntity(FundRequest request);

    @Mapping(target = "ownerUsername", source = "owner.displayName")
    @Mapping(target = "username", source = "owner.username")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "imageName", source = "imageName")
    @Mapping(target = "imageType", source = "imageType")
    FundResponse toResponse(Fund fund);



    default void updateFromDto(FundRequest dto, @MappingTarget Fund entity) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setTargetAmount(dto.getTargetAmount());
        entity.setEndDate(dto.getEndDate());
        entity.setCategory(dto.getCategory());
    }

}

