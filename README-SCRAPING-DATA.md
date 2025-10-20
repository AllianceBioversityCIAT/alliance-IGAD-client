# Sistema de Almacenamiento de Web Scraping

Este sistema permite almacenar y gestionar los resultados de web scraping en la base de datos D1 de Cloudflare.

## Estructura de las Tablas

### `scraping_sources`
Almacena las fuentes/categorías de donde provienen los datos (páginas web).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único (auto-incrementable) |
| name | TEXT | Nombre de la fuente (requerido) |
| url | TEXT | URL de la fuente (opcional) |
| description | TEXT | Descripción de la fuente (opcional) |
| created_at | DATETIME | Fecha de creación |
| updated_at | DATETIME | Fecha de actualización |

### `scraped_data`
Almacena los datos JSON obtenidos del scraping.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único (auto-incrementable) |
| source_id | INTEGER | ID de la fuente (FK a scraping_sources) |
| description | TEXT | Descripción del scraping (requerido) |
| data | JSON | Datos en formato JSON (requerido) |
| created_by | INTEGER | ID del usuario que creó el registro |
| created_at | DATETIME | Fecha de creación |
| updated_at | DATETIME | Fecha de actualización |

## Migración

Para aplicar la migración y crear las tablas:

```bash
# Migración local
npx wrangler d1 migrations apply igad-db --local

# Migración remota (producción)
npx wrangler d1 migrations apply igad-db --remote
```

## Endpoints Disponibles

### 1. Crear una Fuente de Scraping

**POST** `/api/scraping-sources/create`

Crea una nueva fuente/categoría para organizar los datos de scraping.

```json
{
  "name": "FAO Publications",
  "url": "https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en",
  "description": "Publicaciones del Knowledge Hub de FAO"
}
```

**Respuesta:**
```json
{
  "success": true,
  "id": 1,
  "message": "Scraping source created successfully"
}
```

### 2. Listar Fuentes de Scraping

**GET** `/api/scraping-sources/list`

Obtiene todas las fuentes de scraping con el conteo de datos almacenados.

**Respuesta:**
```json
{
  "success": true,
  "sources": [
    {
      "id": 1,
      "name": "FAO Publications",
      "url": "https://www.fao.org/...",
      "description": "Publicaciones del Knowledge Hub de FAO",
      "created_at": "2025-10-20T10:00:00.000Z",
      "updated_at": "2025-10-20T10:00:00.000Z",
      "data_count": 5
    }
  ]
}
```

### 3. Guardar Datos de Scraping

**POST** `/api/scraped-data/save`

Guarda los resultados de un scraping.

```json
{
  "source_id": 1,
  "description": "Scraping de publicaciones FAO - Octubre 2025",
  "data": {
    "url": "https://www.fao.org/...",
    "publications": [
      {
        "title": "Título de publicación",
        "url": "/link",
        "date": "01 Oct 2025",
        "description": "Descripción...",
        "image": "/imagen.jpg"
      }
    ],
    "count": 50
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "id": 1,
  "message": "Scraped data saved successfully"
}
```

### 4. Obtener Datos por ID

**GET** `/api/scraped-data/[id]`

Obtiene un registro específico de datos de scraping.

**Ejemplo:** `/api/scraped-data/1`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "source_id": 1,
    "description": "Scraping de publicaciones FAO - Octubre 2025",
    "data": {
      "url": "https://...",
      "publications": [...],
      "count": 50
    },
    "created_at": "2025-10-20T10:00:00.000Z",
    "updated_at": "2025-10-20T10:00:00.000Z",
    "source_name": "FAO Publications",
    "source_url": "https://...",
    "created_by_name": "Usuario",
    "created_by_email": "usuario@example.com"
  }
}
```

### 5. Obtener Datos por Fuente/Categoría

**GET** `/api/scraped-data/by-source/[sourceId]`

Obtiene todos los datos de scraping asociados a una fuente específica.

**Ejemplo:** `/api/scraped-data/by-source/1`

**Respuesta:**
```json
{
  "success": true,
  "source": {
    "id": 1,
    "name": "FAO Publications",
    "url": "https://...",
    "description": "Publicaciones del Knowledge Hub de FAO"
  },
  "count": 3,
  "data": [
    {
      "id": 3,
      "description": "Scraping más reciente",
      "data": {...},
      "created_at": "2025-10-20T12:00:00.000Z",
      "created_by_name": "Usuario",
      "created_by_email": "usuario@example.com"
    },
    {
      "id": 2,
      "description": "Scraping anterior",
      "data": {...},
      "created_at": "2025-10-20T11:00:00.000Z",
      "created_by_name": "Usuario",
      "created_by_email": "usuario@example.com"
    }
  ]
}
```

## Ejemplo de Uso Completo

### 1. Crear una fuente
```bash
curl -X POST https://tu-dominio/api/scraping-sources/create \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=your-session-id" \
  -d '{
    "name": "FAO Publications",
    "url": "https://www.fao.org/pastoralist-knowledge-hub/knowledge-repository/publications/en",
    "description": "Publicaciones del Knowledge Hub de FAO"
  }'
```

### 2. Hacer scraping y guardar resultados
```bash
# Primero hacer el scraping
curl "https://tu-dominio/api/scrape-publications?url=..." \
  -H "Cookie: session_id=your-session-id"

# Luego guardar los resultados
curl -X POST https://tu-dominio/api/scraped-data/save \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=your-session-id" \
  -d '{
    "source_id": 1,
    "description": "Scraping de publicaciones - Octubre 2025",
    "data": { ... resultados del scraping ... }
  }'
```

### 3. Consultar resultados
```bash
# Por ID específico
curl "https://tu-dominio/api/scraped-data/1" \
  -H "Cookie: session_id=your-session-id"

# Por fuente/categoría
curl "https://tu-dominio/api/scraped-data/by-source/1" \
  -H "Cookie: session_id=your-session-id"
```

## Autenticación

Todos los endpoints requieren autenticación mediante una sesión válida. La cookie `session_id` debe estar presente en todas las peticiones.

## Notas

- Los datos JSON se almacenan como texto y se parsean automáticamente al recuperarlos
- Las fuentes se pueden usar para categorizar diferentes tipos de scraping
- Los datos están ordenados por fecha de creación (más recientes primero)
- Las relaciones entre tablas están protegidas con ON DELETE CASCADE

