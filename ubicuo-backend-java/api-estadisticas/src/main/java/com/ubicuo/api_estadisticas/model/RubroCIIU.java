package com.ubicuo.api_estadisticas.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "RubrosCIIU") // Tiene que coincidir EXACTAMENTE con tu tabla en DBeaver
public class RubroCIIU {

    @Id // Le indica a Spring que esta es la Primary Key
    @Column(name = "Codigo", length = 6)
    private String codigo;

    @Column(name = "DescripcionCorta", nullable = false)
    private String descripcionCorta;

    @Column(name = "DescripcionLarga", columnDefinition = "TEXT")
    private String descripcionLarga;

    // --- Constructor vacío (Obligatorio para Spring) ---
    public RubroCIIU() {
    }

    // --- Getters y Setters ---
    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcionCorta() {
        return descripcionCorta;
    }

    public void setDescripcionCorta(String descripcionCorta) {
        this.descripcionCorta = descripcionCorta;
    }

    public String getDescripcionLarga() {
        return descripcionLarga;
    }

    public void setDescripcionLarga(String descripcionLarga) {
        this.descripcionLarga = descripcionLarga;
    }
}