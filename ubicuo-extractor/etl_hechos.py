import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
import warnings

warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')

print("Iniciando Súper ETL: Fase de Carga Multidimensional...")

# Configuración segura a PostgreSQL (Cambiar por variables de entorno en producción)
url_object = URL.create(
    "postgresql",
    username=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),  
    host=os.getenv("POSTGRES_HOST"),
    port=int(os.getenv("POSTGRES_PORT")),
    database=os.getenv("POSTGRES_DB"),
)
engine = create_engine(url_object)

carpeta_datos = './accidentabilidad/'
df_incidencia = []
df_mortales = []

mapa_cuadros = {
    'C 1': 'A', 'C 2': 'B', 'C 3': 'C', 'C 4': 'D', 'C 5': 'E', 
    'C 6': 'F', 'C 7': 'G', 'C 8': 'H', 'C 9': 'I', 'C 10': 'J',
    'C 11': 'K', 'C 12': 'L', 'C 13': 'M', 'C 14': 'N', 'C 15': 'O',
    'C 16': 'P', 'C 17': 'Q', 'C 18': 'R', 'C 19': 'S'
}

provincias_validas = ['C.A.B.A.', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 
                      'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 
                      'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 
                      'Santiago del Estero', 'Tierra del Fuego', 'Tucumán']

# Motor de Extracción Dinámico
def extraer_datos(ruta, nombre_metrica):
    resultados = []
    xls = pd.ExcelFile(ruta)
    for hoja in xls.sheet_names:
        hoja_limpia = hoja.strip()
        if hoja_limpia in mapa_cuadros:
            try:
                df = pd.read_excel(ruta, sheet_name=hoja, skiprows=4)
                col_jur = [c for c in df.columns if 'Jurisdicción' in str(c) or 'Provincia' in str(c)]
                if not col_jur: continue
                
                df = df.rename(columns={col_jur[0]: 'provincia'})
                df['provincia'] = df['provincia'].astype(str).str.replace('*', '', regex=False).str.strip()
                df = df[df['provincia'].isin(provincias_validas)]
                
                anios = [c for c in df.columns if isinstance(c, int) or (isinstance(c, str) and c.isdigit())]
                df_melt = df.melt(id_vars=['provincia'], value_vars=anios, var_name='anio', value_name=nombre_metrica)
                df_melt['sector_letra'] = mapa_cuadros[hoja_limpia]
                
                df_melt[nombre_metrica] = pd.to_numeric(df_melt[nombre_metrica], errors='coerce').fillna(0)
                df_melt['anio'] = df_melt['anio'].astype(int)
                
                resultados.append(df_melt)
            except Exception:
                pass
    return resultados

# Escaneo de Carpeta
for archivo in os.listdir(carpeta_datos):
    if not archivo.endswith('.xlsx'): continue
    ruta_completa = os.path.join(carpeta_datos, archivo)
    
    # Archivos 2- : Traen el Índice de Incidencia
    if archivo.startswith('2-Indice global-según-jurisdiccion'):
        print(f"Extrayendo Incidencias: {archivo}")
        df_incidencia.extend(extraer_datos(ruta_completa, 'indice_incidencia'))
        
    # Archivos 4- : Traen las Muertes (Casos Mortales)
    elif archivo.startswith('4-Indice'):
        print(f"Extrayendo Casos Mortales: {archivo}")
        df_mortales.extend(extraer_datos(ruta_completa, 'casos_mortales'))

print("Fusionando dimensiones (JOIN en Python)...")
df_inc_final = pd.concat(df_incidencia, ignore_index=True) if df_incidencia else pd.DataFrame()
df_mor_final = pd.concat(df_mortales, ignore_index=True) if df_mortales else pd.DataFrame()

if not df_inc_final.empty and not df_mor_final.empty:
    # Fusionamos ambas tablas usando Provincia, Año y Sector como llaves
    df_hechos = pd.merge(df_inc_final, df_mor_final, on=['provincia', 'anio', 'sector_letra'], how='outer').fillna(0)
    
    print(f"Inyectando {len(df_hechos)} registros enriquecidos a PostgreSQL...")
    df_hechos.to_sql('hechos_accidentabilidad', engine, if_exists='replace', index=False)
    
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE hechos_accidentabilidad ADD FOREIGN KEY (anio) REFERENCES dim_tiempo(anio);'))
        conn.execute(text('ALTER TABLE hechos_accidentabilidad ADD FOREIGN KEY (provincia) REFERENCES dim_geografia(provincia);'))
        conn.execute(text('ALTER TABLE hechos_accidentabilidad ADD FOREIGN KEY (sector_letra) REFERENCES dim_actividad_sectores(sector_letra);'))
        conn.commit()
    print("¡Súper ETL Finalizado! El Data Warehouse ahora tiene MÚLTIPLES MÉTRICAS.")