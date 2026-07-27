# Estudio Jurídico Vento - Sistema de Gestión Legal (ERP)

Un sistema integral diseñado para la gestión de expedientes, clientes, notificaciones de plazos y control de audiencias de **Estudio Jurídico Vento & Asociados**.

## 🚀 Características Principales

* **Gestión de Clientes:** Directorio completo con búsqueda, paginación, filtros y exportación a CSV.
* **Control de Expedientes (Casos):** Seguimiento del estado de los casos, materias, prioridades y asignación de abogados.
* **Sistema de Notificaciones (Alertas):** Avisos visuales y listado de plazos próximos a vencer (≤ 5 días) y audiencias (≤ 7 días).
* **Plantillas Funcionales:** Almacenamiento seguro en la nube (Cloudinary) para modelos de demandas, escritos y contratos. Descarga y gestión categorizada.
* **Exportación de Datos:** Descarga de listados de clientes y expedientes en formato CSV (compatible con Excel).
* **Seguridad y Roles:** Autenticación por JWT y control de acceso basado en roles (Admin, Abogado, Asistente).

## 🛠️ Stack Tecnológico

Este proyecto utiliza una arquitectura de Monorepo (Frontend y Backend separados).

* **Frontend (Web App):**
  * React + TypeScript + Vite
  * Tailwind CSS + Lucide Icons
  * React Query (Caché y gestión de estado asíncrono)
  * React Router (Navegación)
  * Zustand (Estado global de autenticación)
* **Backend (API):**
  * Node.js + Express
  * TypeScript
  * Prisma ORM (Gestor de base de datos)
  * JWT (JSON Web Tokens) para autenticación
* **Base de Datos & Almacenamiento:**
  * PostgreSQL (Alojado en Neon Database)
  * Cloudinary (Almacenamiento de archivos y plantillas)

## ⚙️ Requisitos Previos

* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* npm o yarn
* Una cuenta en [Neon](https://neon.tech/) para la base de datos (PostgreSQL)
* Una cuenta en [Cloudinary](https://cloudinary.com/) para almacenar archivos

## 💻 Instalación y Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/20244541-lang/Estudio-Vento.git
   cd Estudio-Vento
   ```

2. **Instalar dependencias globales del monorepo**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno (.env)**
   Ve a la carpeta `apps/api` y crea/edita el archivo `.env`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://usuario:password@tu-host-neon.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="tu_super_clave_secreta_jwt"
   JWT_REFRESH_SECRET="tu_super_clave_secreta_refresh_jwt"
   
   # Cloudinary Credentials
   CLOUDINARY_CLOUD_NAME="tu_cloud_name"
   CLOUDINARY_API_KEY="tu_api_key"
   CLOUDINARY_API_SECRET="tu_api_secret"
   ```

4. **Sincronizar la Base de Datos (Prisma)**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma db push
   ```
   *(Opcional: Si deseas poblar la base de datos con datos semilla, puedes ejecutar el script de seed).*

5. **Iniciar los servidores en modo Desarrollo**
   Vuelve a la raíz del proyecto y ejecuta:
   ```bash
   npm run dev
   ```
   Esto iniciará concurrentemente:
   * **API Backend:** `http://localhost:3000`
   * **Web Frontend:** `http://localhost:5173` (o `5174`)

## 🌐 Despliegue en Producción

El proyecto está preparado para desplegarse fácilmente en plataformas modernas:
* **Frontend:** Se despliega en **Vercel** (`https://estudio-vento.vercel.app`).
* **Backend:** Se despliega en **Render** (`https://estudio-vento.onrender.com`).
* **Base de datos:** Alojada en **Neon Database**.

Recuerda siempre mantener actualizadas tus variables de entorno en producción y ejecutar `npx prisma db push` tras añadir nuevos modelos (como la tabla `Template`) a la base de datos de producción.

## 👥 Equipo
Desarrollado para Estudio Jurídico Vento & Asociados.
