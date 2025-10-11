# 🤖 Sistema de Gestión de Prompts AI

## ✨ ¿Qué se creó?

Un sistema completo para almacenar y gestionar prompts de inteligencia artificial con:

- ✅ Base de datos D1 (SQLite serverless)
- ✅ API REST para CRUD de prompts
- ✅ Interfaz web hermosa con Tailwind CSS
- ✅ Animaciones y transiciones suaves
- ✅ Funciona local y en producción

---

## 📁 Estructura de Archivos Creados

```
alliance-IGAD-client/
├── migrations/
│   └── 0001_create_prompts.sql      # Migración de base de datos
├── server/api/prompts/
│   ├── list.ts                      # GET: Listar prompts
│   ├── create.ts                    # POST: Crear prompt
│   └── delete.ts                    # DELETE: Eliminar prompt
├── app/pages/
│   └── prompts.vue                  # Página principal
├── D1-DATABASE.md                   # Guía completa de D1
├── SETUP-LOCAL-D1.md               # Solución a problemas locales
└── wrangler.toml                    # Configuración actualizada
```

---

## 🚀 Inicio Rápido

### 1. Verificar que la migración se aplicó

```bash
# Ver tablas en la base de datos remota
npx wrangler d1 execute igad-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"

# Debe mostrar: prompts
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 3. Abrir en el navegador

```
http://localhost:3000/prompts
```

---

## 🎨 Características de la Interfaz

### Dashboard Principal
- 📊 **Estadísticas**: Total de prompts, tokens usados, modelos únicos
- 💬 **Formulario**: Input grande con campos opcionales (modelo, tokens)
- 📚 **Historial**: Lista ordenada de prompts más recientes
- 🎭 **Animaciones**: Transiciones suaves al agregar/eliminar

### Cada Card de Prompt Muestra:
- 💬 Texto del prompt
- 🏷️ Badge con el modelo usado
- 📊 Cantidad de tokens
- 🕒 Timestamp relativo ("Hace 5 mins")
- ✅ Respuesta del AI (si existe)
- 🗑️ Botón para eliminar (aparece al hover)

### Diseño Responsive:
- 📱 Mobile-first
- 💻 Se adapta a tablets y desktop
- 🌓 Soporte para modo claro y oscuro

---

## 🔌 API Endpoints

### **GET** `/api/prompts/list`
Obtiene todos los prompts (últimos 100).

```bash
curl http://localhost:3000/api/prompts/list
```

**Respuesta:**
```json
{
  "success": true,
  "prompts": [
    {
      "id": 1,
      "prompt": "Explica qué es Vue 3",
      "response": null,
      "model": "gpt-4",
      "tokens": 1500,
      "created_at": "2025-10-11T03:30:00.000Z",
      "updated_at": "2025-10-11T03:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### **POST** `/api/prompts/create`
Crea un nuevo prompt.

```bash
curl -X POST http://localhost:3000/api/prompts/create \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explica qué es TypeScript",
    "model": "claude-3",
    "tokens": 1200,
    "response": "TypeScript es un superset de JavaScript..."
  }'
```

**Campos:**
- `prompt` *(requerido)*: El texto del prompt
- `model` *(opcional)*: Modelo de AI usado (default: "default")
- `tokens` *(opcional)*: Número de tokens (default: 0)
- `response` *(opcional)*: Respuesta del AI

**Respuesta:**
```json
{
  "success": true,
  "prompt": { /* objeto del prompt creado */ },
  "message": "Prompt guardado exitosamente"
}
```

---

### **GET** `/api/prompts/delete?id={id}`
Elimina un prompt por su ID.

```bash
curl "http://localhost:3000/api/prompts/delete?id=1"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Prompt eliminado exitosamente"
}
```

---

## 💾 Base de Datos

### Tabla `prompts`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único (autoincremental) |
| prompt | TEXT | El texto del prompt *(requerido)* |
| response | TEXT | Respuesta del AI *(opcional)* |
| model | TEXT | Modelo usado *(default: 'default')* |
| tokens | INTEGER | Tokens usados *(default: 0)* |
| created_at | DATETIME | Fecha de creación *(automática)* |
| updated_at | DATETIME | Fecha de actualización *(automática)* |

---

## 🛠️ Comandos Útiles

### Desarrollo Local

```bash
# Ver prompts en base de datos local
npx wrangler d1 execute igad-db --command="SELECT * FROM prompts"

# Insertar prompt de prueba local
npx wrangler d1 execute igad-db --command="INSERT INTO prompts (prompt, model) VALUES ('Test', 'gpt-4')"

# Limpiar todos los prompts locales
npx wrangler d1 execute igad-db --command="DELETE FROM prompts"
```

### Producción (Remoto)

```bash
# Ver prompts en base de datos remota
npx wrangler d1 execute igad-db --remote --command="SELECT * FROM prompts"

# Insertar prompt de prueba remoto
npx wrangler d1 execute igad-db --remote --command="INSERT INTO prompts (prompt, model) VALUES ('Production test', 'claude-3')"

# Contar prompts totales
npx wrangler d1 execute igad-db --remote --command="SELECT COUNT(*) as total FROM prompts"

# Backup de la base de datos
npx wrangler d1 export igad-db --remote --output=backup.sql
```

---

## 🔧 Solución de Problemas

### ❌ Error: "no such table: prompts"

**Causa**: La migración no se ejecutó.

**Solución**:
```bash
# Ejecutar migración en remoto
npx wrangler d1 execute igad-db --remote --file=./migrations/0001_create_prompts.sql

# O en local
npx wrangler d1 execute igad-db --file=./migrations/0001_create_prompts.sql
```

---

### ❌ Error: "Database no disponible"

**Causa**: El binding de D1 no está configurado.

**Solución**: Verifica que `wrangler.toml` tenga:
```toml
[[d1_databases]]
binding = "DB"
database_name = "igad-db"
database_id = "95d444dd-04c7-4634-a6c9-866e51bbdc94"
```

Y reinicia el servidor: `npm run dev`

---

### ❌ Error: "Permission denied" en base local

**Causa**: El directorio `.wrangler` fue creado con permisos de root.

**Solución**: Ver archivo `SETUP-LOCAL-D1.md` para instrucciones detalladas.

---

## 🎯 Próximos Pasos

Ideas para extender el sistema:

1. **Búsqueda**: Agregar input para buscar prompts por texto
2. **Filtros**: Filtrar por modelo o rango de fechas
3. **Edición**: Permitir editar prompts existentes
4. **Export**: Exportar prompts a JSON/CSV
5. **Etiquetas**: Sistema de tags para categorizar prompts
6. **Favoritos**: Marcar prompts importantes
7. **Compartir**: Generar links para compartir prompts
8. **Integración AI**: Conectar con API de OpenAI/Claude para obtener respuestas automáticas

---

## 📚 Documentación Adicional

- 📖 **[D1-DATABASE.md](./D1-DATABASE.md)** - Guía completa de D1 y comandos
- 🔧 **[SETUP-LOCAL-D1.md](./SETUP-LOCAL-D1.md)** - Solución de problemas locales
- 🌐 **[Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)** - Documentación oficial

---

## 🎨 Personalización del Diseño

El diseño usa **Tailwind CSS**. Para personalizar:

1. Colores: Edita las clases `from-blue-600`, `to-indigo-600`, etc.
2. Espaciado: Cambia `p-6`, `mb-8`, `gap-4`
3. Sombras: Modifica `shadow-xl`, `shadow-lg`
4. Bordes: Ajusta `rounded-xl`, `rounded-2xl`

---

## 👤 Uso desde el Frontend

```vue
<script setup>
// Crear prompt
const crearPrompt = async () => {
  const data = await $fetch('/api/prompts/create', {
    method: 'POST',
    body: {
      prompt: 'Mi prompt',
      model: 'gpt-4',
      tokens: 1500
    }
  })
  console.log(data)
}

// Listar prompts
const prompts = await $fetch('/api/prompts/list')

// Eliminar prompt
await $fetch(`/api/prompts/delete?id=123`)
</script>
```

---

**🎉 ¡Todo listo para usar!**

Visita `http://localhost:3000/prompts` y comienza a gestionar tus prompts de AI.

