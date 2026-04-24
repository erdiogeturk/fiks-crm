package com.fikscrm.dto.lookup;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegionDTO {
    private Long id;
    private String code;
    private String name;
    private Long countryId;
    private String countryName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
