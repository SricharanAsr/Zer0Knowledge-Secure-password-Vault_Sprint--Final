# Deployment Guide 🚀

This guide provides instructions for deploying the **Zero Vault** project to production using **Render** for the backend and **Vercel** for the frontend.

---

## 1. Backend Deployment (Render)

### Steps:
1.  **Create a New Web Service**: Connect your GitHub repository.
2.  **Root Directory**: `server`
3.  **Environment**: `Node`
4.  **Build Command**: `npm install && npm run build`
5.  **Start Command**: `npm start`
6.  **Add Environment Variables**:
    *   `PORT`: `5000` (Render will override this, but good to have)
    *   `JWT_SECRET`: Random long string for signing tokens.
    *   `SUPABASE_URL`: Your Supabase Project URL.
    *   `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.
    *   `FRONTEND_URL`: `https://your-frontend-app.vercel.app`

---

## 2. Frontend Deployment (Vercel)

### Steps:
1.  **New Project**: Import your GitHub repository.
2.  **Root Directory**: `client`
3.  **Framework Preset**: `Vite`
4.  **Build Command**: `npm run build`
5.  **Output Directory**: `dist`
6.  **Add Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-app.onrender.com/api`
    *   `VITE_SUPABASE_URL`: Your Supabase Project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

---

## 3. Post-Deployment Verification
1.  Once both are deployed, update the `FRONTEND_URL` in Render to match your Vercel URL.
2.  Update the `VITE_API_URL` in Vercel to match your Render URL.
3.  Ensure your Supabase project allows connections from both production domains in its CORS settings (if applicable).

---

## Environment Variable Summary

| Variable | Source | Used In | Purpose |
| :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Manual | Server | Signing JWT tokens |
| `SUPABASE_URL` | Supabase | Both | Connection to DB/Auth |
| `SUPABASE_ANON_KEY` | Supabase | Both | Client-side Supabase access |
| `FRONTEND_URL` | Vercel | Server | CORS configuration |
| `VITE_API_URL` | Render | Client | Backend API endpoint |
