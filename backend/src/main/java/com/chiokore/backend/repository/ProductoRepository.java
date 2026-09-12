package com.chiokore.backend.repository;

import com.chiokore.backend.modelo.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByNombre(String nombre);

    List<Producto> findByCategoriaId(Long id);

    List<Producto> findByActivoTrue();

    /** Cuenta el stock bajo en la base de datos en vez de traer todo el catalogo a memoria. */
    long countByActivoTrueAndStockLessThanEqual(int umbral);

    /**
     * Lee el producto tomando un candado de escritura sobre la fila.
     *
     * Necesario al cobrar: leer stock, restarlo y guardarlo son tres pasos, y sin
     * candado dos cajas cobrando el mismo producto a la vez pueden vender mas
     * unidades de las que hay (ambas leen el mismo stock antes de que la otra escriba).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> findByIdParaActualizar(@Param("id") Long id);
}
