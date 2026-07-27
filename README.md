# Estudio Jurídico Vento - Sistema de Gestión Legal (Legal ERP)

¡Bienvenido al repositorio del **Sistema de Gestión Legal de Estudio Jurídico Vento**! 

Este proyecto es una plataforma integral (ERP) desarrollada a medida para modernizar y optimizar el flujo de trabajo diario de un estudio de abogados. Su objetivo es reemplazar las hojas de cálculo y los documentos dispersos por una solución centralizada, rápida y fácil de usar.

---

## 📖 ¿Qué es este proyecto?

Administrar un bufete de abogados implica manejar mucha información crítica: datos de clientes, expedientes judiciales, audiencias y plazos que no se pueden pasar por alto. 

Esta aplicación web resuelve ese problema ofreciendo un panel de control donde los abogados y asistentes pueden:
- **Tener un directorio de clientes** organizado y fácil de buscar.
- **Registrar y hacer seguimiento de los expedientes (casos)**, viendo su estado, prioridad y asignando responsables.
- **Recibir notificaciones automáticas** sobre plazos próximos a vencer y audiencias programadas para los próximos días.
- **Gestionar documentos y plantillas legales** (como modelos de demandas o contratos) guardándolos de forma segura en la nube.
- **Exportar reportes** fácilmente a formato CSV/Excel.

## ✨ Características Destacadas

- 🔒 **Seguridad y Roles:** Sistema de inicio de sesión con JWT. Diferentes accesos dependiendo de si eres Administrador, Abogado o Asistente.
- 🔔 **Centro de Alertas:** Notificaciones en tiempo real para que ningún plazo legal (≤ 5 días) o audiencia (≤ 7 días) se pase por alto.
- 📱 **Interfaz Moderna:** Diseño limpio, responsivo y profesional construido con Tailwind CSS y componentes amigables.
- ⚡ **Alto Rendimiento:** Paginación de datos desde el servidor y caché en el cliente para que la navegación sea instantánea, incluso con miles de registros.
- ☁️ **Almacenamiento en la Nube:** Integración con Cloudinary para guardar y descargar archivos pesados y modelos de documentos.

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido bajo una arquitectura de **Monorepo**, dividiendo la aplicación en dos partes principales:

### Frontend (Interfaz de Usuario)
- **React + Vite:** Para una experiencia de usuario rápida y fluida.
- **TypeScript:** Para código más seguro y con menos errores.
- **Tailwind CSS + Lucide Icons:** Para un diseño elegante y moderno.
- **React Query:** Para el manejo eficiente de datos y caché.
- **Zustand:** Para el estado global (como la sesión del usuario).

### Backend (Servidor y Base de Datos)
- **Node.js + Express:** Servidor robusto y escalable.
- **Prisma ORM:** Para interactuar de forma segura e intuitiva con la base de datos.
- **PostgreSQL (Neon):** Base de datos relacional alojada en la nube.
- **Cloudinary:** Para el almacenamiento de archivos (plantillas y documentos).
- **JSON Web Tokens (JWT):** Para proteger las rutas y mantener las sesiones seguras.

## 🚀 Cómo probarlo localmente (Para Desarrolladores)

Si eres desarrollador y quieres correr este proyecto en tu propia máquina, sigue estos pasos:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/20244541-lang/Estudio-Vento.git
   cd Estudio-Vento
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Entra a la carpeta `apps/api` y crea un archivo llamado `.env` con lo siguiente:
   ```env
   PORT=3000
   DATABASE_URL="tu_url_de_postgresql"
   JWT_SECRET="tu_clave_secreta"
   JWT_REFRESH_SECRET="tu_clave_secreta_refresh"
   
   # Credenciales de Cloudinary (para subida de archivos)
   CLOUDINARY_CLOUD_NAME="tu_cloud_name"
   CLOUDINARY_API_KEY="tu_api_key"
   CLOUDINARY_API_SECRET="tu_api_secret"
   ```

4. **Prepara la Base de Datos**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   ```

5. **Inicia el proyecto**
   Vuelve a la carpeta principal del proyecto y arranca ambos servidores (Frontend y Backend):
   ```bash
   npm run dev
   ```
   La aplicación web estará disponible en `http://localhost:5173`.

---
*Desarrollado con ❤️ para Estudio Jurídico Vento & Asociados.*
