package com.chiokore.backend.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name= "promociones")
public class Promocion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name ="nombre", nullable = false)
    private String nombre;

    @Column(name = "descuento", nullable = false)
    private double descuento;

    @Column(name = "fechaInicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fechaFin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "activo", nullable = false)
    private boolean activo;

    @Column(name ="url_imagen")
    private String url_imagen;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Categoria categoria;

    @Column(name = "cantidad_paquete", nullable = false, columnDefinition = "int default 1")
    private int cantidadPaquete;

    @Column(name = "precio_paquete", nullable = false, columnDefinition = "double default 0.0")
    private double precioPaquete;
}