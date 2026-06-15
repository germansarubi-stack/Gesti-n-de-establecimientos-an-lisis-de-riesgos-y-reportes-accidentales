# 🎨 Guía de Uso - Componentes CSS Personalizados

## Utilidades Tailwind Personalizadas

### 1. Botones

#### Botón Primario (Amarillo)
```html
<button class="btn-primary">Guardar</button>
<button class="btn-primary px-8">Botón Grande</button>
<button class="btn-primary text-sm">Botón Pequeño</button>
```

#### Botón Secundario (Celeste)
```html
<button class="btn-secondary">Cancelar</button>
```

#### Botón Acento (Violeta)
```html
<button class="btn-accent">Enviar</button>
```

#### Botón Ghost (Transparente)
```html
<button class="btn-ghost">Link Like</button>
```

#### Botón Outline
```html
<button class="btn-outline">Bordes</button>
```

---

### 2. Tarjetas

#### Tarjeta Simple
```html
<div class="card">
  <h3>Título</h3>
  <p>Contenido de la tarjeta</p>
</div>
```

#### Tarjeta con Efecto Hover
```html
<div class="card-hover cursor-pointer">
  <h3>Interactiva</h3>
  <p>Se eleva al pasar el mouse</p>
</div>
```

#### Tarjeta con Efecto Vidrio
```html
<div class="glass-effect p-6 rounded-xl">
  <p>Efecto de vidrio esmerilado</p>
</div>
```

---

### 3. Formularios

#### Campo de Entrada
```html
<div class="space-y-2">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" placeholder="usuario@ejemplo.com">
</div>
```

#### Select Mejorado
```html
<div class="space-y-2">
  <label class="form-label">Provincia</label>
  <select class="form-input">
    <option>Seleccionar...</option>
    <option>Buenos Aires</option>
    <option>Córdoba</option>
  </select>
</div>
```

#### Textarea
```html
<div class="space-y-2">
  <label class="form-label">Descripción</label>
  <textarea class="form-input resize-none" rows="4"></textarea>
</div>
```

---

### 4. Insignias

#### Insignia Primaria
```html
<span class="badge-primary">Activo</span>
```

#### Insignia Secundaria
```html
<span class="badge-secondary">En Revisión</span>
```

#### Insignia Acento
```html
<span class="badge-accent">Prioritario</span>
```

---

### 5. Efectos Visuales

#### Gradiente Primario
```html
<div class="gradient-primary text-white p-6">
  Fondo con gradiente amarillo
</div>
```

#### Gradiente Secundario
```html
<div class="gradient-secondary text-white p-6">
  Fondo con gradiente celeste
</div>
```

#### Gradiente Acento
```html
<div class="gradient-accent text-white p-6">
  Fondo con gradiente violeta
</div>
```

#### Texto con Gradiente
```html
<h1 class="text-gradient-primary text-4xl font-bold">
  Título con Gradiente
</h1>
```

---

### 6. Animaciones

#### Desvanecimiento Arriba
```html
<div class="animate-fade-in-up">Contenido que aparece de abajo hacia arriba</div>
```

#### Desvanecimiento Abajo
```html
<div class="animate-fade-in-down">Contenido que aparece de arriba hacia abajo</div>
```

#### Escala de Entrada
```html
<div class="animate-scale-in">Contenido que crece</div>
```

#### Deslizamiento
```html
<div class="animate-slide-up">Desliza arriba</div>
<div class="animate-slide-down">Desliza abajo</div>
<div class="animate-slide-left">Desliza izquierda</div>
<div class="animate-slide-right">Desliza derecha</div>
```

---

### 7. Contenedores

#### Contenedor Seguro (Con Padding Responsivo)
```html
<div class="container-safe">
  <h1>Contenido centrado y responsivo</h1>
  <p>Ancho máximo de 1280px</p>
</div>
```

#### Sección con Encabezado
```html
<section class="container-safe py-8">
  <h2 class="section-header mb-6">Título Principal</h2>
  <p class="section-subtitle">Subtítulo descriptivo</p>
  <!-- Contenido -->
</section>
```

---

## Paleta de Colores en Tailwind

### Primario (Amarillo)
```html
<!-- Fondos -->
<div class="bg-primary-50">Muy claro</div>
<div class="bg-primary-500">Principal</div>
<div class="bg-primary-900">Muy oscuro</div>

<!-- Texto -->
<p class="text-primary-500">Texto amarillo</p>
<p class="text-primary-700">Texto más oscuro</p>

<!-- Bordes -->
<div class="border-2 border-primary-500">Borde amarillo</div>
```

### Secundario (Celeste)
```html
<div class="bg-secondary-500">Fondo celeste</div>
<p class="text-secondary-600">Texto celeste oscuro</p>
```

### Acento (Violeta)
```html
<div class="bg-accent-500">Fondo violeta</div>
<p class="text-accent-700">Texto violeta oscuro</p>
```

### Neutros
```html
<div class="bg-neutral-50">Muy claro</div>
<div class="bg-neutral-900">Muy oscuro</div>
```

---

## Ejemplos Completos

### Formulario Completo
```html
<div class="card p-8">
  <h2 class="section-header mb-6">Nuevo Establecimiento</h2>
  
  <form class="space-y-6">
    <!-- Campo 1 -->
    <div class="space-y-2">
      <label class="form-label">Nombre</label>
      <input type="text" class="form-input" placeholder="Nombre...">
    </div>

    <!-- Campo 2 -->
    <div class="space-y-2">
      <label class="form-label">Rubro</label>
      <select class="form-input">
        <option>Seleccionar rubro</option>
      </select>
    </div>

    <!-- Botones -->
    <div class="flex gap-4 justify-end pt-4 border-t">
      <button type="button" class="btn-outline">Limpiar</button>
      <button type="submit" class="btn-primary">Guardar</button>
    </div>
  </form>
</div>
```

### Grid de Tarjetas
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="card-hover">
    <h3 class="text-lg font-bold mb-3">Tarjeta 1</h3>
    <p>Contenido...</p>
    <button class="btn-secondary mt-4">Ver detalles</button>
  </div>
  
  <div class="card-hover">
    <h3 class="text-lg font-bold mb-3">Tarjeta 2</h3>
    <p>Contenido...</p>
    <button class="btn-secondary mt-4">Ver detalles</button>
  </div>
</div>
```

### Modal / Diálogo
```html
<div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
  <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
    <!-- Encabezado -->
    <div class="gradient-primary text-white px-6 py-4">
      <h3 class="text-xl font-bold">Título del Modal</h3>
    </div>
    
    <!-- Contenido -->
    <div class="p-6">
      <p>Contenido del modal...</p>
    </div>
    
    <!-- Pie -->
    <div class="bg-neutral-50 px-6 py-4 flex justify-end gap-3 border-t">
      <button class="btn-outline">Cancelar</button>
      <button class="btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

---

## Responsive Tailwind

### Breakpoints
- `sm:` - 640px (móviles grandes)
- `md:` - 768px (tablets)
- `lg:` - 1024px (desktops)
- `xl:` - 1280px (desktops grandes)
- `2xl:` - 1536px (pantallas ultra-anchas)

### Ejemplo Responsivo
```html
<!-- Texto responsive -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">Título</h1>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Tarjetas -->
</div>

<!-- Padding responsive -->
<div class="p-4 md:p-6 lg:p-8">Contenido</div>

<!-- Display responsive -->
<div class="hidden md:block">Solo en tablets y arriba</div>
```

---

## Tips y Trucos

### 1. Combinar clases
```html
<!-- Válido: combinar utilidades -->
<div class="bg-primary-50 border-2 border-primary-500 rounded-xl p-6">
  Contenido
</div>
```

### 2. Modificadores Hover
```html
<button class="bg-primary-500 hover:bg-primary-600 active:bg-primary-700">
  Botón interactivo
</button>
```

### 3. Espaciado consistente
```html
<!-- Usar space-y para espaciado vertical -->
<div class="space-y-4">
  <p>Párrafo 1</p>
  <p>Párrafo 2</p>
  <p>Párrafo 3</p>
</div>
```

### 4. Centrar contenido
```html
<!-- Centrado horizontal y vertical -->
<div class="flex items-center justify-center min-h-screen">
  Contenido centrado
</div>
```

### 5. Grid automático
```html
<!-- Grid que se adapta automáticamente -->
<div class="grid auto-cols-max gap-4">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>
```

---

## Documentación Completa de Tailwind CSS

Para más información, visita: **https://tailwindcss.com/docs**

Para ngx-toastr: **https://scttcper.github.io/ngx-toastr/**

Para SweetAlert2: **https://sweetalert2.github.io/**
