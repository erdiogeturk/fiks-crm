package com.fikscrm.dto.lookup;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DistrictDTO {
    private Long id;
    private String code;
    private String name;
    private Long cityId;
    private String cityName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
