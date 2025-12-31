# ChileCupones

Plataforma de agregación de descuentos bancarios en Chile.

## Estructura del Proyecto

- **frontend/**: Aplicación React + Vite.
- **backend/**: API REST con Node.js + Express.
- **crawler-scripts/**: Scripts de Python (Playwright) para obtener descuentos.
- **validation-service/**: Microservicio de validación de enlaces.

## Ejecución Local

### Requisitos
- Node.js
- Python 3.x

### Instalación

1. Backend:
   ```bash
   cd backend
   npm install
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Crawler:
   ```bash
   cd crawler-scripts
   python -m venv .venv
   source .venv/bin/activate  # o .venv\Scripts\activate en Windows
   pip install -r requirements.txt
   playwright install chromium
   ```

### Ejecución

Puedes usar los scripts de VS Code o ejecutar manualmente:

- Backend: `npm run dev` (en carpeta backend)
- Frontend: `npm run dev` (en carpeta frontend)

## Infraestructura de Producción (Docker)

El proyecto incluye configuración para Docker y Docker Compose.

### Ejecutar con Docker Compose

```bash
docker-compose up --build
```

Esto levantará:
- Backend en http://localhost:3000
- Frontend en http://localhost:80
- MongoDB en puerto 27017

## Variables de Entorno

Asegúrate de configurar los archivos `.env` en `frontend`, `backend` y `validation-service` basándote en los ejemplos o la configuración local.

## Despliegue en la Nube (Opción B)

Esta guía te permite desplegar el proyecto en servicios gratuitos/económicos.

### 1. Base de Datos (MongoDB Atlas)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un Cluster gratuito (M0).
3. En "Database Access", crea un usuario y contraseña.
4. En "Network Access", permite acceso desde cualquier IP (`0.0.0.0/0`).
5. Obtén tu string de conexión (URI). Debería verse como: `mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/chilecupones`.

### 2. Backend y Validation Service (Render)
El proyecto incluye un archivo `render.yaml` para automatizar esto.

1. Crea una cuenta en [Render](https://render.com/).
2. Conecta tu repositorio de GitHub/GitLab.
3. Ve a "Blueprints" y selecciona "New Blueprint Instance".
4. Selecciona tu repositorio. Render detectará el archivo `render.yaml`.
   > **Nota:** Si ves "No repositories found", haz clic en "Configure GitHub" (o ve a GitHub > Settings > Applications > Render) y asegúrate de dar acceso al repositorio `ChileCupones` o a todos tus repositorios.
5. **Importante:** Durante la configuración, Render te pedirá el valor para `MONGO_URI`. Pega la URI que obtuviste en el paso 1.
6. Render desplegará automáticamente:
   - **Backend:** Servicio web Docker.
   - **Validation Service:** Worker Docker.
   - **Frontend:** Sitio estático (Opcional, ver paso 3).

### 3. Frontend (Vercel - Recomendado)
Aunque Render puede alojar el frontend, Vercel suele ser más rápido para React.

1. Instala Vercel CLI (`npm i -g vercel`) o ve a [vercel.com](https://vercel.com).
2. Importa tu repositorio y selecciona la carpeta `frontend` como raíz del proyecto (Root Directory).
3. En "Environment Variables", agrega:
   - `VITE_API_URL`: La URL de tu backend en Render (ej: `https://chilecupones-backend.onrender.com`).
4. Despliega.

### Notas Importantes
- **CORS:** Si despliegas el frontend en un dominio distinto al backend, asegúrate de que el backend permita ese origen. Actualmente `app.use(cors())` permite todo, lo cual es aceptable para pruebas pero debería restringirse en producción real.
- **Cron Jobs:** El backend usa `node-cron` para ejecutar el crawler a las 3 AM. Esto funcionará siempre que el servicio backend esté activo (en Render Free Tier, el servicio se duerme tras inactividad, por lo que el cron podría no ejecutarse si nadie visita la web. Considera usar "Cron Jobs" nativos de Render si actualizas a un plan de pago).

