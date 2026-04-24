package com.fikscrm.dto.lookup;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CityDTO {
    private Long id;
    private String code;
    private String name;
    private Long countryId;
    private String countryName;
    private Long regionId;
    private String regionName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
