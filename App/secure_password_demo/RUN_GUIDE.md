# Zero Vault - Run Guide

> [!IMPORTANT]
> **DO NOT RUN `npm run build:addon`**. The application is configured to use a JavaScript fallback. You do not need Visual Studio or C++ tools to run this project.

This guide explains how to start the Secure Password Manager (Zero Vault) application.

## Prerequisites
- **Node.js**: v22.x or higher (Recommended for full compatibility)
- **NPM**: Latest version
- **Supabase Account**: Ensure your `.env` files are configured with valid Supabase credentials.

## Setup Instructions

### 1. Install Dependencies
Run the following commands to install all required packages:

**Server:**
```bash
cd server
npm install --legacy-peer-deps
```

**Client:**
```bash
cd client
npm install --legacy-peer-deps
```

### 2. Prepare the Native Addon (Optional)
The server uses a C++ "Risk Engine" for high-performance security evaluations. 
- **JS Fallback Enabled**: The application will **automatically fall back to a JavaScript version** if the native addon isn't compiled.
- **Non-blocking Install**: I have configured `npm install` to be non-blocking. If the native build fails during installation, you will see a message saying "Native build failed, using JS fallback", but the installation will complete successfully.
- To compile the native addon manually (requires Visual Studio Build Tools on Windows):
```bash
cd server
npm run prebuild:addon
npm run build:addon
```

## Running the Application

### Start the Backend Server
```bash
cd server
npm run dev
```
- The server will run on `http://localhost:5000`.
- Look for `Connected to Supabase PostgreSQL` in the console.
- **Note**: "Native Risk Engine not found" warnings are expected and mean the fallback is working correctly.

### Start the Frontend Client
```bash
cd client
npm run dev
```
- The client will run on `http://localhost:5173` (default Vite port).
- Open your browser to the provided URL.

## Troubleshooting
- **Missing Module Error**: Ensure you have run `npm install` in both directories.
- **Node Version**: If you see errors related to `@splinetool/react-spline`, please upgrade Node.js to v22.
- **Environment Variables**: Ensure `server/.env` and `client/.env` files exist with the correct keys.
