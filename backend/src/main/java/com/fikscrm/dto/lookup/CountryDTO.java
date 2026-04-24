package com.fikscrm.dto.lookup;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CountryDTO {
    private Long id;
    private String code;
    private String name;
    private String phoneCode;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
