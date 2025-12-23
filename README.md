# Fund Transfer System (Full Stack Assignment)

## Project Overview

This project is a full-stack fund transfer system which demonstrates secure, atomic money transfers between users with an immutable audit trail, using modern backend and frontend technologies.

### Implementation Approach

* **Backend**: Node.js + Express.js with PostgreSQL

  * Implements ACID-compliant transactions
  * Uses database-level constraints and migrations
  * Maintains an immutable audit log for every transfer
* **Frontend**: React + Tailwind CSS

  * User authentication
  * Real-time balance updates
  * Transaction history with sorting
* **Database**: PostgreSQL

  * Relational schema with foreign keys
  * Transaction safety using SQL transactions

---

## Setup & Run Instructions

### Prerequisites

Make sure the following are installed:

* Node.js (v18+ recommended)
* PostgreSQL (v14+)
* npm
* Git

---

### Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fund_transfer_db
JWT_SECRET=your_secret_key
```

#### Create Database

```sql
CREATE DATABASE fund_transfer_db;
```

#### Run Migrations

```bash
npm run migrate
```

#### Seed Initial Users (Optional)

```bash
npm run seed
```

#### Start Backend Server

```bash
npm start
```

Backend will run at:

```
http://localhost:5000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

> Ensure the backend is running before using the frontend.

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Users

#### Get All Users

```
GET /users
```

#### Get Single User

```
GET /users/:id
```

---

### Authentication

#### Login

```
POST /auth/login
```

**Body**

```json
{
  "username": "alice",
  "password": "password123"
}
```

---

### 🔹 Fund Transfer

#### Transfer Money

```
POST /transfer
```

**Body**

```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 50
}
```

**Response**

```json
{
  "message": "Transfer successful",
  "transactionId": "uuid"
}
```

---

### Audit Logs

#### Get Transaction History for User

```
GET /audit/:userId
```

---

## Database Schema

### **users**

| Column     | Type        | Description           |
| ---------- | ----------- | --------------------- |
| id         | SERIAL (PK) | User ID               |
| username   | TEXT        | Unique username       |
| name       | TEXT        | Full name             |
| password   | TEXT        | Hashed password       |
| balance    | NUMERIC     | Current balance       |
| created_at | TIMESTAMP   | Account creation time |

---

### **audit_logs**

| Column         | Type      | Description                   |
| -------------- | --------- | ----------------------------- |
| transaction_id | UUID (PK) | Unique transaction identifier |
| sender_id      | INT (FK)  | Sender user ID                |
| receiver_id    | INT (FK)  | Receiver user ID              |
| amount         | NUMERIC   | Transfer amount               |
| status         | TEXT      | SUCCESS / FAILED              |
| created_at     | TIMESTAMP | Transaction timestamp         |

> The `audit_logs` table is **immutable** — records cannot be updated or deleted.

---

## AI Tool Usage Log

### AI Tools Used

* **Claude**
* **ChatGPT**

### AI-Assisted Tasks

* Generated backend **Express.js boilerplate**
* Designed **REST API structure**
* Debugged **PostgreSQL authentication & migration errors**
* Assisted with **transaction-safe fund transfer logic**
* Helped design **React component structure**
* Debugged **frontend–backend integration**
* Assisted with **GitHub repository structure issues**
* Helped write **README and documentation**

### Effectiveness Score

**4.5 / 5**

**Justification:**
AI tools significantly reduced development time, especially for debugging PostgreSQL errors, structuring migrations, and building frontend logic. They were highly effective for rapid iteration while still requiring manual validation and architectural decision-making.

---

## Features Summary

* Secure user authentication
* Atomic fund transfers
* Immutable audit logging
* Real-time balance updates
* Clean React UI with sorting & history
* PostgreSQL-backed ACID transactions

---

## Project Structure

```
root
│── backend
│── frontend
│── .gitignore
│── package.json
│── README.md
```

Just say the word.
