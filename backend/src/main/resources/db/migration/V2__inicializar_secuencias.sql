-- La V1 crea las tablas *_seq vacias y Hibernate falla al arrancar en una base
-- nueva ("Could not read a hi value, populate the table"). Se les pone su fila
-- inicial solo si estan vacias; en bases existentes no se toca nada.
-- Si ya hay datos se arranca 51 por encima del id maximo (el optimizador pooled
-- reserva bloques de 50) para no chocar con ids existentes.
INSERT INTO productos_seq (next_val)
SELECT COALESCE(MAX(id) + 51, 1) FROM productos
WHERE NOT EXISTS (SELECT 1 FROM productos_seq);

INSERT INTO venta_seq (next_val)
SELECT COALESCE(MAX(id) + 51, 1) FROM venta
WHERE NOT EXISTS (SELECT 1 FROM venta_seq);

INSERT INTO detalle_venta_seq (next_val)
SELECT COALESCE(MAX(id) + 51, 1) FROM detalle_venta
WHERE NOT EXISTS (SELECT 1 FROM detalle_venta_seq);

INSERT INTO promociones_seq (next_val)
SELECT COALESCE(MAX(id) + 51, 1) FROM promociones
WHERE NOT EXISTS (SELECT 1 FROM promociones_seq);
