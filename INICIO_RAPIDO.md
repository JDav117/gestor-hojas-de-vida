# 🚀 INICIO RÁPIDO - Sistema de Gestión de Hojas de Vida

## ⚡ Pasos para Ejecutar (5 minutos)

### 1️⃣ Base de Datos (2 min)
```bash
# Crear base de datos en MySQL
mysql -u root -p
CREATE DATABASE ghv_uip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 2️⃣ Configuración (1 min)
El archivo `.env` ya está creado. Solo edita si necesitas cambiar:
```env
DB_USERNAME=root
DB_PASSWORD=tu_password
```

### 3️⃣ Backend (1 min)
```bash
# Ya instaladas las dependencias
npm run start:dev
```
✅ Backend corriendo en http://localhost:3000

### 4️⃣ Frontend (1 min)
```bash
cd frontend
npm run dev
```
✅ Frontend corriendo en http://localhost:5173

---

## 🎯 Primer Uso

### Crear Usuario Administrador
1. Abre http://localhost:5173
2. Click en "Registrarse"
3. Completa el formulario
4. En la base de datos, ejecuta:
```sql
-- Crear rol admin si no existe
INSERT INTO roles (nombre_rol) VALUES ('admin') ON DUPLICATE KEY UPDATE nombre_rol='admin';

-- Asignar rol admin al primer usuario
INSERT INTO user_roles (user_id, role_id) 
SELECT 1, id FROM roles WHERE nombre_rol = 'admin';
```

### Flujo de Prueba Rápida
1. **Como Admin:**
   - Crear convocatoria con requisitos documentales
   - Crear programa académico

2. **Como Postulante:**
   - Crear postulación
   - Subir documentos PDF
   - Enviar postulación

3. **Como Evaluador:**
   - Ver postulaciones asignadas
   - Evaluar con puntajes
   - Guardar evaluación

---

## 📚 Documentación Completa
Ver `CAMBIOS_FINALIZACION.md` para detalles completos de todas las funcionalidades implementadas.

---

## 💡 Comandos Útiles

```bash
# Backend
npm run start:dev    # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run test         # Ejecutar tests

# Frontend
cd frontend
npm run dev          # Desarrollo
npm run build        # Compilar para producción

# Base de datos
npm run typeorm migration:run    # Ejecutar migraciones
```

---

## 🆘 Problemas Comunes

**Error de conexión a BD:**
```bash
# Verificar que MySQL esté corriendo
# Windows: Services → MySQL80
# Linux: sudo systemctl status mysql
```

**Puerto 3000 en uso:**
```bash
# Cambiar PORT en .env
PORT=3001
```

**Archivos no se suben:**
```bash
# Verificar permisos de carpeta
mkdir -p uploads
chmod 777 uploads
```

---

**¡Listo para comenzar!** 🎉
