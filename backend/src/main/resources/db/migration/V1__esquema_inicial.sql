
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `activo` bit(1) NOT NULL,
  `es_unico` bit(1) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` double NOT NULL,
  `stock` int NOT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `categoria_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2fwq10nwymfv7fumctxt9vpgb` (`categoria_id`),
  CONSTRAINT `FK2fwq10nwymfv7fumctxt9vpgb` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `promociones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha_fin` date NOT NULL,
  `fecha_inicio` date NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `categoria_id` int NOT NULL,
  `activo` bit(1) NOT NULL,
  `descuento` double NOT NULL,
  `url_imagen` varchar(255) DEFAULT NULL,
  `cantidad_paquete` int NOT NULL DEFAULT '1',
  `precio_paquete` double NOT NULL DEFAULT '0',
  `precio_promocional` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhn945l38v07bjkw6ldfua9j9m` (`categoria_id`),
  CONSTRAINT `FKhn945l38v07bjkw6ldfua9j9m` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `venta` (
  `id` int NOT NULL,
  `cambio_entregado` double NOT NULL,
  `estado` enum('CANCELADA','COMPLETADA','PENDIENTE') NOT NULL,
  `fecha_hora` datetime(6) NOT NULL,
  `metodo_pago` varchar(255) NOT NULL,
  `monto_recibido` double NOT NULL,
  `total` double NOT NULL,
  `usuario_id` int NOT NULL,
  `referencia` varchar(255) DEFAULT NULL,
  `url_comprobante` varchar(255) DEFAULT NULL,
  `cajero_nombre` varchar(255) DEFAULT NULL,
  `dispositivo_modelo` varchar(255) DEFAULT NULL,
  `ip_origen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `detalle_venta` (
  `id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario_cap` double NOT NULL,
  `producto_id` int NOT NULL,
  `venta_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdn5t1y68ckfy82hqxs0lmi9e` (`producto_id`),
  KEY `FKhj0bf0515yg7equ11ab4xgq3f` (`venta_id`),
  CONSTRAINT `FKdn5t1y68ckfy82hqxs0lmi9e` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKhj0bf0515yg7equ11ab4xgq3f` FOREIGN KEY (`venta_id`) REFERENCES `venta` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `usuario_asistencia` (
  `id_asistencia` bigint NOT NULL,
  `activo` bit(1) NOT NULL,
  `marco_asistencia` bit(1) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL,
  PRIMARY KEY (`id_asistencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `productos_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `venta_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `detalle_venta_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `promociones_seq` (
  `next_val` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
