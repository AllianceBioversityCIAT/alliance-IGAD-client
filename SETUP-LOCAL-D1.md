# 🔧 Setup Local D1

## Problema de Permisos en Base de Datos Local

Si la base de datos local D1 tiene problemas de permisos (porque se creó con `sudo`), sigue estos pasos:

### Solución 1: Resetear Base de Datos Local

```bash
# Detener el servidor si está corriendo
# Ctrl+C

# Eliminar cache de D1 local (necesitas permisos)
sudo rm -rf .wrangler/state/v3/d1

# Crear la base de datos local nuevamente
npx wrangler d1 execute igad-db --file=./migrations/0001_create_prompts.sql

# Iniciar servidor de nuevo
npm run dev
```

### Solución 2: Usar Base de Datos Remota en Desarrollo

Modifica `nuxt.config.ts` para usar la base de datos remota:

```typescript
modules: [
  // ... otros módulos
  ['nitro-cloudflare-dev', {
    remote: true  // Esto usa la base de datos remota real
  }]
],
```

Luego reinicia el servidor:

```bash
npm run dev
```

### Solución 3: Corregir Permisos del Directorio

```bash
# Cambiar propietario de la carpeta .wrangler a tu usuario
sudo chown -R $USER:$USER .wrangler/

# Ahora puedes ejecutar la migración sin sudo
npx wrangler d1 execute igad-db --file=./migrations/0001_create_prompts.sql

# Iniciar servidor
npm run dev
```

---

## ✅ Verificar que Funciona

Una vez resuelto, verifica:

```bash
# Ver la tabla
npx wrangler d1 execute igad-db --command="SELECT name FROM sqlite_master WHERE type='table'"

# Insertar dato de prueba
npx wrangler d1 execute igad-db --command="INSERT INTO prompts (prompt, model) VALUES ('Test prompt', 'test-model')"

# Ver datos
npx wrangler d1 execute igad-db --command="SELECT * FROM prompts"
```

---

## 🎯 Recomendación

**Para desarrollo, usa la base de datos remota** (Solución 2). Es más simple y evitas problemas de permisos locales.

La base de datos local es útil solo si:
- Trabajas offline
- Quieres hacer pruebas sin afectar la base remota
- Ejecutas tests automatizados

---

## 📍 Acceder a la Página

Una vez que el servidor esté corriendo:

```
http://localhost:3000/prompts
```

¡Listo! 🚀

