# 📄 UPDATED PRODUCT REQUIREMENTS DOCUMENT (PRD)

# **Ledger-Based Digital Wallet & Payment Processing System (LDWPS)**

**Version:** 1.0
**Author:** Backend Engineering
**Stack:** Node.js (JavaScript), Express.js, PostgreSQL, Prisma ORM
**Date:** March 2026

---

# 1. 🧭 PRODUCT OVERVIEW

## 1.1 Objective

Build a **secure, auditable, and transaction-safe digital wallet system** that enables users to:

- Store funds
- Transfer money
- Maintain verifiable financial records
- Support identity verification (KYC)
- Detect and respond to fraud
- Enforce controlled administrative actions

---

## 1.2 Core Principles

1. **Ledger is the source of truth**
2. **All financial operations are atomic**
3. **Every transaction is traceable and auditable**
4. **No duplicate or inconsistent state allowed**
5. **Strict role-based control with escalation boundaries**
6. **High-risk operations require elevated authorization**

---

# 2. 👥 USER ROLES & ACCESS CONTROL

## 2.1 Role Hierarchy

```text
SUPER_ADMIN > ADMIN > USER
```

---

## 2.2 Role Definitions

### 👤 USER

- Register & authenticate
- Perform wallet operations
- Transfer funds
- View personal transactions

---

### 🛠️ ADMIN

- View users and transactions
- Monitor system activity
- Flag suspicious transactions
- Freeze or suspend user accounts
- Initiate transaction reversal requests (cannot execute)

---

### 🔥 SUPER_ADMIN (Highly Privileged Role)

**This role has restricted access and must be tightly controlled.**

Capabilities:

- Approve and execute transaction reversals
- Unfreeze or reinstate accounts
- Override fraud flags
- Access full system audit logs
- Manage ADMIN roles and permissions

---

## 2.3 Access Control Requirements

- All routes must enforce **role-based authorization**
- High-risk operations require **SUPER_ADMIN privileges**
- All ADMIN and SUPER_ADMIN actions must be **logged and auditable**

---

# 3. 🔐 AUTHENTICATION & AUTHORIZATION

## 3.1 Features

- User registration & login
- JWT-based authentication:
  - Access token
  - Refresh token

- Role-based access control (RBAC)

---

## 3.2 Security Requirements

- Password hashing using bcrypt
- Configurable salt rounds (default: 10)
- Token expiration & refresh mechanism

---

# 4. 🪪 KYC & IDENTITY MANAGEMENT

## 4.1 Required Data

- Email
- Password
- NIN (National Identification Number)
- BVN (Bank Verification Number)

---

## 4.2 Storage Rules

Sensitive data must be secured:

| Field   | Storage                  |
| ------- | ------------------------ |
| NIN     | Hashed                   |
| BVN     | Hashed                   |
| NIN/BVN | Store last 4 digits only |

---

## 4.3 KYC Status Flow

- `UNVERIFIED`
- `PENDING`
- `VERIFIED`
- `REJECTED`

---

## 4.4 Constraints

- Prevent duplicate identity usage
- Ensure verification integrity

---

# 5. 💼 WALLET SYSTEM

## 5.1 Rules

- One wallet per user
- Balance is derived from ledger
- No direct balance mutation allowed

---

## 5.2 Constraints

- No negative balances
- All updates must occur within DB transactions

---

# 6. 📒 LEDGER SYSTEM

## 6.1 Definition

A double-entry accounting system tracking all financial movements.

---

## 6.2 Rules

- Every transaction must generate:
  - Debit entry
  - Credit entry

---

## 6.3 Properties

- Immutable (no updates or deletes)
- Fully auditable

---

# 7. 💸 TRANSACTION SYSTEM

## 7.1 Types

- DEPOSIT
- TRANSFER
- WITHDRAWAL (optional)
- REVERSAL

---

## 7.2 Status Lifecycle

- `PENDING`
- `SUCCESS`
- `FAILED`
- `REVERSED`

---

## 7.3 Requirements

- Unique transaction reference
- Idempotency support
- Atomic execution

---

# 8. 🔁 IDEMPOTENCY SYSTEM

## 8.1 Purpose

Prevent duplicate financial operations.

---

## 8.2 Requirements

- Each request includes an `Idempotency-Key`
- Stored with:
  - Response body
  - Status code

---

## 8.3 Behavior

- Duplicate key → return original response
- No duplicate effects allowed

---

# 9. 💳 CORE OPERATIONS

---

## 9.1 Fund Wallet

- Validate amount
- Create transaction
- Create CREDIT ledger entry
- Update balance

---

## 9.2 Transfer Funds

### Rules:

- Cannot transfer to self
- Must have sufficient balance
- Must be atomic

### Steps:

1. Validate idempotency
2. Lock sender wallet
3. Validate balance
4. Lock receiver wallet
5. Create transaction
6. Create ledger entries
7. Update balances
8. Commit

---

## 9.3 Transaction Reversal (Controlled Operation)

### Initiation:

- ADMIN can request reversal

### Execution:

- ONLY SUPER_ADMIN can approve and execute

---

### Conditions:

- Transaction must be SUCCESS
- Must not already be reversed

---

### Behavior:

- Create REVERSAL transaction
- Create opposite ledger entries
- Maintain audit logs

---

# 10. 🚨 FRAUD DETECTION & ACCOUNT CONTROL

## 10.1 Fraud Indicators

- Rapid repeated transactions
- Unusual transaction patterns
- Multiple failed attempts

---

## 10.2 System Actions

- Flag account
- Freeze wallet
- Notify administrators

---

## 10.3 Account States

- ACTIVE
- FROZEN
- SUSPENDED

---

## 10.4 Role Responsibilities

- ADMIN: detect & flag
- SUPER_ADMIN: override & resolve

---

# 11. 📊 AUDIT LOGGING SYSTEM

## 11.1 Purpose

Track all sensitive and high-impact actions.

---

## 11.2 Logged Actions

- Authentication events
- Transfers
- Reversals
- Account status changes
- Role changes (ADMIN/SUPER_ADMIN actions)

---

## 11.3 Requirements

- Immutable logs
- Timestamped
- Linked to userId

---

# 12. 🛡️ API SECURITY

## 12.1 Measures

- JWT middleware
- Role guards
- Input validation
- Secure headers (Helmet)
- CORS restrictions

---

## 12.2 Rate Limiting

| Route Type | Limit     |
| ---------- | --------- |
| Auth       | 5/min     |
| Transfers  | 10/min    |
| Global     | 100/15min |

---

# 13. ⚙️ ERROR HANDLING

## 13.1 Requirements

- Centralized error handling
- No sensitive data leakage

---

## 13.2 Response Format

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

---

## 13.3 Status Codes

- Must be defined in constants
- No hardcoding allowed

---

# 14. 🗄️ DATABASE REQUIREMENTS

## 14.1 Database

- PostgreSQL

---

## 14.2 Requirements

- ACID compliance
- Row-level locking
- Transaction support

---

## 14.3 Data Integrity

- Unique constraints:
  - email
  - transaction reference
  - idempotency key

- Monetary precision enforcement

---

# 15. 🧱 PROJECT STRUCTURE

```plaintext
src/
├── controllers/
├── routes/
├── services/
├── repositories/
├── models/
├── middlewares/
├── utils/
├── config/
├── db/
├── app.js
└── server.js
```

---

# 16. 📘 API DOCUMENTATION

- Swagger or Postman
- Include request/response examples
- Include authentication details

---

# 17. 📦 DELIVERABLES

- GitHub repository
- README (setup + architecture)
- API documentation
- `.env.example`

---

# 18. ✅ SUCCESS CRITERIA

The system is successful if:

- No duplicate or inconsistent transactions occur
- Ledger fully explains all balances
- Concurrency is handled safely
- Sensitive data is secured
- Fraud is detectable and manageable
- Admin actions are controlled and auditable
- Super Admin actions are restricted, logged, and traceable

---
