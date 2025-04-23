# Inventario de Botones - PhotoMap

## Introducción
Este documento contiene un inventario exhaustivo de los diferentes tipos de botones utilizados en el proyecto PhotoMap. Se analizan sus estilos, comportamientos y aplicaciones en la interfaz de usuario.

Los botones se clasifican según su tipo, estilo y propósito. Para cada grupo, se detallan:
- Apariencia visual (color de texto, fondo y borde)
- Comportamiento en estados normal, hover y activo
- Ubicación y contexto de uso en la aplicación
- Variantes y modificadores

## Paleta de Colores

El proyecto utiliza una paleta de colores dinámica basada en temas. Las variables de color principales son:

| Variable     | Descripción                              | Ejemplo (tema Milotic) |
|--------------|------------------------------------------|----------------------|
| `--primary`  | Color principal de la aplicación         | `#2b2a2c`            |
| `--secondary`| Color secundario / de acento             | `#da2f37`            |
| `--info`     | Color informativo / destacado            | `#eaa845`            |
| `--success`  | Color para acciones exitosas             | `#20a166`            |
| `--warning`  | Color para advertencias                  | `#ddcc20`            |
| `--danger`   | Color para errores/acciones destructivas | `#e92f10`            |
| `--light`    | Color claro para fondos/contraste        | `#ece7d7`            |
| `--dark`     | Color oscuro para texto/contraste        | `#111219`            |

## 1. Botones Principales (Primary)

### Botón Principal Sólido (btn-primary)

**Descripción:** Botón principal para acciones primarias o llamadas a la acción destacadas.

**Apariencia:**
- **Normal:** 
  - Fondo: `var(--primary)` (#2b2a2c en tema Milotic)
  - Texto: Blanco (#FFFFFF)
  - Borde: `var(--primary)`
  
- **Hover:** 
  - Fondo: `var(--btn-primary-hover)` (variación más clara del primary)
  - Transformación: scale(1.03)
  - Sombra: Ligeramente aumentada
  
- **Activo/Presionado:** 
  - Transformación: scale(0.98)

**Uso:** 
- Botón de inicio de sesión
- Acciones principales como "Ver", "Guardar"
- Creación de nuevos elementos
- Envío de formularios

**Ejemplos de código:**
```jsx
<Button variant="primary">Iniciar Sesión</Button>
<Button variant="primary" size="lg">Crear Mapa</Button>
```

**Ubicaciones comunes:**
- Página de login
- Formularios de creación
- Páginas principales como Gallery y My Maps

### Botón Principal Outline (btn-outline-primary)

**Descripción:** Variante de contorno del botón principal, para acciones importantes pero secundarias.

**Apariencia:**
- **Normal:** 
  - Fondo: Transparente
  - Texto: `var(--btn-primary-bg)` (igual a primary)
  - Borde: `var(--btn-primary-bg)` (1px)
  
- **Hover:** 
  - Fondo: `var(--btn-primary-bg)`
  - Texto: Blanco
  - Transformación: scale(1.03)
  
- **Activo/Presionado:** 
  - Transformación: scale(0.98)

**Uso:** 
- Acciones secundarias 
- Navegación a otras secciones
- Alternativas menos destacadas

**Ejemplos de código:**
```jsx
<Button variant="outline-primary">Ver Perfil</Button>
<Button as={Link} to="/gallery" variant="outline-primary">{t('gallery.button')}</Button>
```

**Ubicaciones comunes:**
- Dashboard
- Páginas de detalle
- Como alternativa en modales

## 2. Botones de Éxito (Success)

### Botón de Éxito Sólido (btn-success)

**Descripción:** Botón para acciones positivas o de confirmación.

**Apariencia:**
- **Normal:** 
  - Fondo: `var(--success)` (#20a166 en tema Milotic)
  - Texto: `var(--btn-success-text)` (blanco o negro dependiendo del contraste)
  - Borde: `var(--success)`
  
- **Hover:** 
  - Sombra: Aumentada
  - Transformación: scale(1.03)
  
- **Activo/Presionado:** 
  - Transformación: scale(0.98)

**Uso:** 
- Confirmar acciones
- Completar procesos
- Crear nuevos elementos
- Acciones positivas

**Ejemplos de código:**
```jsx
<Button variant="success" size="lg" className="create-map-btn">
  <i className="bi bi-plus-lg me-2"></i> {t('common:mymaps.create')}
</Button>
```

**Ubicaciones comunes:**
- Página MyMaps para crear nuevos mapas
- Confirmación en modales
- Acciones de guardar cambios

### Botón de Éxito Outline (btn-outline-success)

**Descripción:** Variante de contorno del botón de éxito.

**Apariencia:**
- **Normal:** 
  - Fondo: Transparente
  - Texto: `var(--btn-success-bg)` (igual a success)
  - Borde: `var(--btn-success-bg)` (1px)
  
- **Hover:** 
  - Fondo: `var(--btn-success-bg)`
  - Texto: `var(--btn-success-text)`
  - Transformación: scale(1.03)

**Uso:** 
- Acciones positivas secundarias
- Alternativas menos destacadas para acciones de éxito

**Ubicaciones comunes:**
- Formularios
- Filtros
- Opciones de configuración

## 3. Botones de Peligro (Danger)

### Botón de Peligro Sólido (btn-danger)

**Descripción:** Botón para acciones destructivas o irreversibles.

**Apariencia:**
- **Normal:** 
  - Fondo: `var(--danger)` (#e92f10 en tema Milotic)
  - Texto: `var(--btn-danger-text)` (blanco o negro dependiendo del contraste)
  - Borde: `var(--danger)`
  
- **Hover:** 
  - Sombra: Aumentada
  - Transformación: scale(1.03)
  
- **Activo/Presionado:** 
  - Transformación: scale(0.98)

**Uso:** 
- Eliminar elementos
- Cancelar procesos críticos
- Acciones irreversibles

**Ejemplos de código:**
```jsx
<Button variant="danger" onClick={handleDeletePhoto}>
  {t('photo:actions.delete')}
</Button>
```

**Ubicaciones comunes:**
- Modales de confirmación para eliminar
- Acciones de eliminación en listados
- Botones de cancelación de operaciones críticas

### Botón de Peligro Outline (btn-outline-danger)

**Descripción:** Variante de contorno del botón de peligro.

**Apariencia:**
- **Normal:** 
  - Fondo: Transparente
  - Texto: `var(--btn-danger-bg)` (igual a danger)
  - Borde: `var(--btn-danger-bg)` (1px)
  
- **Hover:** 
  - Fondo: `var(--btn-danger-bg)`
  - Texto: `var(--btn-danger-text)`
  - Transformación: scale(1.03)

**Uso:** 
- Acciones destructivas secundarias
- Opciones menos agresivas de eliminación

**Ejemplos de código:**
```jsx
<Button variant="outline-danger" size="sm">
  <i className="bi bi-trash"></i>
</Button>
```

**Ubicaciones comunes:**
- Category Manager para borrar categorías
- Opciones de borrado en tablas
- Como alternativa menos agresiva para acciones destructivas

## 4. Botones Secundarios (Secondary)

**Descripción:** Botones para acciones auxiliares o alternativas.

**Apariencia:**
- **Normal:** 
  - Fondo: `var(--secondary)` en versión transparente
  - Texto: `var(--dark)`
  - Borde: Color secundario atenuado
  
- **Hover:** 
  - Sombra: Ligeramente aumentada
  - Transformación: scale(1.03)
  
- **Activo/Presionado:** 
  - Transformación: scale(0.98)

**Uso:** 
- Cancelación de diálogos
- Acciones alternativas
- Opciones secundarias

**Ejemplos de código:**
```jsx
<Button variant="secondary" onClick={() => setShowModal(false)}>
  {t('common:buttons.cancel')}
</Button>
```

**Ubicaciones comunes:**
- Modales (opción de cerrar/cancelar)
- Junto a botones primarios como opción alternativa
- Acciones secundarias en interfaces de administración

## 5. Botones de Acción en Mapas y Tarjetas

### Botones de Acción (action-btn)

**Descripción:** Botones pequeños para acciones específicas en tarjetas o listas.

**Apariencia:**
- **Normal:** 
  - Fondo: `var(--light)` (light con opacidad)
  - Texto/Icono: Variable según acción (primary, success, danger)
  - Borde: None
  - Forma: Cuadrados o círculos pequeños
  
- **Hover:** 
  - Sombra: Aumentada
  - Transformación: translateY(-2px)
  - Color de fondo: Ligeramente más intenso

**Variantes:**
- **share-btn:** Para compartir (azul claro al hover)
- **edit-btn:** Para editar (verde claro al hover)
- **delete-btn:** Para eliminar (rojo claro al hover)

**Uso:** 
- Acciones rápidas en tarjetas de mapas
- Operaciones en elementos listados
- Iconos accionables

**Ejemplos de código:**
```jsx
<Button variant="light" className="action-btn share-btn" onClick={() => onShare(map)}>
  <i className="bi bi-share"></i>
</Button>
```

**Ubicaciones comunes:**
- Tarjetas en MyMaps
- Listados de elementos
- Interfaces de administración

### Botón de Vista de Mapa (view-map-btn)

**Descripción:** Botón destacado para ver un mapa específico.

**Apariencia:**
- **Normal:** 
  - Fondo: `var(--primary)`
  - Texto: Blanco
  - Borde: None
  - Border-radius: 8px
  
- **Hover:** 
  - Sombra: Aumentada
  - Transformación: translateY(-2px)

**Uso:** 
- Acceso principal a la vista de un mapa
- Acción destacada en tarjetas de mapas

**Ubicaciones comunes:**
- Tarjetas en MyMaps
- Listado de mapas públicos

## 6. Botones de Icono y Circulares

### Theme & Language Buttons

**Descripción:** Botones circulares para selección de tema e idioma.

**Apariencia:**
- **Normal:** 
  - Fondo: Variable (según tema/idioma)
  - Texto/Icono: Emoji o icono representativo
  - Borde: None o 3px solid var(--info) si está seleccionado
  - Forma: Circular (border-radius: 50%)
  - Tamaño: 32px x 32px
  - Opacidad: 0.7 si no está seleccionado
  
- **Hover:** 
  - Opacidad: 1
  
- **Seleccionado:**
  - Borde: 3px solid var(--info)
  - Opacidad: 1

**Uso:** 
- Selección de tema de la aplicación
- Cambio de idioma

**Ejemplos de código:**
```jsx
<button
  key={themeKey}
  onClick={() => setTheme(themeKey)}
  className={`btn btn-sm p-1`}
  style={{
    backgroundColor: THEMES[themeKey].colors.light,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: theme === themeKey ? '3px solid var(--info)' : 'none',
    borderRadius: '50%',
    // otros estilos...
  }}
  title={THEMES[themeKey].name}
>
  <span style={{ paddingTop: '3px' }}>{THEMES[themeKey].icon}</span>
</button>
```

**Ubicaciones comunes:**
- Sidebar (expandido y colapsado)
- Menús de configuración

### Icon Buttons

**Descripción:** Botones que contienen solo un icono para acciones específicas.

**Apariencia:**
- **Normal:** 
  - Fondo: A menudo transparente o light
  - Texto/Icono: Color variable según función
  - Borde: Mínimo o ninguno
  
- **Hover:** 
  - Sombra: Ligeramente aumentada
  - Opacidad: Aumentada o color más intenso

**Uso:** 
- Acciones compactas en interfaces
- Funcionalidad en barras de herramientas
- Navegación en vistas pequeñas

**Ubicaciones comunes:**
- Barras de herramientas en editores
- Controles de navegación
- Acciones rápidas en encabezados

## 7. Botones de Navegación y Toggle

**Descripción:** Botones específicos para expandir/colapsar o navegar entre secciones.

**Apariencia:**
- **Normal:** 
  - Fondo: A menudo transparente
  - Texto/Icono: Generalmente flechas o iconos de chevron
  - Borde: Mínimo o border-0
  
- **Hover:** 
  - Color: Más intenso
  - A veces con transformaciones suaves

**Ejemplos de código:**
```jsx
<Button
  variant="outline-light"
  size="sm"
  className="ms-auto p-1 border-0 d-flex align-items-center justify-content-center"
  onClick={toggleSidebar}
  style={{ width: '28px', height: '28px' }}
>
  ◀
</Button>
```

**Ubicaciones comunes:**
- Sidebar (botón de colapso/expansión)
- Encabezados de secciones plegables
- Controles de navegación en carruseles o galerías

## 8. Botones de Estado

**Descripción:** Botones que reflejan estados y pueden o no ser accionables.

**Apariencia:**
- **Normal (Activo):** 
  - Similar a btn-primary o btn-success
  
- **Normal (Inactivo/Deshabilitado):** 
  - Opacidad reducida (0.65)
  - Cursor: not-allowed
  - A menudo con un estilo grisáceo

**Uso:** 
- Indicadores de estado que pueden accionarse
- Botones que dependen del contexto para estar activos

**Ubicaciones comunes:**
- Filtros activados/desactivados
- Opciones en configuraciones
- Funcionalidades dependientes de permisos

## Notas de Implementación

1. **Consistencia en interacciones:**
   - Todos los botones tienen efectos hover y active consistentes
   - Las transformaciones de escala son uniformes (1.03 para hover, 0.98 para active)

2. **Accesibilidad:**
   - Se usa contraste adecuado entre texto y fondo
   - Los botones deshabilitados mantienen una apariencia distintiva
   - Se incluyen tooltips para botones de solo icono

3. **Responsividad:**
   - En pantallas pequeñas, algunos botones de texto se convierten en botones de icono
   - Se utilizan clases "btn-sm" en interfaces densas
   - Los botones mantienen un tamaño mínimo táctil adecuado
