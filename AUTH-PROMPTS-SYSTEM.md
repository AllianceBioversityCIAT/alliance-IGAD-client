# 🔐 Authentication & Multi-Type Prompts System

## ✅ Sistema Completado

Se ha implementado un sistema completo de autenticación CON CONTRASEÑA y gestión de prompts con múltiples tipos.

---

## 👥 Usuarios Creados Manualmente

Los usuarios se crean mediante comandos curl/consola. Los siguientes usuarios están configurados:

1. **Hector** - `hector@igad.com` / Password: `hector123`
2. **Enrique** - `enrique@igad.com` / Password: `enrique123`
3. **Yecksin** - `yecksin@igad.com` / Password: `yecksin123`

**IMPORTANTE:** 
- ❌ NO hay registro de usuarios en la UI
- ✅ Los usuarios se crean manualmente con curl (ver `CREATE-USERS.md`)
- 🔐 Contraseña requerida para login
- 🔒 Passwords hasheados con SHA-256

---

## 🗂️ Tipos de Prompts

El sistema soporta dos tipos de prompts:

### 1. Proposal Writer
- **Ruta:** `/prompts/proposal-writer`
- **Tipo en DB:** `proposal_writer`
- **Icono:** 📝
- **Uso:** Prompts para propuestas de financiamiento y aplicaciones de proyectos

### 2. Newsletter Generator
- **Ruta:** `/prompts/newsletter-generator`
- **Tipo en DB:** `newsletter_generator`
- **Icono:** 📧
- **Uso:** Prompts para newsletters y comunicaciones

---

## 🔑 Características del Sistema

### Autenticación
- ✅ Login CON contraseña (email + password)
- ✅ Passwords hasheados con SHA-256
- ✅ Usuarios creados manualmente vía API/curl
- ✅ Sesiones almacenadas en D1 (duración: 7 días)
- ✅ Cookies HTTP-only seguras
- ✅ Verificación automática de sesión
- ✅ Logout con limpieza de sesión
- ❌ NO hay registro público de usuarios

### Gestión de Prompts
- ✅ CRUD completo (Create, Read, Delete)
- ✅ Sistema de activación (solo uno activo por tipo)
- ✅ Tracking de usuarios (creador y último editor)
- ✅ Historial completo
- ✅ Prompts compartidos entre usuarios

### Interfaz
- ✅ Barra de navegación con login/logout
- ✅ Selección de tipo de prompt
- ✅ Información de usuarios en cada prompt
- ✅ Badge visual para prompt activo
- ✅ Botón de activación visible al hover
- ✅ Diseño corporativo IGAD (verde)

---

## 📊 Estructura de Base de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `prompts`
```sql
CREATE TABLE prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('proposal_writer', 'newsletter_generator')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  updated_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Tabla: `sessions`
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔌 API Endpoints

### Autenticación

#### `POST /api/admin/create-user`
Crea un nuevo usuario (solo para administradores, uso manual).

**Body:**
```json
{
  "email": "user@igad.com",
  "name": "User Name",
  "password": "secure_password"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@igad.com",
    "name": "User Name"
  }
}
```

**Ver documentación completa en:** `CREATE-USERS.md`

---

#### `POST /api/auth/login`
Inicia sesión con email y contraseña.

**Body:**
```json
{
  "email": "hector@igad.com",
  "password": "hector123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "hector@igad.com",
    "name": "Hector"
  }
}
```

#### `GET /api/auth/me`
Obtiene el usuario actual.

**Respuesta:**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": 1,
    "email": "hector@igad.com",
    "name": "Hector"
  }
}
```

#### `GET /api/auth/logout`
Cierra la sesión actual.

---

### Prompts

#### `GET /api/prompts/list?type={type}`
Lista todos los prompts de un tipo específico.

**Parámetros:**
- `type`: `proposal_writer` o `newsletter_generator`

**Respuesta:**
```json
{
  "success": true,
  "prompts": [
    {
      "id": 1,
      "type": "proposal_writer",
      "title": "Project Proposal Template",
      "prompt": "Write a proposal for...",
      "is_active": 1,
      "created_by": 1,
      "updated_by": 2,
      "created_by_name": "Hector",
      "created_by_email": "hector@igad.com",
      "updated_by_name": "Enrique",
      "updated_by_email": "enrique@igad.com",
      "created_at": "2025-10-11 04:00:00",
      "updated_at": "2025-10-11 05:00:00"
    }
  ],
  "total": 1
}
```

#### `POST /api/prompts/create`
Crea un nuevo prompt.

**Body:**
```json
{
  "type": "proposal_writer",
  "title": "New Prompt",
  "prompt": "Content of the prompt..."
}
```

**Requiere:** Estar autenticado

#### `GET /api/prompts/activate?id={id}`
Activa un prompt específico (desactiva los demás del mismo tipo).

**Parámetros:**
- `id`: ID del prompt a activar

**Requiere:** Estar autenticado

#### `GET /api/prompts/delete?id={id}`
Elimina un prompt.

**Parámetros:**
- `id`: ID del prompt a eliminar

**Requiere:** Estar autenticado

---

## 🚀 Flujo de Usuario

### 1. Crear Usuarios (Administrador)
```bash
# Los administradores crean usuarios con curl
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"user@igad.com","name":"Name","password":"pass123"}'
```

### 2. Login (Usuario)
```
1. Usuario visita la página principal
2. Click en "Login" en la barra de navegación
3. Ingresa email y contraseña
4. Click en "Login"
5. Si credenciales correctas → Sesión creada
6. Barra muestra "Welcome, {nombre}"
```

### 3. Gestión de Prompts
```
1. Usuario logueado click en "Manage Prompts"
2. Ve dos opciones: Proposal Writer y Newsletter Generator
3. Selecciona un tipo
4. Ve el historial de prompts (activo primero)
5. Puede:
   - Crear nuevo prompt
   - Activar un prompt (hover sobre card → "✓ Activate")
   - Eliminar un prompt (hover sobre card → 🗑️)
```

### 4. Sistema de Activación
```
- Solo un prompt puede estar activo por tipo
- Al activar uno, se desactiva automáticamente el anterior
- El prompt activo tiene:
  * Badge verde "✅ Active Prompt"
  * Borde verde más grueso
  * Aparece primero en la lista
```

### 5. Información de Usuarios
```
Cada prompt muestra:
- Creado por: Nombre (email)
- Última actualización por: Nombre (email)
- Fecha de creación relativa
- ID único
```

---

## 🎨 Rutas del Sistema

| Ruta | Descripción | Auth Requerida |
|------|-------------|----------------|
| `/` | Página principal | ❌ |
| `/prompts` | Selección de tipo de prompt | ✅ |
| `/prompts/proposal-writer` | Gestión de prompts de propuestas | ✅ |
| `/prompts/newsletter-generator` | Gestión de prompts de newsletters | ✅ |

---

## 🔒 Seguridad

- ✅ **Passwords hasheados** con SHA-256 (nunca en texto plano)
- ✅ **Cookies HTTP-only** (no accesibles desde JavaScript)
- ✅ Sesiones con expiración automática (7 días)
- ✅ Verificación de sesión en cada request protegido
- ✅ Mensajes de error genéricos (no revela si email existe)
- ✅ Foreign keys para integridad referencial
- ✅ Check constraints en tipos de prompts
- ✅ Validación de email y password en backend

---

## 🧪 Testing

### Test de Creación de Usuario
```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{"email":"test@igad.com","name":"Test User","password":"test123"}'
```

### Test de Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hector@igad.com","password":"hector123"}'
```

### Test de Login con Contraseña Incorrecta
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hector@igad.com","password":"wrong"}'
# Debe retornar: "Invalid email or password"
```

### Test de Creación de Prompt
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hector@igad.com"}' \
  -c cookies.txt

curl -X POST http://localhost:3000/api/prompts/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"type":"proposal_writer","title":"Test","prompt":"Test prompt"}'
```

### Test de Activación
```bash
curl "http://localhost:3000/api/prompts/activate?id=1" -b cookies.txt
```

---

## 📝 Comandos Útiles D1

### Ver usuarios
```bash
npx wrangler d1 execute igad-db --remote \
  --command="SELECT * FROM users"
```

### Ver prompts activos
```bash
npx wrangler d1 execute igad-db --remote \
  --command="SELECT * FROM prompts WHERE is_active = 1"
```

### Ver sesiones activas
```bash
npx wrangler d1 execute igad-db --remote \
  --command="SELECT s.*, u.name FROM sessions s JOIN users u ON s.user_id = u.id WHERE expires_at > datetime('now')"
```

### Limpiar sesiones expiradas
```bash
npx wrangler d1 execute igad-db --remote \
  --command="DELETE FROM sessions WHERE expires_at < datetime('now')"
```

---

## 🎯 Características Clave

1. **Sin duplicación de prompts:** Todos los usuarios editan el mismo conjunto de prompts
2. **Solo un activo:** Solo un prompt puede estar activo por tipo
3. **Trazabilidad:** Se sabe quién creó y quién editó cada prompt
4. **Prioridad visual:** El prompt activo siempre aparece primero
5. **Interfaz intuitiva:** Activación con un click al hacer hover
6. **Diseño corporativo:** Colores y estilos de IGAD

---

**🎉 Sistema listo para usar!**

Visita: `http://localhost:3000` → Login → Manage Prompts → Selecciona tipo → Gestiona tus prompts

