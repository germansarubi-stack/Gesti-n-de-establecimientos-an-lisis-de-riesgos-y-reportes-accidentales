package com.ubicuo.api_estadisticas.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ubicuo.api_estadisticas.model.RubroCIIU;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    @Value("${openai.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // Método centralizado para hacer peticiones a OpenAI
    private String consultarOpenAI(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Falta configurar OPENAI_API_KEY en el entorno o en application.properties local");
        }

        String url = "https://api.openai.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-5.4-mini");
        body.put("temperature", 0.0); // Cero creatividad
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = mapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText().trim();
        } catch (Exception e) {
            System.out.println("Error con OpenAI: " + e.getMessage());
            return null;
        }
    }

    // PASO 1: Extraer palabra clave para buscar en la BD
    public String extraerPalabraClave(String descripcionFormulario) {
        String prompt = "Actúa como un experto en bases de datos del nomenclador CIIU de AFIP.\n" +
                "Debes elegir UNA SOLA PALABRA para ejecutar un 'LIKE %palabra%' en SQL y traer los mejores candidatos.\n\n" +
                "REGLAS ESTRATÉGICAS DE BÚSQUEDA (Traducción de lenguaje común a vocabulario AFIP):\n" +
                "1. Si es venta al público / minorista / consumidor final -> devuelve la palabra: menor\n" +
                "2. Si es venta mayorista / distribuidora -> devuelve la palabra: mayor\n" +
                "3. Si es un hospital, clínica, sanatorio, consultorio o médico -> devuelve la palabra segura: salud\n" +
                "4. Si es educación, escuela, colegio -> devuelve la palabra: escolar\n" +
                "5. Si es restaurante, bar, comida -> devuelve la palabra: expendio\n" +
                "6. Si es transporte, flete, logística -> devuelve la palabra: transporte\n" +
                "7. Si es un servicio -> extrae la acción principal (ej: limpieza, contable).\n" +
                "8. SOLO si es Industria/Fábrica -> extrae el material principal.\n\n" +
                "IMPORTANTE: Devuelve SOLAMENTE la palabra, en singular, en minúsculas y ELIGE PALABRAS QUE NO LLEVEN TILDE (para evitar errores en la base de datos SQL). No agregues puntos.\n\n" +
                "Descripción del usuario: '" + descripcionFormulario + "'\n" +
                "Palabra clave final:";
        return consultarOpenAI(prompt);
    }

    // PASO 2: Decidir el ganador entre las opciones reales de la BD
    public String elegirMejorCodigo(String descripcionOriginal, List<RubroCIIU> opcionesReales) {
        StringBuilder opcionesTexto = new StringBuilder();
        for (RubroCIIU rubro : opcionesReales) {
            opcionesTexto.append("Código: ").append(rubro.getCodigo())
                         .append(" - Descripción Corta: ").append(rubro.getDescripcionCorta())
                         .append(" - Descripción Larga: ").append(rubro.getDescripcionLarga()).append("\n");
        }

        String prompt = "Un usuario describió su negocio así: '" + descripcionOriginal + "'.\n" +
                "Aquí tienes los ÚNICOS rubros válidos disponibles en nuestra base de datos oficial:\n" +
                opcionesTexto.toString() + "\n" +
                "¿Cuál es el código exacto de 6 dígitos que mejor encaja con la descripción del usuario? " +
                "Devuelve SOLAMENTE el número de 6 dígitos, nada más.";
        
        return consultarOpenAI(prompt);
    }

    // PASO 3: Analizar estadísticas crudas y generar un informe ejecutivo
    public String analizarEstadisticas(String rubro, List<Map<String, Object>> estadisticas) {
        if (estadisticas.isEmpty()) return "No hay datos suficientes para analizar.";
        
        // Convertimos la tabla de datos a un texto dinámico.
        // Ahora lee TODAS las columnas que traiga el SQL, sin importar cuántas sean.
        StringBuilder datosTexto = new StringBuilder();
        for (Map<String, Object> fila : estadisticas) {
            datosTexto.append("Año ").append(fila.get("anio")).append(": ");
            
            fila.forEach((columna, valor) -> {
                if (!columna.equalsIgnoreCase("anio")) {
                    // Reemplaza guiones bajos por espacios para que la IA lea mejor (ej: indice_incidencia -> indice incidencia)
                    String nombreColumna = columna.replace("_", " "); 
                    datosTexto.append("[").append(nombreColumna).append(": ").append(valor).append("] ");
                }
            });
            datosTexto.append("\n");
        }
        
        String prompt = "Actúa como un Senior Data Analyst reportando a la Alta Gerencia sobre Seguridad Ocupacional.\n" +
                "A continuación tienes el historial estadístico multidimensional del rubro: '" + rubro + "'.\n\n" +
                "DATOS HISTÓRICOS:\n" + datosTexto.toString() + "\n\n" +
                "INSTRUCCIONES ESTRICTAS PARA EL REPORTE EJECUTIVO:\n" +
                "Tu objetivo es explicarle a la gerencia la situación general de un vistazo (en términos muy claros, directos y 'digeridos') para facilitar la toma de decisiones.\n\n" +
                "REGLA DE ORO: ESTÁ ABSOLUTAMENTE PROHIBIDO listar los datos año por año o hacer un recuento numérico. Debes procesar la información internamente y entregar ÚNICAMENTE conclusiones de alto nivel.\n\n" +
                "Estructura tu respuesta en 3 bloques cortos y precisos:\n" +
                "1. La Foto General: ¿Estamos mejor, peor o estables? Resume la tendencia histórica y el nivel de riesgo mas o menos 10 líneas.\n" +
                "2. Hallazgos Críticos: Menciona únicamente si hay alguna correlación preocupante (ej. bajan los accidentes pero suben las muertes) o algún pico anómalo que la gerencia deba saber.\n" +
                "3. Plan de Acción: Da 2 directivas de prevención o modernización estratégicas muy al grano.\n\n" +
                "Usa un tono ejecutivo, persuasivo y seguro. Utiliza viñetas cortas y texto en negrita para resaltar los conceptos clave. No uses tablas ni gráficos ASCII.\n" + 
                "No utilices formato Markdown. No uses asteriscos ni numerales. Separa los párrafos únicamente con saltos de línea dobles.";
                
        return consultarOpenAI(prompt);
    }
}