package com.example.platform.mapper;

import com.example.platform.dto.report.FundReportRequest;
import com.example.platform.dto.report.FundReportResponse;
import com.example.platform.dto.report.ReportPhotoResponse;
import com.example.platform.model.FundReport;
import com.example.platform.model.ReportPhoto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FundReportMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fund", ignore = true)
    @Mapping(target = "photos", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    FundReport toEntity(FundReportRequest request);

    @Mapping(target = "fundId", source = "fund.id")
    @Mapping(target = "fundTitle", source = "fund.title")
    @Mapping(target = "photos", source = "photos")
    FundReportResponse toResponse(FundReport report);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "fileName", source = "fileName")
    @Mapping(target = "fileType", source = "fileType")
    ReportPhotoResponse toPhotoResponse(ReportPhoto photo);

    List<ReportPhotoResponse> toPhotoResponseList(List<ReportPhoto> photos);

    default void updateFromDto(FundReportRequest dto, @MappingTarget FundReport entity) {
        entity.setDescription(dto.getDescription());
        entity.setTotalSpent(dto.getTotalSpent());
        entity.setExpenses(dto.getExpenses());
        entity.setPurchases(dto.getPurchases());
    }
} 