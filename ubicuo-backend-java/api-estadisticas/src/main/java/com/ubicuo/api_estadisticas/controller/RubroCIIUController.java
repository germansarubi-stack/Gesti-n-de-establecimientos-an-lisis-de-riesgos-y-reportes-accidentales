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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Endpoint de búsqueda manual predictiva
    @GetMapping("/buscar")
    public List<RubroCIIU> buscarRubros(@RequestParam String termino) {
        return repository.findByDescripcionCortaContainingIgnoreCase(termino);
    }

    // --- ENDPOINT 1: extrae el código CIIU  ---
    @GetMapping("/sugerir")
    public org.springframework.http.ResponseEntity<?> sugerirRubroInteligente(@RequestParam String descripcion) {
        
        System.out.println("--- INICIANDO CLASIFICACIÓN IA (MODO LIGERO) ---");
        String palabraClave = openAiService.extraerPalabraClave(descripcion);
        List<RubroCIIU> candidatos = repository.findByDescripcionCortaContainingIgnoreCaseOrDescripcionLargaContainingIgnoreCase(palabraClave, palabraClave);

        if (candidatos.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body(Map.of("error", "No se encontraron rubros coincidentes."));
        }

        String ciiu = openAiService.elegirMejorCodigo(descripcion, candidatos);
        
        String nombreRubro = "Rubro no especificado";
        RubroCIIU rubroCompleto = repository.findById(ciiu).orElse(null);
        if (rubroCompleto != null) {
            nombreRubro = rubroCompleto.getDescripcionLarga();
        }

        return org.springframework.http.ResponseEntity.ok(Map.of(
                "codigo_ciiu", ciiu,
                "rubro", nombreRubro
        ));
    }

    // --- ENDPOINT 2: busca la historia y redacta el informe ---
    @GetMapping("/estadisticas")
    public org.springframework.http.ResponseEntity<?> obtenerEstadisticas(
            @RequestParam String ciiu,
            @RequestParam String rubro,
            @RequestParam(defaultValue = "Nacional") String provincia) {
        
        System.out.println("--- EXTRACCIÓN AL DATA WAREHOUSE: " + ciiu + " EN " + provincia.toUpperCase() + " ---");
        
        String sql = "SELECT h.*, d.nombre_sector " +
                     "FROM hechos_accidentabilidad h " +
                     "JOIN dim_actividad_sectores d ON h.sector_letra = d.sector_letra " +
                     "WHERE h.provincia = ? " +
                     "AND CAST(SUBSTRING(?, 1, 3) AS INTEGER) BETWEEN d.ciiu_inicio AND d.ciiu_fin " +
                     "ORDER BY h.anio ASC";

        List<Map<String, Object>> estadisticasCrudas = jdbcTemplate.queryForList(sql, provincia, ciiu);
        List<Map<String, Object>> estadisticas = new java.util.ArrayList<>();
        
        for (Map<String, Object> fila : estadisticasCrudas) {
            Map<String, Object> filaModificable = new java.util.HashMap<>(fila);
            filaModificable.putIfAbsent("casos_mortales", 0);
            estadisticas.add(filaModificable);
        }

        if (estadisticas.isEmpty()) {
            return org.springframework.http.ResponseEntity.status(404)
                    .body(Map.of("error", "No hay estadísticas históricas cargadas para esta provincia y sector."));
        }

        System.out.println("Generando informe gerencial multidimensional con IA...");
        String analisisIA = openAiService.analizarEstadisticas(rubro, estadisticas);

        return org.springframework.http.ResponseEntity.ok(Map.of(
                "estadisticas_crudas", estadisticas,
                "analisis_inteligente", analisisIA
        ));
    }
}