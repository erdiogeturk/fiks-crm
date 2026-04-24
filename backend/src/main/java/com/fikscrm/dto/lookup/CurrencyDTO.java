package com.fikscrm.dto.lookup;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CurrencyDTO {
    private Long id;
    private String code;
    private String name;
    private String symbol;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
