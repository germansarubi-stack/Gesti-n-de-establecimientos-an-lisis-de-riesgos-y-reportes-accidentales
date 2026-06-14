package com.ubicuo.api_estadisticas.controller;

import com.ubicuo.api_estadisticas.model.RubroCIIU;
import com.ubicuo.api_estadisticas.repository.RubroCIIURepository;
import com.ubicuo.api_estadisticas.service.OpenAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ciiu")
@CrossOrigin(origins = "*")
public class RubroCIIUController {

    @Autowired
    private RubroCIIURepository repository;

    @Autowired
    private OpenAiService openAiService;

    // Endpoint de búsqueda manual predictiva
    @GetMapping("/buscar")
    public List<RubroCIIU> buscarRubros(@RequestParam String termino) {
        return repository.findByDescripcionCortaContainingIgnoreCase(termino);
    }

    // Endpoint Inteligente con Arquitectura RAG y Modelo Multidimensional
    @GetMapping("/sugerir")
    public org.springframework.http.ResponseEntity<?> sugerirRubroInteligente(
            @RequestParam String descripcion,
            @RequestParam(defaultValue = "Nacional") String provincia) { // RECIBE LA PROVINCIA
        
        System.out.println("--- INICIANDO PROCESO DE CLASIFICACIÓN IA ---");
        System.out.println("Descripción del usuario: " + descripcion);
        System.out.println("Provincia solicitada: " + provincia);

        // 1. Extraer palabra clave con OpenAI
        String palabraClave = openAiService.extraerPalabraClave(descripcion);
        System.out.println("Paso 1 - Palabra clave extraída: " + palabraClave);

        // Buscar en la base de datos (Usando la búsqueda amplia del repositorio)
        List<RubroCIIU> candidatos = repository.findByDescripcionCortaContainingIgnoreCaseOrDescripcionLargaContainingIgnoreCase(palabraClave, palabraClave);
        System.out.println("Paso 2 - Candidatos encontrados en BD: " + candidatos.size());

        if (candidatos.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body(Map.of("error", "No se encontraron rubros CIIU coincidentes para la actividad descrita."));
        }

        // 2. Que la IA elija el código exacto
        String ciiu = openAiService.elegirMejorCodigo(descripcion, candidatos);
        System.out.println("Paso 3 - La IA eligió el código final validado: " + ciiu);

        // Buscamos el nombre completo del rubro para darle contexto final a la IA
        String nombreRubro = "Rubro no especificado";
        RubroCIIU rubroCompleto = repository.findById(ciiu).orElse(null);
        if (rubroCompleto != null) {
            nombreRubro = rubroCompleto.getDescripcionLarga(); // Usamos la larga para más precisión
        }

        // 3. LA CONSULTA MULTIDIMENSIONAL AL ESQUEMA ESTRELLA
        System.out.println("--- EXTRACCIÓN DE DATOS PARA LA IA: " + ciiu + " EN " + provincia.toUpperCase() + " ---");
        
        // MAGIA DE DATA ENGINEERING: Al usar "h.*", extraemos TODAS las columnas de la tabla de hechos.
        // Si mañana inyectas más Excels (edades, letalidad, sexo), Java las absorberá automáticamente 
        // y se las entregará a OpenAI sin que tengas que recompilar este código.
        String sql = "SELECT h.*, d.nombre_sector " +
                     "FROM hechos_accidentabilidad h " +
                     "JOIN dim_actividad_sectores d ON h.sector_letra = d.sector_letra " +
                     "WHERE h.provincia = ? " +
                     "AND CAST(SUBSTRING(?, 1, 3) AS INTEGER) BETWEEN d.ciiu_inicio AND d.ciiu_fin " +
                     "ORDER BY h.anio ASC";

        // Obtenemos los datos crudos
        List<Map<String, Object>> estadisticasCrudas = jdbcTemplate.queryForList(sql, provincia, ciiu);
        
        // Creamos una lista nueva modificable para inyectar protecciones para el Frontend
        List<Map<String, Object>> estadisticas = new java.util.ArrayList<>();
        
        for (Map<String, Object> fila : estadisticasCrudas) {
            Map<String, Object> filaModificable = new java.util.HashMap<>(fila);
            
            // Parche de seguridad: Si la columna 'casos_mortales' aún no existe en la BD, la forzamos a 0
            // para que la línea roja de Chart.js en Angular no se rompa por valores 'undefined'.
            filaModificable.putIfAbsent("casos_mortales", 0);
            
            estadisticas.add(filaModificable);
        }

        if (estadisticas.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body(Map.of(
                        "codigo_ciiu", ciiu,
                        "rubro", nombreRubro,
                        "error", "No hay estadísticas históricas cargadas para este sector en la provincia indicada."
                    ));
        }

        // 4. Le pasamos todo el bloque dinámico a OpenAI
        System.out.println("Generando informe gerencial multidimensional con IA...");
        String analisisIA = openAiService.analizarEstadisticas(nombreRubro, estadisticas);

        // 5. Empaquetamos la respuesta final para Angular
        return org.springframework.http.ResponseEntity.ok(Map.of(
                "codigo_ciiu", ciiu,
                "rubro", nombreRubro,
                "provincia", provincia,
                "estadisticas_crudas", estadisticas,
                "analisis_inteligente", analisisIA
        ));
    }

    // Herramienta mágica para hacer consultas SQL rápidas
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ENDPOINT DE ESTADÍSTICAS
    // GET http://localhost:8080/api/ciiu/estadisticas/011111
    @GetMapping("/estadisticas/{ciiu}")
    public org.springframework.http.ResponseEntity<?> obtenerEstadisticasIA(@PathVariable String ciiu) {
        
        System.out.println("--- INICIANDO ANÁLISIS ESTADÍSTICO PARA: " + ciiu + " ---");

        // 1. Recortamos el código a 3 dígitos (Ej: "011111" -> "011") para coincidir con el Excel
        String ciiu3 = ciiu.length() >= 3 ? ciiu.substring(0, 3) : ciiu;
        
        // 2. Buscamos el nombre del rubro para darle contexto a la IA
        String nombreRubro = "Rubro no especificado";
        RubroCIIU rubroCompleto = repository.findById(ciiu).orElse(null);
        if (rubroCompleto != null) {
            nombreRubro = rubroCompleto.getDescripcionCorta();
        }

        // 3. Consultamos la tabla nueva en PostgreSQL
        String sql = "SELECT anio, indice_incidencia, casos_mortales FROM estadisticas_ciiu WHERE ciiu3 = ? ORDER BY anio ASC";
        List<Map<String, Object>> estadisticas = jdbcTemplate.queryForList(sql, ciiu3);

        if (estadisticas.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body(Map.of("error", "No hay estadísticas históricas cargadas para la familia de rubros " + ciiu3));
        }

        // 4. Le pasamos los números a OpenAI para que escriba el resumen
        System.out.println("Generando resumen con IA...");
        String analisisIA = openAiService.analizarEstadisticas(nombreRubro, estadisticas);

        // 5. Empaquetamos todo (Números crudos + Texto de la IA) y se lo mandamos a Angular
        Map<String, Object> respuestaFinal = Map.of(
            "estadisticasCrud", estadisticas,
            "analisisIA", analisisIA
        );

        return org.springframework.http.ResponseEntity.ok(respuestaFinal);
    }
}