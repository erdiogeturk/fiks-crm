package com.fikscrm.service;

import com.fikscrm.dto.ColumnInfoDTO;
import com.fikscrm.dto.CustomFieldPreviewDTO;
import com.fikscrm.dto.CustomFieldRequest;
import com.fikscrm.entity.Company;
import com.fikscrm.entity.CustomField;
import com.fikscrm.exception.ResourceNotFoundException;
import com.fikscrm.repository.CustomFieldRepository;
import com.fikscrm.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomFieldService {

    private final CustomFieldRepository customFieldRepo;
    private final UserRepository userRepo;

    @PersistenceContext
    private EntityManager em;

    // ── Column listing (DB introspection + metadata merge) ─────────────────

    public List<ColumnInfoDTO> getColumns(String tableName) {
        validateTableExists(tableName);

        List<Object[]> dbCols = em.createNativeQuery(
            "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT, ORDINAL_POSITION " +
            "FROM information_schema.COLUMNS " +
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tbl " +
            "ORDER BY ORDINAL_POSITION"
        ).setParameter("tbl", tableName).getResultList();

        Map<String, CustomField> metaMap = customFieldRepo
            .findAllByCompanyIdAndEntityTypeOrderBySortOrderAscCreatedAtAsc(companyId(), tableName)
            .stream().collect(Collectors.toMap(CustomField::getColumnName, cf -> cf));

        List<ColumnInfoDTO> result = new ArrayList<>();
        for (Object[] row : dbCols) {
            String colName  = (String) row[0];
            String dbType   = ((String) row[1]).toUpperCase();
            Long   maxLen   = row[2] != null ? ((Number) row[2]).longValue() : null;
            boolean isNull  = "YES".equals(row[3]);
            String  defVal  = (String) row[4];
            boolean isCustom = metaMap.containsKey(colName);
            CustomField meta = metaMap.get(colName);

            result.add(ColumnInfoDTO.builder()
                .columnName(colName)
                .label(isCustom ? meta.getLabel() : toLabel(colName))
                .dbDataType(dbType)
                .fieldType(isCustom ? meta.getDataType() : inferFieldType(dbType))
                .maxLength(maxLen != null ? maxLen.intValue() : null)
                .nullable(isNull)
                .defaultValue(defVal)
                .custom(isCustom)
                .customFieldId(isCustom ? meta.getId() : null)
                .selectOptions(isCustom ? meta.getSelectOptions() : null)
                .status(isCustom ? meta.getStatus() : null)
                .build());
        }
        return result;
    }

    // ── Preview (no DB changes) ────────────────────────────────────────────

    public CustomFieldPreviewDTO preview(String tableName, CustomFieldRequest req) {
        validateTableExists(tableName);
        String columnName = "cf_" + req.getFieldName();
        boolean nullable  = req.getNullable() == null || req.getNullable();

        String dbType   = resolveDbType(req);
        String ddl      = buildDdl(tableName, columnName, req.getLabel(), dbType, nullable, req.getDefaultValue());
        boolean exists  = columnExists(tableName, columnName);

        return CustomFieldPreviewDTO.builder()
            .entityType(tableName)
            .entityLabel(toDisplayLabel(tableName))
            .tableName(tableName)
            .label(req.getLabel())
            .columnName(columnName)
            .dataType(req.getDataType())
            .dbDataType(dbType)
            .fieldLength(req.getDataType().equals("TEXT") ? (req.getFieldLength() != null ? req.getFieldLength() : 255) : null)
            .nullable(nullable)
            .defaultValue(req.getDefaultValue())
            .selectOptions(req.getSelectOptions())
            .ddlStatement(ddl)
            .columnAlreadyExists(exists)
            .build();
    }

    // ── Apply (DDL + metadata save) ────────────────────────────────────────

    public ColumnInfoDTO apply(String tableName, CustomFieldRequest req) {
        validateTableExists(tableName);
        String columnName = "cf_" + req.getFieldName();
        boolean nullable  = req.getNullable() == null || req.getNullable();
        Long cid = companyId();

        if (customFieldRepo.existsByCompanyIdAndEntityTypeAndColumnName(cid, tableName, columnName)) {
            throw new IllegalArgumentException("Bu alan zaten tanımlı: " + columnName);
        }

        String dbType = resolveDbType(req);

        // DDL: MySQL auto-commits DDL regardless of JPA transaction
        if (!columnExists(tableName, columnName)) {
            String ddl = buildDdl(tableName, columnName, req.getLabel(), dbType, nullable, req.getDefaultValue());
            try {
                em.createNativeQuery(ddl).executeUpdate();
            } catch (Exception e) {
                throw new RuntimeException("Veritabanına alan eklenemedi: " + e.getMessage(), e);
            }
        }

        // Metadata — save in its own implicit transaction via Spring Data
        String optionsStr = req.getSelectOptions() != null
            ? String.join(",", req.getSelectOptions()) : null;

        CustomField cf = CustomField.builder()
            .entityType(tableName)
            .tableName(tableName)
            .columnName(columnName)
            .label(req.getLabel())
            .dataType(req.getDataType())
            .fieldLength(req.getDataType().equals("TEXT") ? (req.getFieldLength() != null ? req.getFieldLength() : 255) : null)
            .nullable(nullable)
            .defaultValue(req.getDefaultValue())
            .selectOptions(optionsStr)
            .status("ACTIVE")
            .company(company())
            .build();
        cf = customFieldRepo.save(cf);

        return ColumnInfoDTO.builder()
            .columnName(columnName)
            .label(req.getLabel())
            .dbDataType(dbType)
            .fieldType(req.getDataType())
            .nullable(nullable)
            .defaultValue(req.getDefaultValue())
            .selectOptions(optionsStr)
            .custom(true)
            .customFieldId(cf.getId())
            .status("ACTIVE")
            .build();
    }

    // ── Deactivate (soft delete — column stays in DB) ──────────────────────

    @Transactional
    public void deactivate(Long id) {
        CustomField cf = customFieldRepo.findById(id)
            .filter(c -> c.getCompany().getId().equals(companyId()))
            .orElseThrow(() -> new ResourceNotFoundException("Alan bulunamadı: " + id));
        cf.setStatus("INACTIVE");
        customFieldRepo.save(cf);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private void validateTableExists(String tableName) {
        Number count = (Number) em.createNativeQuery(
            "SELECT COUNT(*) FROM information_schema.TABLES " +
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = :tbl"
        ).setParameter("tbl", tableName).getSingleResult();
        if (count.longValue() == 0) {
            throw new IllegalArgumentException("Tablo bulunamadı: " + tableName);
        }
    }

    private String toDisplayLabel(String tableName) {
        return Arrays.stream(tableName.split("_"))
            .filter(w -> !w.isEmpty())
            .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
            .collect(Collectors.joining(" "));
    }

    private String resolveDbType(CustomFieldRequest req) {
        int len = req.getFieldLength() != null ? req.getFieldLength() : 255;
        return switch (req.getDataType()) {
            case "TEXT"       -> "VARCHAR(" + len + ")";
            case "LONG_TEXT"  -> "TEXT";
            case "NUMBER"     -> "BIGINT";
            case "DECIMAL"    -> "DECIMAL(18,2)";
            case "DATE"       -> "DATE";
            case "DATETIME"   -> "DATETIME";
            case "BOOLEAN"    -> "TINYINT(1)";
            case "SELECT"     -> "VARCHAR(100)";
            default           -> "VARCHAR(255)";
        };
    }

    private String buildDdl(String table, String column, String label, String dbType,
                             boolean nullable, String defaultValue) {
        String nullStr = nullable ? "NULL" : "NOT NULL";
        String defStr  = (defaultValue != null && !defaultValue.isBlank())
            ? " DEFAULT '" + defaultValue.replace("'", "''") + "'"
            : " DEFAULT NULL";
        String comment = label.replace("'", "\\'");
        return String.format("ALTER TABLE `%s` ADD COLUMN `%s` %s %s%s COMMENT '%s'",
            table, column, dbType, nullStr, defStr, comment);
    }

    private boolean columnExists(String tableName, String columnName) {
        Number n = (Number) em.createNativeQuery(
            "SELECT COUNT(*) FROM information_schema.COLUMNS " +
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tbl AND COLUMN_NAME = :col"
        ).setParameter("tbl", tableName).setParameter("col", columnName).getSingleResult();
        return n.longValue() > 0;
    }

    private String inferFieldType(String dbType) {
        if (dbType.startsWith("VARCHAR") || dbType.equals("CHAR")) return "TEXT";
        if (dbType.equals("TEXT") || dbType.equals("LONGTEXT") || dbType.equals("MEDIUMTEXT")) return "LONG_TEXT";
        if (dbType.equals("BIGINT") || dbType.equals("INT") || dbType.equals("SMALLINT")) return "NUMBER";
        if (dbType.startsWith("DECIMAL") || dbType.startsWith("NUMERIC") || dbType.equals("FLOAT") || dbType.equals("DOUBLE")) return "DECIMAL";
        if (dbType.equals("DATE")) return "DATE";
        if (dbType.equals("DATETIME") || dbType.equals("TIMESTAMP")) return "DATETIME";
        if (dbType.equals("TINYINT")) return "BOOLEAN";
        return "TEXT";
    }

    private String toLabel(String columnName) {
        return Arrays.stream(columnName.split("_"))
            .filter(w -> !w.isEmpty())
            .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
            .collect(Collectors.joining(" "));
    }

    private Long companyId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."))
            .getCompany().getId();
    }

    private Company company() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı."))
            .getCompany();
    }
}
