package modelo;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private int id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name ="precio", nullable = false)
    private double precio;

    @Column(name = "es_unico", nullable = false)
    private boolean es_unico;

    @Column(name = "url_imagen")
    private String url_imagen;

    @Column(name="activo", nullable = false)
    private boolean activo;

    @Column(name ="stock", nullable = false)
    private int stock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

}
