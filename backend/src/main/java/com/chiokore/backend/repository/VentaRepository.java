package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByUsuarioId(int usuarioId);

    // Ventas COMPLETADAS dentro de un rango de fecha/hora. Para los reportes de Nomina.
    @Query("select v from Venta v where v.estado = com.chiokore.backend.modelo.EstadoVenta.COMPLETADA " +
           "and v.fecha_hora between :desde and :hasta")
    List<Venta> findCompletadasEntre(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("""
            SELECT v FROM Venta v
            WHERE v.fecha_hora >= :inicio AND v.fecha_hora < :fin
            ORDER BY v.fecha_hora DESC
            """)
    List<Venta> findByRangoFecha(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("""
            SELECT DISTINCT v FROM Venta v
            LEFT JOIN FETCH v.detalles d
            LEFT JOIN FETCH d.producto
            WHERE v.id = :id
            """)
    Optional<Venta> findByIdWithDetalles(@Param("id") Long id);
}
