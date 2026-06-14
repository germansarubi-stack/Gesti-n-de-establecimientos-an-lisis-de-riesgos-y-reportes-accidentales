package com.ubicuo.api_estadisticas.repository;

import com.ubicuo.api_estadisticas.model.RubroCIIU;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RubroCIIURepository extends JpaRepository<RubroCIIU, String> {
    
    // nombrar el método así, Spring autogenera la consulta SQL por detrás:
    // SELECT * FROM RubrosCIIU WHERE DescripcionCorta ILIKE '%termino%'
    List<RubroCIIU> findByDescripcionCortaContainingIgnoreCase(String termino);

    // Búsqueda amplia que barre ambas columnas (Corta O Larga)
    List<RubroCIIU> findByDescripcionCortaContainingIgnoreCaseOrDescripcionLargaContainingIgnoreCase(String terminoCorta, String terminoLarga);
}