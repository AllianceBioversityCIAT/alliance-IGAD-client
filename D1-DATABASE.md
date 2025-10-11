# 🗄️ D1 Database - Guía Completa

Esta guía te ayudará a trabajar con **Cloudflare D1**, la base de datos SQL serverless del proyecto.

## 📋 Tabla de Contenidos
- [¿Qué es D1?](#qué-es-d1)
- [Configuración Inicial](#configuración-inicial)
- [Comandos de Migración](#comandos-de-migración)
- [Comandos Útiles](#comandos-útiles)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Uso en la Aplicación](#uso-en-la-aplicación)
- [Tips y Mejores Prácticas](#tips-y-mejores-prácticas)

---

## 🤔 ¿Qué es D1?

**Cloudflare D1** es una base de datos SQL serverless construida sobre SQLite. Características principales:

- ✅ **Serverless**: No necesitas gestionar servidores
- ✅ **SQL estándar**: Compatible con SQLite
- ✅ **Global**: Replicación automática en el edge
- ✅ **Gratis**: Generoso plan gratuito
- ✅ **Integrado**: Se conecta directamente con Workers/Pages

---

## ⚙️ Configuración Inicial

### 1. Crear una base de datos D1

```bash
# Crear nueva base de datos
wrangler d1 create mi-base-de-datos

# El comando te devolverá algo como:
# database_id = "95d444dd-04c7-4634-a6c9-866e51bbdc94"
```

### 2. Configurar en `wrangler.toml`

```toml
[[d1_databases]]
binding = "DB"                                          # Nombre que usarás en el código
database_name = "igad-db"                              # Nombre descriptivo
database_id = "95d444dd-04c7-4634-a6c9-866e51bbdc94"  # ID de tu base de datos
```

### 3. Verificar configuración

```bash
# Listar todas tus bases de datos D1
wrangler d1 list
```

---

## 🚀 Comandos de Migración

### Estructura de Archivos

Guarda tus migraciones en la carpeta `migrations/`:

```
migrations/
├── 0001_create_prompts.sql
├── 0002_add_users_table.sql
└── 0003_add_indexes.sql
```

### Ejecutar Migraciones

#### **En Producción (remoto)**
```bash
# Ejecutar archivo SQL en la base de datos remota
wrangler d1 execute igad-db --remote --file=./migrations/0001_create_prompts.sql

# Ejecutar múltiples archivos
wrangler d1 execute igad-db --remote --file=./migrations/0001_create_prompts.sql
wrangler d1 execute igad-db --remote --file=./migrations/0002_add_users_table.sql
```

#### **En Local (desarrollo)**
```bash
# Sin el flag --remote ejecuta en base de datos local
wrangler d1 execute igad-db --file=./migrations/0001_create_prompts.sql

# La base local se guarda en: .wrangler/state/v3/d1/
```

#### **Ejecutar SQL directo (sin archivo)**
```bash
# Remoto
wrangler d1 execute igad-db --remote --command="SELECT * FROM prompts LIMIT 5"

# Local
wrangler d1 execute igad-db --command="SELECT * FROM prompts"
```

---

## 🛠️ Comandos Útiles

### Consultas a la Base de Datos

```bash
# Ver todas las tablas
wrangler d1 execute igad-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Ver estructura de una tabla
wrangler d1 execute igad-db --remote --command="PRAGMA table_info(prompts)"

# Contar registros
wrangler d1 execute igad-db --remote --command="SELECT COUNT(*) as total FROM prompts"

# Ver últimos 10 registros
wrangler d1 execute igad-db --remote --command="SELECT * FROM prompts ORDER BY created_at DESC LIMIT 10"

# Eliminar todos los registros (¡cuidado!)
wrangler d1 execute igad-db --remote --command="DELETE FROM prompts"

# Eliminar tabla completa (¡cuidado!)
wrangler d1 execute igad-db --remote --command="DROP TABLE prompts"
```

### Backup y Restore

```bash
# Exportar base de datos completa
wrangler d1 export igad-db --remote --output=backup.sql

# Restaurar desde backup
wrangler d1 execute igad-db --remote --file=backup.sql
```

### Información de la Base de Datos

```bash
# Ver información detallada
wrangler d1 info igad-db

# Ver tiempo de consulta
wrangler d1 time-travel --database-id=95d444dd-04c7-4634-a6c9-866e51bbdc94
```

---

## 📊 Estructura de la Base de Datos

### Tabla: `prompts`

```sql
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  response TEXT,
  model TEXT DEFAULT 'default',
  tokens INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INTEGER | ID único autoincrementable |
| `prompt` | TEXT | El texto del prompt (requerido) |
| `response` | TEXT | Respuesta del AI (opcional) |
| `model` | TEXT | Modelo usado (ej: gpt-4, claude-3) |
| `tokens` | INTEGER | Número de tokens usados |
| `created_at` | DATETIME | Fecha de creación automática |
| `updated_at` | DATETIME | Fecha de actualización |

### Índices

```sql
-- Índice para búsquedas por fecha
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
```

---

## 💻 Uso en la Aplicación

### En Endpoints API (Server-side)

```typescript
export default defineEventHandler(async (event) => {
  // Obtener la instancia de D1
  const db = event.context.cloudflare?.env?.DB

  if (!db) {
    return { error: "Base de datos no disponible" }
  }

  // SELECT - Consultar datos
  const { results } = await db.prepare(
    "SELECT * FROM prompts ORDER BY created_at DESC LIMIT 10"
  ).all()

  // INSERT - Insertar datos
  const result = await db.prepare(
    "INSERT INTO prompts (prompt, model, tokens) VALUES (?, ?, ?)"
  ).bind('Mi prompt', 'gpt-4', 1500).run()

  // UPDATE - Actualizar datos
  await db.prepare(
    "UPDATE prompts SET response = ? WHERE id = ?"
  ).bind('Respuesta del AI', 123).run()

  // DELETE - Eliminar datos
  await db.prepare(
    "DELETE FROM prompts WHERE id = ?"
  ).bind(123).run()

  return { results }
})
```

### Prepared Statements (Seguro contra SQL Injection)

```typescript
// ❌ MAL - Vulnerable a SQL injection
await db.prepare(`SELECT * FROM prompts WHERE id = ${id}`).all()

// ✅ BIEN - Seguro con binding
await db.prepare("SELECT * FROM prompts WHERE id = ?").bind(id).all()

// ✅ BIEN - Múltiples parámetros
await db.prepare(
  "INSERT INTO prompts (prompt, model) VALUES (?, ?)"
).bind(prompt, model).run()
```

### Métodos Disponibles

```typescript
// .all() - Devuelve todos los resultados
const { results } = await db.prepare("SELECT * FROM prompts").all()

// .first() - Devuelve solo el primer resultado
const prompt = await db.prepare("SELECT * FROM prompts WHERE id = ?").bind(1).first()

// .run() - Para INSERT, UPDATE, DELETE
const result = await db.prepare("INSERT INTO prompts (prompt) VALUES (?)").bind(text).run()
console.log(result.meta.last_row_id) // ID del registro insertado

// .raw() - Devuelve arrays en lugar de objetos
const rows = await db.prepare("SELECT id, prompt FROM prompts").raw()
// [[1, 'texto'], [2, 'otro texto']]
```

---

## 🎯 Tips y Mejores Prácticas

### 1. **Usa Transacciones para Operaciones Múltiples**

```typescript
// Batch de operaciones
const statements = [
  db.prepare("INSERT INTO prompts (prompt) VALUES (?)").bind('Prompt 1'),
  db.prepare("INSERT INTO prompts (prompt) VALUES (?)").bind('Prompt 2'),
  db.prepare("INSERT INTO prompts (prompt) VALUES (?)").bind('Prompt 3'),
]

await db.batch(statements)
```

### 2. **Maneja Errores Correctamente**

```typescript
try {
  const { results } = await db.prepare("SELECT * FROM prompts").all()
  return { success: true, data: results }
} catch (error) {
  console.error('Database error:', error)
  return { success: false, error: error.message }
}
```

### 3. **Usa Índices para Búsquedas Frecuentes**

```sql
-- Si buscas frecuentemente por modelo
CREATE INDEX idx_prompts_model ON prompts(model);

-- Si buscas por rango de fechas
CREATE INDEX idx_prompts_date_range ON prompts(created_at);
```

### 4. **Limita Resultados en Consultas**

```typescript
// ❌ MAL - Puede devolver millones de registros
await db.prepare("SELECT * FROM prompts").all()

// ✅ BIEN - Limita a 100 resultados
await db.prepare("SELECT * FROM prompts LIMIT 100").all()
```

### 5. **Desarrollo Local vs Producción**

```bash
# Desarrollo: prueba localmente primero
wrangler d1 execute igad-db --file=./migrations/nueva_tabla.sql

# Si funciona, aplica a producción
wrangler d1 execute igad-db --remote --file=./migrations/nueva_tabla.sql
```

---

## 📚 Recursos Adicionales

- [Documentación Oficial D1](https://developers.cloudflare.com/d1/)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)

---

## 🚨 Comandos de Emergencia

### Resetear Base de Datos Completa

```bash
# 1. Eliminar tabla
wrangler d1 execute igad-db --remote --command="DROP TABLE IF EXISTS prompts"

# 2. Recrear tabla
wrangler d1 execute igad-db --remote --file=./migrations/0001_create_prompts.sql
```

### Ver Logs de Errores

```bash
# Ver logs en tiempo real
wrangler pages deployment tail

# Ver logs de una función específica
wrangler tail --format json
```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que `wrangler login` esté activo
2. Confirma el ID de la base de datos en `wrangler.toml`
3. Revisa los logs con `wrangler pages deployment tail`
4. Consulta la documentación oficial de Cloudflare

---

**Creado por**: IGAD Team  
**Última actualización**: Octubre 2025

