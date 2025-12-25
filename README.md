# POTM API (Backend)

The **Programmer of the Month (POTM) API** serves as the backend for the competitive coding platform. It manages user authentication, tournament data, scoring, and the global leaderboard.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (Development) / Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **Security:** Helmet, Bcrypt

## ✨ Key Features

- **Authentication System:**
  - Secure Registration & Login.
  - JWT-based session management.
  - **Role-Based Access Control (RBAC):** Distinction between `USER` and `ADMIN`.
  - **Auto-Admin:** The first registered user is automatically assigned the `ADMIN` role.

- **Tournament Management:**
  - Create, view, and manage coding tournaments.
  - Track tournament status (`UPCOMING`, `ACTIVE`, `COMPLETED`).
  - Support for tasks, points, and prize pools.

- **Leaderboard & Scoring:**
  - Global leaderboard ranking users by total points.
  - Real-time score aggregation.
  - Public user profiles with service history.

- **Admin Panel API:**
  - Endpoints for creating tournaments.
  - User management (promote/demote, manual point adjustments).

## 🚀 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Database Setup:**
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The server typically starts on `http://localhost:3001`.

## 📂 Project Structure

- `src/controllers`: Request logic (Auth, Home, Admin, Tournaments).
- `src/routes`: API route definitions.
- `src/middleware`: Auth and Admin verification.
- `src/lib`: Prisma client instance.
- `prisma/schema.prisma`: Database schema definition.
