package com.chiokore.backend.modelo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private int id;

    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    @Column(name ="precio", nullable = false)
    private double precio;

    @Column(name = "es_unico", nullable = false, columnDefinition = "bit(1)")
    private boolean es_Unico;

    @Column(name = "url_imagen")
    private String url_imagen;

    @Column(name="activo", nullable = false, columnDefinition = "bit(1)")
    private boolean activo;

    @Column(name ="stock", nullable = false)
    private int stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

}
