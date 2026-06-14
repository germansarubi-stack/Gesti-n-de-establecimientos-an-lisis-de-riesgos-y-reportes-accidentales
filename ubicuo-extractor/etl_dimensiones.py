import os

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

print("Iniciando construcción del Esquema Estrella (Dimensiones)...")

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

# 1. Dimensión tiempo (1996 a 2022 basado en los nuevos Excels)
anios = pd.DataFrame({'anio': list(range(1996, 2023))})
anios.to_sql('dim_tiempo', engine, if_exists='replace', index=False)
print("✅ dim_tiempo creada (1996-2022).")

# 2. Dimensión geografía (Nombres oficiales limpios)
provincias = [
    'C.A.B.A.', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 
    'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
]
df_geo = pd.DataFrame({'provincia': provincias})
df_geo.to_sql('dim_geografia', engine, if_exists='replace', index=False)
print("✅ dim_geografia creada.")

# 3. Dimensión actividad (Tabla puente CIIU -> sector AFIP)
mapeo_sectores = [
    {'sector_letra': 'A', 'nombre_sector': 'Agricultura, ganadería, caza, silvicultura y pesca', 'ciiu_inicio': 11, 'ciiu_fin': 32},
    {'sector_letra': 'B', 'nombre_sector': 'Explotación de minas y canteras', 'ciiu_inicio': 51, 'ciiu_fin': 99},
    {'sector_letra': 'C', 'nombre_sector': 'Industria manufacturera', 'ciiu_inicio': 101, 'ciiu_fin': 332},
    {'sector_letra': 'D', 'nombre_sector': 'Suministro de electricidad, gas, vapor', 'ciiu_inicio': 351, 'ciiu_fin': 353},
    {'sector_letra': 'E', 'nombre_sector': 'Suministro de agua, cloacas y residuos', 'ciiu_inicio': 360, 'ciiu_fin': 390},
    {'sector_letra': 'F', 'nombre_sector': 'Construcción', 'ciiu_inicio': 410, 'ciiu_fin': 439},
    {'sector_letra': 'G', 'nombre_sector': 'Comercio al por mayor y menor', 'ciiu_inicio': 451, 'ciiu_fin': 479},
    {'sector_letra': 'H', 'nombre_sector': 'Servicio de transporte y almacenamiento', 'ciiu_inicio': 491, 'ciiu_fin': 530},
    {'sector_letra': 'I', 'nombre_sector': 'Servicios de alojamiento y comida', 'ciiu_inicio': 551, 'ciiu_fin': 562},
    {'sector_letra': 'J', 'nombre_sector': 'Información y comunicaciones', 'ciiu_inicio': 581, 'ciiu_fin': 639},
    {'sector_letra': 'K', 'nombre_sector': 'Intermediación financiera y seguros', 'ciiu_inicio': 641, 'ciiu_fin': 663},
    {'sector_letra': 'L', 'nombre_sector': 'Servicios inmobiliarios', 'ciiu_inicio': 681, 'ciiu_fin': 682},
    {'sector_letra': 'M', 'nombre_sector': 'Servicios profesionales, científicos y técnicos', 'ciiu_inicio': 691, 'ciiu_fin': 750},
    {'sector_letra': 'N', 'nombre_sector': 'Actividades administrativas y servicios de apoyo', 'ciiu_inicio': 771, 'ciiu_fin': 829},
    {'sector_letra': 'O', 'nombre_sector': 'Administración publica y defensa', 'ciiu_inicio': 841, 'ciiu_fin': 843},
    {'sector_letra': 'P', 'nombre_sector': 'Enseñanza', 'ciiu_inicio': 851, 'ciiu_fin': 855},
    {'sector_letra': 'Q', 'nombre_sector': 'Salud humana y servicios sociales', 'ciiu_inicio': 861, 'ciiu_fin': 889},
    {'sector_letra': 'R', 'nombre_sector': 'Servicios artísticos y culturales', 'ciiu_inicio': 900, 'ciiu_fin': 939},
    {'sector_letra': 'S', 'nombre_sector': 'Servicios de asociaciones y personales', 'ciiu_inicio': 941, 'ciiu_fin': 960}
]
df_sectores = pd.DataFrame(mapeo_sectores)
df_sectores.to_sql('dim_actividad_sectores', engine, if_exists='replace', index=False)
print("✅ dim_actividad_sectores creada (Tabla Puente).")

# Agregamos índices de alto rendimiento
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE dim_tiempo ADD PRIMARY KEY (anio);'))
    conn.execute(text('ALTER TABLE dim_geografia ADD PRIMARY KEY (provincia);'))
    conn.execute(text('ALTER TABLE dim_actividad_sectores ADD PRIMARY KEY (sector_letra);'))
    conn.commit()

print("¡Modelo Multidimensional base inicializado con éxito!")