# Deployment Guide: Cosmic Watch

This guide explains how to run the application using Docker and how to deploy it to production.

## 🐳 Docker (Local Development)

We use Docker Compose to run the full stack (Frontend + Backend + MongoDB) locally with a single command.

### Prerequisites
- Docker Desktop installed and running.

### Steps
1.  **Environment Setup**: Ensure you have a `.env` file in the `backend` directory (see `backend/.env.example` or documentation).
2.  **Run**:
    ```bash
    docker-compose up --build
    ```
3.  **Access**:
    - **Frontend**: http://localhost:3000
    - **Backend**: http://localhost:4000
    - **MongoDB**: localhost:27017

---

## 🚀 Production Deployment

Because this is a full-stack application with a persistent Node.js backend (WebSockets) and a Next.js frontend, we recommend a **Hybrid Deployment Strategy**:

- **Frontend** -> **Netlify** (Best for Next.js/Static assets)
- **Backend** -> **Render** or **Railway** (Best for persistent Node.js servers)

> **Note**: You cannot deploy the backend to Netlify because Netlify Functions are stateless and do not support the long-lived WebSocket connections required for the chat features.

### Part 1: Backend Deployment (Render.com)

1.  **Push to GitHub**: Ensure your code is in a public or private GitHub repository.
2.  **Create Service**:
    - Log in to [Render](https://render.com/).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
3.  **Configuration**:
    - **Root Directory**: `backend`
    - **Runtime**: Node
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
4.  **Environment Variables**:
    - Add all variables from your `backend/.env` file.
    - > [!IMPORTANT]
    - > **MONGODB_URI**: You MUST use a cloud database like **MongoDB Atlas**. Localhost (`127.0.0.1` or `::1`) will NOT work in production on Render.
    - > **CORS_ORIGIN**: Set this to your Netlify Frontend URL.
5.  **Deploy**: Click Create Web Service. Copy the URL (e.g., `https://cosmic-watch-backend.onrender.com`).

### Part 2: Frontend Deployment (Netlify)

1.  **Create Site**:
    - Log in to [Netlify](https://www.netlify.com/).
    - Click **Add new site** -> **Import an existing project**.
    - Connect your GitHub repository.
2.  **Configuration**:
    - **Base directory**: `frontend`
    - **Build command**: `npm run build`
    - **Publish directory**: `.next`
3.  **Environment Variables**:
    - Click **Show advanced** -> **New Variable**.
    - Key: `NEXT_PUBLIC_API_URL`
    - Value: Your Backend URL from Part 1 (e.g., `https://cosmic-watch-backend.onrender.com`).
4.  **Deploy**: Click **Deploy site**.

### Part 3: Final Connection

1.  Go back to your Backend (Render) dashboard.
2.  Update the `CORS_ORIGIN` environment variable to your new Netlify Frontend URL (e.g., `https://cosmic-watch.netlify.app`).
3.  Redeploy the backend.

Everything should now be live! 🚀
