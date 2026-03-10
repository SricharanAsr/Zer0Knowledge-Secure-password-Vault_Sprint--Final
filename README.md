# Zero Vault 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)
![Security](https://img.shields.io/badge/security-Zero--Knowledge-orange.svg)

**Zero Vault** is a state-of-the-art, secure password management platform built with a **Zero-Knowledge Architecture**. It ensures that your sensitive data is encrypted client-side using industry-standard AES-GCM encryption before ever leaving your device. 

The platform features a native C++ **Risk Engine** for high-performance security evaluations and a robust synchronization system powered by **Supabase**.

---

## 🌟 Key Features

- **🔒 Zero-Knowledge Security**: AES-GCM (256-bit) encryption happens entirely in your browser. Your master password and raw data are never transmitted.
- **🛡️ Adaptive Risk Engine**: Integrated C++ native addon for real-time risk assessment (Secure Boot verification, Device Trust, and Brute-force detection).
- **⚡ Automated JS Fallback**: Intelligent build system that automatically switches to a JavaScript security engine if native compilation is unavailable.
- **☁️ Supabase Integration**: Reliable cloud synchronization and storage using PostgreSQL and Supabase Auth.
- **📱 Responsive UI**: A premium, dark-mode first interface built with React 19, Framer Motion, and Tailwind CSS.
- **✨ 3D Visuals**: Immersive experience with Spline 3D integrations.

---

## 🏗️ Technical Architecture

Zero Vault uses a decoupled architecture to ensure maximum security and performance.

### Security Model
1. **Client-Side Encryption**: Derived keys (PBKDF2) never leave the browser.
2. **Native Risk Engine**: A low-level C module handles sensitive security decisions.
3. **Database Security**: Row Level Security (RLS) policies in Supabase prevent unauthorized data access.

### System Diagram
```mermaid
graph TD
    A[React Frontend] -->|Encrypted Data| B[Express API Server]
    B -->|Query/Auth| C[(Supabase PostgreSQL)]
    B -->|Evaluation Signals| D{Risk Engine}
    D -->|Native| E[.node C++ Addon]
    D -->|Fallback| F[JS Logic]
    A -->|3D Assets| G[Spline Runtime]
```

---

## 💻 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Spline.
- **Backend**: Node.js, Express, TypeScript.
- **Database/Auth**: Supabase (PostgreSQL).
- **Native**: C++, Node-API (node-gyp).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.19+` or `v22.x` (Required for Vite & Spline compatibility)
- **NPM**: `v10.x+`
- **Compiler**: Visual Studio Build Tools (C++) *Optional* — only if you want to build the native addon.

### Installation

1. **Clone & Navigate**
   ```bash
   cd Secure_Password_Manager_Extension/App/secure_password_demo
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install --legacy-peer-deps
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   npm install --legacy-peer-deps
   ```

### Configuration
Ensure you have `.env` files in both `client/` and `server/` with the following keys:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🛠️ Running the Application

### 1. Start the Backend
```bash
cd server
npm run dev
```
*Note: You may see a "Native Risk Engine not found" message. This is expected as the system automatically defaults to the JavaScript fallback.*

### 2. Start the Frontend
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Development & Testing

- **Backend Tests**: `cd server && npm test` (Jest)
- **Frontend Tests**: `cd client && npm test` (Vitest)
- **Build Native**: `npm run build:addon` (Requires C++ compiler)

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing
Zero Vault is a research-focused project. Pull requests are welcome for security enhancements and performance optimizations.
