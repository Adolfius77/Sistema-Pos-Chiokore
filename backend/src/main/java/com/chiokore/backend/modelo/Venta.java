package com.chiokore.backend.modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.pojava.datetime.DateTime;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private int id;

    @Column(name = "fecha_hora", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime fecha_hora;

    @Column(name = "total", nullable = false)
    private double total;

    @Column(name = "monto_recibido", nullable = false)
    private double monto_recibido;

    @Column(name = "cambio_entregado", nullable = false)
    private double cambio_entregado;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoVenta estado;

    @Column(name = "usuario_id", nullable = false)
    private int usuario_id;

    @Column(name = "metodo_pago", nullable = false)
    private String metodo_pago;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleVenta> detalles = new ArrayList<>();


}
