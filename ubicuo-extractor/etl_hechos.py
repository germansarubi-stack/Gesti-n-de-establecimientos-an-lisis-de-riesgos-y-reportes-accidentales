import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
import warnings

warnings.filterwarnings('ignore', category=UserWarning, module='openpyxl')

print("Iniciando Súper ETL: Fase de Carga de Hechos (Fact Table)...")

# 1. Conexión a PostgreSQL (cambiar por variables de entorno en producción)
url_object = URL.create(
    "postgresql",
    username=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),  
    host=os.getenv("POSTGRES_HOST"),
    port=int(os.getenv("POSTGRES_PORT")),
    database=os.getenv("POSTGRES_DB"),
)
engine = create_engine(url_object)

# Carpeta donde están todos tus excels 
carpeta_datos = './data_sample/'
df_hechos_consolidado = []

# Mapeo de Cuadros a Sectores para los archivos desglosados
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

# 2. Orquestador: Escaneo de la carpeta
for archivo in os.listdir(carpeta_datos):
    if not archivo.endswith('.xlsx'):
        continue
        
    ruta_completa = os.path.join(carpeta_datos, archivo)
    
    # Archivos desglosados por Provincia y Sector (ej: 2-Indice global-según-jurisdiccion...)
    if archivo.startswith('2-Indice global-según-jurisdiccion'):
        print(f"Procesando matriz Jurisdicción/Sector: {archivo}")
        xls = pd.ExcelFile(ruta_completa)
        
        for hoja in xls.sheet_names:
            # Limpiamos el nombre de la hoja para que coincida con el mapa (ej: "C 1 " -> "C 1")
            hoja_limpia = hoja.strip()
            if hoja_limpia in mapa_cuadros:
                sector_letra = mapa_cuadros[hoja_limpia]
                try:
                    df = pd.read_excel(ruta_completa, sheet_name=hoja, skiprows=4)
                    
                    # Renombrar columna principal si se llama Jurisdicción o Provincia
                    col_jur = [c for c in df.columns if 'Jurisdicción' in str(c) or 'Provincia' in str(c)]
                    if not col_jur: continue
                    df = df.rename(columns={col_jur[0]: 'provincia'})
                    
                    # Limpiar provincias
                    df['provincia'] = df['provincia'].astype(str).str.replace('*', '', regex=False).str.strip()
                    df = df[df['provincia'].isin(provincias_validas)]
                    
                    # Identificar qué años tiene este Excel en particular (descartando columnas de texto)
                    anios_columnas = [c for c in df.columns if isinstance(c, int) or (isinstance(c, str) and c.isdigit())]
                    
                    # Unpivot (Melt)
                    df_melted = df.melt(id_vars=['provincia'], value_vars=anios_columnas, 
                                        var_name='anio', value_name='indice_incidencia')
                    
                    df_melted['sector_letra'] = sector_letra
                    df_melted['indice_incidencia'] = pd.to_numeric(df_melted['indice_incidencia'], errors='coerce').fillna(0)
                    
                    df_hechos_consolidado.append(df_melted)
                except Exception as e:
                    print(f"  -> Error en hoja {hoja}: {e}")

    # Archivos Históricos Globales (Totales país por sector)
    elif archivo.startswith('Serie_historica-Indicadores_globales'):
        print(f"Procesando Totales Nacionales: {archivo}")
        try:
            # Leemos el Cuadro 4 que suele tener la Incidencia Global por Sector
            df = pd.read_excel(ruta_completa, sheet_name='Cuadro 4', skiprows=4)
            df = df.rename(columns={df.columns[0]: 'nombre_sector'})
            
            # Filtramos para que solo tome las filas que contengan nombres de sectores válidos
            df = df.dropna(subset=['nombre_sector'])
            
            anios_columnas = [c for c in df.columns if isinstance(c, int) or (isinstance(c, str) and c.isdigit())]
            
            df_melted = df.melt(id_vars=['nombre_sector'], value_vars=anios_columnas, 
                                var_name='anio', value_name='indice_incidencia')
            
            # Como es un total nacional, le asignamos 'Nacional' a la provincia
            df_melted['provincia'] = 'Nacional'
            df_melted['indice_incidencia'] = pd.to_numeric(df_melted['indice_incidencia'], errors='coerce').fillna(0)
            
            # NOTA: En un data warehouse real cruzaríamos 'nombre_sector' con la 'dim_actividad_sectores' 
            # para asignarle la letra. Por ahora lo guardamos para el MVP.
            df_hechos_consolidado.append(df_melted[['anio', 'provincia', 'indice_incidencia']])
        except Exception as e:
            print(f"  -> Error procesando globales: {e}")

# 3. Inyección en Base de Datos
if df_hechos_consolidado:
    print("Consolidando todos los archivos procesados...")
    df_final = pd.concat(df_hechos_consolidado, ignore_index=True)
    
    print(f"Inyectando {len(df_final)} registros a PostgreSQL...")
    df_final.to_sql('hechos_accidentabilidad', engine, if_exists='replace', index=False)
    
    # 4. Generación de Relaciones (Foreign Keys)
    with engine.connect() as conn:
        # Primero agregamos 'Nacional' a la dimensión geográfica si no existe para que no falle la llave foránea
        conn.execute(text("INSERT INTO dim_geografia (provincia) VALUES ('Nacional') ON CONFLICT DO NOTHING;"))
        conn.execute(text('ALTER TABLE hechos_accidentabilidad ADD FOREIGN KEY (anio) REFERENCES dim_tiempo(anio);'))
        conn.execute(text('ALTER TABLE hechos_accidentabilidad ADD FOREIGN KEY (provincia) REFERENCES dim_geografia(provincia);'))
        conn.commit()
    print("¡Súper ETL Finalizado! El Data Warehouse está listo.")
else:
    print("No se encontraron datos procesables. Revisá la carpeta 'data_sample'.")