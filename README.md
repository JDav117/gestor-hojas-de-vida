# Gestor de Hojas de Vida (GHV_UIP)

Backend desarrollado en NestJS para la gestión de hojas de vida, postulaciones y procesos de selección académica.

## Requisitos
- Node.js >= 18
- MySQL

## Instalación
```bash
npm install
```

## Configuración
Crea un archivo `.env` en la raíz con el siguiente contenido:
```
JWT_SECRET=supersecretkey
```
Asegúrate de tener una base de datos MySQL llamada `ghv_uip` y configura usuario/contraseña en `src/app.module.ts`.

## Comandos útiles
```bash
# Desarrollo
npm run start:dev

# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e
```

## Endpoints principales

### 1. Crear roles base (solo para pruebas)
`POST /roles/init`

### 2. Registro de usuario
`POST /users`
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@mail.com",
  "password": "123456",
  "identificacion": "123456789",
  "roles": [1]
}
```

### 3. Login
`POST /auth/login`
```json
{
  "email": "juan@mail.com",
  "password": "123456"
}
```
Respuesta:
```json
{
  "access_token": "...",
  "user": { "id": 1, "email": "juan@mail.com", "nombre": "Juan", "apellido": "Pérez", "roles": [ ... ] }
}
```


### 4. Endpoints protegidos (requieren JWT)
Agrega el header:
```
Authorization: Bearer <access_token>
```

- `GET /users` — Lista de usuarios
- `GET /users/:id` — Detalle de usuario
- `PUT /users/:id` — Actualizar usuario
- `DELETE /users/:id` — Eliminar usuario
- `POST /roles` — Crear rol
- `GET /roles` — Listar roles

#### Documentos

- `POST /documentos` — Crear documento
  ```json
  {
    "postulacion_id": 1,
    "nombre_documento": "CV.pdf",
    "ruta_archivo": "/files/cv.pdf"
  }
  ```

- `GET /documentos` — Listar documentos
- `GET /documentos/:id` — Detalle de documento
- `PATCH /documentos/:id` — Actualizar documento
  ```json
  {
    "nombre_documento": "CV_actualizado.pdf"
  }
  ```
- `DELETE /documentos/:id` — Eliminar documento

## Pruebas automáticas
Las pruebas e2e cubren el flujo de registro, login y acceso protegido.

## Módulos implementados
- Usuarios
- Roles
- Autenticación JWT

## Módulos recomendados a implementar
- Programas Académicos
- Convocatorias
- Postulaciones
- Documentos
- Ítems de Evaluación
- Evaluaciones
- BaremoConvocatoria

## Notas
- El endpoint `/roles/init` es solo para pruebas. Elimínalo o protégelo antes de producción.
- Usa variables de entorno para datos sensibles.

---

Desarrollado con ❤️ usando NestJS.