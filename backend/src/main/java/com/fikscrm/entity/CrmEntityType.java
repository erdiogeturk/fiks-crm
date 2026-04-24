package com.fikscrm.entity;

public enum CrmEntityType {
    MUSTERI("customers", "Müşteri"),
    ILGILI_KISI("contacts", "İlgili Kişi"),
    AKTIVITE("activities", "Aktivite"),
    SATIS_BELGESI("sales_documents", "Satış Belgesi"),
    URUN("products", "Ürün");

    private final String tableName;
    private final String label;

    CrmEntityType(String tableName, String label) {
        this.tableName = tableName;
        this.label = label;
    }

    public String getTableName() { return tableName; }
    public String getLabel()     { return label; }
}
