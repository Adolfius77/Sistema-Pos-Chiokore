package com.chiokore.backend.config;

import com.chiokore.backend.modelo.Categoria;
import com.chiokore.backend.modelo.Producto;
import com.chiokore.backend.repository.CategoriaRepository;
import com.chiokore.backend.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        return args -> {
            if (categoriaRepository.count() == 0) {
                
               
                // CREACION DE LAS 4 CATEGORÍAS
                
                
                Categoria ropa = new Categoria();
                ropa.setNombre("Ropa");
                ropa.setUrl_imagen("/ropaA.png");
                categoriaRepository.save(ropa);

                Categoria electronicos = new Categoria();
                electronicos.setNombre("Electrónicos");
                electronicos.setUrl_imagen("/electronicosA.png");
                categoriaRepository.save(electronicos);

                Categoria juguetes = new Categoria();
                juguetes.setNombre("Juguetes");
                juguetes.setUrl_imagen("/JuguetesA.png");
                categoriaRepository.save(juguetes);

                Categoria muebles = new Categoria();
                muebles.setNombre("Muebles");
                muebles.setUrl_imagen("/muebleA.png");
                categoriaRepository.save(muebles);

              

                // Producto para Ropa
                Producto camisa = new Producto();
                camisa.setNombre("Camisa de Verano");
                camisa.setPrecio(250.0);
                camisa.setEs_Unico(false);
                camisa.setUrl_imagen("/camisa.png"); 
                camisa.setActivo(true);
                camisa.setStock(15);
                camisa.setCategoria(ropa);
                productoRepository.save(camisa);

                // Producto para Electrónicos
                Producto consola = new Producto();
                consola.setNombre("PlayStation 5");
                consola.setPrecio(8500.0);
                consola.setEs_Unico(true);
                consola.setUrl_imagen("/play.png"); 
                consola.setActivo(true);
                consola.setStock(3);
                consola.setCategoria(electronicos);
                productoRepository.save(consola);

                // Producto para Juguetes
                Producto osoPeluche = new Producto();
                osoPeluche.setNombre("Oso de Peluche");
                osoPeluche.setPrecio(150.0);
                osoPeluche.setEs_Unico(false);
                osoPeluche.setUrl_imagen("/juguetes.jpg"); 
                osoPeluche.setActivo(true);
                osoPeluche.setStock(10);
                osoPeluche.setCategoria(juguetes);
                productoRepository.save(osoPeluche);

                // Producto para Muebles
                Producto sofa = new Producto();
                sofa.setNombre("Sofá Minimalista");
                sofa.setPrecio(3200.0);
                sofa.setEs_Unico(true);
                sofa.setUrl_imagen("/muebles.jpg"); 
                sofa.setActivo(true);
                sofa.setStock(2);
                sofa.setCategoria(muebles);
                productoRepository.save(sofa);

                System.out.println(" Datos iniciales (4 Categorías y 4 Productos) cargados exitosamente.");
            } else {
                System.out.println(" La base de datos ya contiene información. Se omite el Seeder.");
            }
        };
    }
}