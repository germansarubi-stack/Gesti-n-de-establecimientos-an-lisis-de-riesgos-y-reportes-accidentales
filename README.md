# 🏭 UBICUO - Sistema Inteligente de Gestión de Higiene y Seguridad Laboral

Ubicuo es una plataforma integral (Full-Stack) diseñada para modernizar la gestión de establecimientos, análisis de riesgos y reportes accidentales. El sistema integra Inteligencia Artificial para asistir a los profesionales en la toma de decisiones basada en datos históricos oficiales de accidentabilidad (SRT).

## 🚀 Arquitectura del Proyecto (Monorepo)

Este proyecto está dividido en cuatro módulos principales:

* **`ubicuo-front/` (Frontend):** Aplicación web interactiva desarrollada en **Angular 18 (Standalone)**. Incluye consumo de APIs, enrutamiento, guardias de autenticación y gráficos dinámicos con Chart.js.
* **`ubicuo-backend-java/` (Backend):** API REST robusta construida con **Java y Spring Boot**. Orquesta la lógica de negocio, se conecta a PostgreSQL mediante Spring JDBC y gestiona las peticiones asíncronas a modelos LLM.
* **`ubicuo-extractor/` (Data Engineering / ETL):** Scripts de extracción desarrollados en **Python (Pandas, SQLAlchemy)** encargados de procesar el histórico de la SRT (1996-2022) y construir un **Data Warehouse (Esquema en Estrella)** en la base de datos para habilitar análisis multidimensional.
* **`ubicuo-infra/` (Infraestructura):** Configuración de contenedores con **Docker Compose** para desplegar de forma ágil la base de datos relacional PostgreSQL.

## ✨ Características Principales del MVP

1.  **Asistente IA para Clasificación CIIU:** Mediante una arquitectura RAG (Retrieval-Augmented Generation), el backend utiliza OpenAI para analizar descripciones informales de los establecimientos y sugerir el código CIIU oficial exacto.
2.  **Análisis Estadístico Automatizado:** Generación de gráficos históricos cruzando el rubro del establecimiento con índices de incidencia y casos mortales a nivel nacional y provincial.
3.  **Resúmenes Ejecutivos Sintéticos:** La IA lee los datos numéricos crudos de la tabla de hechos y redacta conclusiones profesionales sobre tendencias de riesgo.
4.  **Caché Local:** Optimización de recursos (tokens de API) almacenando los reportes estadísticos generados en el `localStorage` del navegador.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** Angular 18, TypeScript, HTML5/CSS3, Chart.js.
* **Backend:** Java, Spring Boot, Maven, Spring Web, JDBC.
* **Datos y ETL:** Python 3, Pandas, SQLAlchemy.
* **Base de Datos:** PostgreSQL.
* **Infraestructura & DevOps:** Docker, Docker Compose.
* **IA:** OpenAI API.

## ⚙️ Instalación y Despliegue Local

1.  **Levantar Infraestructura:**
    ```bash
    cd ubicuo-infra
    # Crear .env local a partir del ejemplo y completar credenciales antes de arrancar
    # copy .env.example .env   (Windows)
    # cp .env.example .env     (Linux/macOS)
    docker-compose up -d
    ```

2.  **Cargar Catálogo Oficial CIIU (AFIP):**
    Para que el motor de Inteligencia Artificial (RAG) funcione, es necesario poblar la tabla de rubros. Ubique el archivo del nomenclador oficial en la carpeta de datos correspondiente y ejecute el script de carga para llenar la tabla `RubrosCIIU`.

3.  **Ejecutar Súper ETL (Población del Data Warehouse):**
    Asegúrese de crear `ubicuo-extractor/.env` a partir de `ubicuo-extractor/.env.example` y de completar las variables de conexión a PostgreSQL. Ejecute los scripts de Ingeniería de Datos en orden estricto para construir el esquema multidimensional:
    ```bash
    cd ubicuo-extractor
    pip install -r requirements.txt
    python etl_dimensiones.py
    python etl_hechos.py
    ```

4.  **Iniciar Backend Java:**
    ```bash
    cd ubicuo-backend-java
    ./mvnw spring-boot:run
    ```
    *(Nota: Es necesario configurar la variable de entorno `OPENAI_API_KEY` y las credenciales de base de datos en `src/main/resources/application.properties` basándose en el archivo `.example` provisto).*

5.  **Iniciar Frontend Angular:**
    ```bash
    cd ubicuo-front
    npm install
    ng serve -o
    ```