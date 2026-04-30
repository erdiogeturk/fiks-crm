package com.fikscrm.service;

import com.fikscrm.dto.SchemaTableDTO;
import com.fikscrm.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchemaService {

    @PersistenceContext
    private EntityManager em;

    private final UserRepository userRepo;

    // Tables to always exclude (system/meta tables)
    private static final Set<String> EXCLUDED_TABLES = Set.of(
        "flyway_schema_history", "custom_fields", "role_field_permissions"
    );

    // Known Turkish display labels
    private static final Map<String, String> TABLE_LABELS = Map.ofEntries(
        Map.entry("customers",               "Müşteriler"),
        Map.entry("contacts",                "İlgili Kişiler"),
        Map.entry("activities",              "Aktiviteler"),
        Map.entry("sales_documents",         "Satış Belgeleri"),
        Map.entry("sales_document_items",    "Satış Belgesi Kalemleri"),
        Map.entry("products",                "Ürünler"),
        Map.entry("organizations",           "Organizasyonlar"),
        Map.entry("org_team_members",        "Organizasyon Ekibi"),
        Map.entry("organization_team_members", "Organizasyon Ekibi"),
        Map.entry("employees",               "Çalışanlar"),
        Map.entry("users",                   "Kullanıcılar"),
        Map.entry("companies",               "Şirketler"),
        Map.entry("projects",                "Projeler"),
        Map.entry("lkp_countries",           "Ülkeler"),
        Map.entry("lkp_regions",             "Bölgeler"),
        Map.entry("lkp_cities",              "İller"),
        Map.entry("lkp_districts",           "İlçeler"),
        Map.entry("lkp_positions",           "Pozisyonlar"),
        Map.entry("lkp_units",               "Birimler"),
        Map.entry("lkp_currencies",          "Para Birimleri"),
        Map.entry("countries",               "Ülkeler"),
        Map.entry("regions",                 "Bölgeler"),
        Map.entry("cities",                  "İller"),
        Map.entry("districts",               "İlçeler"),
        Map.entry("positions",               "Pozisyonlar"),
        Map.entry("units",                   "Birimler"),
        Map.entry("currencies",              "Para Birimleri")
    );

    @SuppressWarnings("unchecked")
    public List<SchemaTableDTO> getTables() {
        List<Object[]> rows = em.createNativeQuery(
            "SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES " +
            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' " +
            "ORDER BY TABLE_NAME"
        ).getResultList();

        return rows.stream()
            .map(r -> (String) r[0])
            .filter(t -> !EXCLUDED_TABLES.contains(t))
            .map(t -> SchemaTableDTO.builder()
                .tableName(t)
                .displayName(TABLE_LABELS.getOrDefault(t, toDisplayLabel(t)))
                .maintenance(t.startsWith("lkp_"))
                .build())
            .collect(Collectors.toList());
    }

    private String toDisplayLabel(String tableName) {
        return Arrays.stream(tableName.split("_"))
            .filter(w -> !w.isEmpty())
            .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
            .collect(Collectors.joining(" "));
    }
}
