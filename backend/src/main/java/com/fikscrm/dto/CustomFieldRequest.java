package com.fikscrm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomFieldRequest {

    @NotBlank
    @Size(max = 255)
    private String label;

    @NotBlank
    @Pattern(regexp = "[a-z][a-z0-9_]{0,48}", message = "Yalnızca küçük harf, rakam ve alt çizgi; harf ile başlamalı")
    private String fieldName; // becomes cf_{fieldName} in DB

    @NotBlank
    private String dataType; // TEXT | LONG_TEXT | NUMBER | DECIMAL | DATE | DATETIME | BOOLEAN | SELECT

    private Integer fieldLength; // for TEXT, default 255

    private Boolean nullable; // default true

    @Size(max = 500)
    private String defaultValue;

    private List<String> selectOptions; // for SELECT type
}
