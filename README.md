

# Gestor de Hojas de Vida (GHV_UIP)

Backend modular desarrollado en NestJS para la gestión de hojas de vida, postulaciones y procesos de selección académica en el ámbito universitario. Permite la administración de usuarios, roles, documentos y procesos de selección.
## Estructura del proyecto

```
ghv_uip/
├── src/                  # Código fuente principal (módulos, controladores, servicios)
├── test/                 # Pruebas end-to-end
├── dist/                 # Archivos compilados (build)
├── .env                  # Variables de entorno (no versionar)
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
└── README.md             # Documentación principal
```



## Requisitos
- Node.js >= 18.x
- MySQL >= 8.x


## Instalación

Clona el repositorio y ejecuta:
```bash
npm install
```



## Configuración
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```
JWT_SECRET=supersecretkey
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_DATABASE=ghv_uip
```
Asegúrate de tener una base de datos MySQL llamada `ghv_uip` y que los datos de conexión coincidan con los de tu entorno.
## Documentación Swagger

La API cuenta con documentación interactiva generada con Swagger. Una vez el servidor esté en ejecución, accede a:

```
http://localhost:3000/api
```




## Comandos útiles
```bash
# Iniciar en modo desarrollo
npm run start:dev

# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas end-to-end
npm run test:e2e

# Compilar para producción
npm run build

# Iniciar en producción
npm run start:prod
```
## Despliegue en producción

1. Configura las variables de entorno en el servidor de producción.
2. Ejecuta `npm install` y luego `npm run build`.
3. Inicia el servidor con `npm run start:prod`.

## Contribución

¡Las contribuciones son bienvenidas! Para colaborar:

1. Haz un fork del repositorio.
2. Crea una rama nueva (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit.
4. Haz push a tu fork y abre un Pull Request.

Por favor, sigue las buenas prácticas de código y documentación.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

## Contacto

Para dudas, soporte o sugerencias, contacta a: [jdav117@gmail.com](mailto:jdav117@gmail.com)



## Endpoints principales

### 1. Crear roles base (solo pruebas)
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
- Autenticación (JWT)


## Módulos recomendados a implementar
- Programas Académicos
- Convocatorias
- Postulaciones
- Documentos
- Ítems de Evaluación
- Evaluaciones
- Baremo Convocatoria


## Notas y recomendaciones
- El endpoint `/roles/init` es solo para pruebas. Elimínalo o protégelo antes de producción.
- Usa variables de entorno para datos sensibles.
- Revisa y ajusta los permisos de los roles antes de desplegar en producción.
- Considera agregar documentación OpenAPI/Swagger (`/api`) para facilitar el consumo de la API.


---

Desarrollado con ❤️ usando NestJS.

¿Quieres contribuir? ¡Pull requests y sugerencias son bienvenidos!
