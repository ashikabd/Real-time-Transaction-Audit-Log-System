# Fund Transfer System (Full Stack Assignment)

## Project Overview

This project is a full-stack fund transfer system which demonstrates secure, atomic money transfers between users with an immutable audit trail, using modern backend and frontend technologies.

Important Links

GitHub Repository: [[(https://github.com/ashikabd/fund-transfer-app)](https://github.com/ashikabd/fund-transfer-app)]
Video Walkthrough: [Add your video link here (YouTube/Google Drive)]

### Implementation Approach

* **Backend**: Node.js + Express.js with PostgreSQL
  * Implements ACID-compliant transactions
  * JWT-based authentication
  * Uses database-level constraints and migrations
  * Maintains an immutable audit log for every transfer
* **Frontend**: React + Tailwind CSS
  * User authentication with JWT token management
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

**Default seeded users:**
- Username: `alice` | Password: `password123` | Balance: $1000
- Username: `bob` | Password: `password123` | Balance: $500
- Username: `charlie` | Password: `password123` | Balance: $750

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

### Troubleshooting

**Issue**: Database connection failed
- **Solution**: Verify PostgreSQL is running and credentials in `.env` are correct

**Issue**: Port already in use
- **Solution**: Change `PORT` in backend `.env` or kill the process using the port

**Issue**: JWT token expired
- **Solution**: Log out and log back in to get a fresh token

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All endpoints except `/auth/login` require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Endpoints

#### 1. Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "alice",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "alice",
    "name": "Alice Johnson",
    "balance": 1000
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

#### 2. Get All Users

```
GET /users
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "username": "alice",
    "name": "Alice Johnson",
    "balance": 1000
  },
  {
    "id": 2,
    "username": "bob",
    "name": "Bob Smith",
    "balance": 500
  }
]
```

---

#### 3. Get Single User

```
GET /users/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "alice",
  "name": "Alice Johnson",
  "balance": 1000,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

#### 4. Transfer Money 🔹

```
POST /transfer
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 50
}
```

**Success Response (200):**
```json
{
  "message": "Transfer successful",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "newBalance": 950
}
```

**Error Responses:**

*Insufficient Balance (400):*
```json
{
  "error": "Insufficient balance"
}
```

*Invalid Amount (400):*
```json
{
  "error": "Amount must be greater than 0"
}
```

*User Not Found (404):*
```json
{
  "error": "Sender or receiver not found"
}
```

---

#### 5. Get Transaction History

```
GET /audit/:userId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": 1,
    "receiver_id": 2,
    "amount": 50,
    "status": "SUCCESS",
    "created_at": "2024-01-15T14:23:45Z"
  }
]
```

---

### Example cURL Commands

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}'
```

**Transfer Money:**
```bash
curl -X POST http://localhost:5000/api/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"senderId":1,"receiverId":2,"amount":50}'
```

---

## Database Schema

### Visual Representation

```
┌─────────────────────────┐
│         users           │
├─────────────────────────┤
│ id (PK)        SERIAL   │
│ username       TEXT     │
│ name           TEXT     │
│ password       TEXT     │
│ balance        NUMERIC  │
│ created_at     TIMESTAMP│
└─────────────────────────┘
           │
           │ (1:N)
           │
           ▼
┌─────────────────────────────┐
│      audit_logs             │
├─────────────────────────────┤
│ transaction_id (PK)  UUID   │
│ sender_id (FK)       INT    │────┐
│ receiver_id (FK)     INT    │────┤ References users(id)
│ amount               NUMERIC│    │
│ status               TEXT   │    │
│ created_at           TIMESTAMP   │
└─────────────────────────────┘────┘
```

### Table Details

#### **users**

| Column     | Type        | Constraints         | Description           |
| ---------- | ----------- | ------------------- | --------------------- |
| id         | SERIAL      | PRIMARY KEY         | User ID               |
| username   | TEXT        | UNIQUE, NOT NULL    | Unique username       |
| name       | TEXT        | NOT NULL            | Full name             |
| password   | TEXT        | NOT NULL            | Hashed password       |
| balance    | NUMERIC     | DEFAULT 0, CHECK ≥ 0| Current balance       |
| created_at | TIMESTAMP   | DEFAULT NOW()       | Account creation time |

---

#### **audit_logs**

| Column         | Type      | Constraints       | Description                   |
| -------------- | --------- | ----------------- | ----------------------------- |
| transaction_id | UUID      | PRIMARY KEY       | Unique transaction identifier |
| sender_id      | INT       | FOREIGN KEY, NOT NULL | Sender user ID          |
| receiver_id    | INT       | FOREIGN KEY, NOT NULL | Receiver user ID        |
| amount         | NUMERIC   | NOT NULL, CHECK > 0 | Transfer amount             |
| status         | TEXT      | NOT NULL          | SUCCESS / FAILED              |
| created_at     | TIMESTAMP | DEFAULT NOW()     | Transaction timestamp         |

**Constraints:**
- `sender_id` and `receiver_id` reference `users(id)` with `ON DELETE CASCADE`
- The `audit_logs` table is **immutable** — records cannot be updated or deleted (enforced at application level)
- All successful transfers must appear in this log

---

## AI Tool Usage Log

### AI Tools Used

* **Claude (Anthropic)** - Primary assistant for architecture and debugging
* **ChatGPT (OpenAI)** - Secondary assistant for specific code generation

---

### AI-Assisted Tasks

1. **Generated JWT authentication middleware** - Created token validation logic in `authMiddleware.js`
2. **Built PostgreSQL transaction wrapper** - Implemented atomic `BEGIN...COMMIT/ROLLBACK` for `/transfer` endpoint
3. **Created database migration scripts** - Generated schema with proper constraints and relationships
4. **Debugged PostgreSQL connection pooling errors** - Resolved "too many connections" issue
5. **Generated React authentication components** - Created `Login.jsx` and `Register.jsx` with JWT token management
6. **Built sortable transaction history table** - Implemented `TransactionHistory.jsx` with client-side sorting
7. **Fixed CORS configuration issues** - Resolved preflight errors between frontend and backend
8. **Designed responsive UI with Tailwind CSS** - Created mobile-first dashboard layout
9. **Generated seed data script** - Created test users with initial balances
10. **Created comprehensive API documentation** - Wrote endpoint specifications with request/response examples

---

### Effectiveness Score

**4.5 / 5**

#### Justification

AI tools proved highly effective throughout the development process:

**Strengths:**
- **Time Savings**: Reduced development time by approximately 40%, especially in boilerplate generation and debugging
- **Quality**: Generated code followed best practices (ACID transactions, proper error handling, security patterns)
- **Learning**: AI explanations helped understand PostgreSQL transaction isolation levels and JWT authentication flow
- **Debugging**: Particularly effective in resolving PostgreSQL authentication errors and CORS configuration issues

**Areas Requiring Manual Work:**
- **Business Logic Validation**: Needed manual review to ensure transfer logic met atomicity requirements
- **Security Hardening**: Had to manually verify JWT secret handling and SQL injection prevention
- **Testing**: AI-generated test cases needed refinement for edge cases
- **Architecture Decisions**: High-level design choices (tech stack, database selection) required human judgment

**Specific Example**: When implementing the `/transfer` endpoint, AI generated the basic transaction structure in 2 minutes, but debugging a race condition in concurrent transfers took an additional 30 minutes of manual work.

---

## Demo Video

**Video Demonstration**: [Watch Demo Video](#)

> 📹 *The video demonstrates the complete user flow including registration, login, fund transfers, and viewing transaction history.*

---

## Features Summary

✅ Secure user authentication with JWT  
✅ Atomic fund transfers with ACID compliance  
✅ Immutable audit logging  
✅ Real-time balance updates  
✅ Clean React UI with sorting & history  
✅ PostgreSQL-backed transactions  
✅ Comprehensive error handling  
✅ RESTful API design  

---

## Project Structure

```
root
├── backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── migrations/
│   ├── seeds/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Future Enhancements

- Add transaction reversal/refund functionality
- Implement role-based access control (admin/user)
- Add email notifications for transfers
- Implement rate limiting for API endpoints
- Add comprehensive unit and integration tests
- Deploy to cloud platform (AWS/Heroku)

---

**Developed by**: Ashika Babydasan
**Submission Date**: 22/12/2025  
**Contact**: ashikababydasan@gmail.com
