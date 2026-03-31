# 🏗️ SYSTEM DESIGN DOCUMENT (SSD)

**Ledger-Based Digital Wallet & Payment System (LDWPS)**

**Version:** 1.0
**Architecture:** Layered (Controller → Service → Repository → DB)
**Database:** PostgreSQL
**ORM:** Prisma
**Language:** JavaScript (Node.js)

---

# 1. 🧱 HIGH-LEVEL ARCHITECTURE

```text
Client → Routes → Controllers → Services → Repositories → Database
                                     ↓
                                 Utilities
                                     ↓
                               Middleware Layer
```

---

## 1.1 Layer Responsibilities

### Controllers

- Handle HTTP request/response
- Call services
- No business logic

---

### Services (CORE LOGIC)

- Business rules
- Transaction handling
- Validation (domain-level)
- Calls repositories

---

### Repositories

- Database queries only
- No business logic

---

### Middleware

- Auth (JWT)
- Role guards
- Rate limiting
- Error handling

---

# 2. 🗄️ DATABASE DESIGN (PRISMA-ALIGNED)

---

## 2.1 User

```js
User {
  id
  email (unique)
  password
  role (USER | ADMIN | SUPER_ADMIN)

  ninHash
  ninLast4

  bvnHash
  bvnLast4

  kycStatus
  accountStatus (ACTIVE | FROZEN | SUSPENDED)

  createdAt
}
```

---

## 2.2 Wallet

```js
Wallet {
  id
  userId (unique)
  balance (Decimal)
  createdAt
}
```

---

## 2.3 Transaction

```js
Transaction {
  id
  reference (unique)
  idempotencyKey (unique)

  type (DEPOSIT | TRANSFER | REVERSAL)
  status (PENDING | SUCCESS | FAILED | REVERSED)

  amount (Decimal)

  senderWalletId
  receiverWalletId

  createdAt
}
```

---

## 2.4 LedgerEntry (CRITICAL)

```js
LedgerEntry {
  id
  walletId
  transactionId

  type (DEBIT | CREDIT)
  amount
  balanceAfter

  createdAt
}
```

---

## 2.5 Idempotency

```js
Idempotency {
  id
  key (unique)
  responseBody
  statusCode
  createdAt
}
```

---

## 2.6 AuditLog

```js
AuditLog {
  id
  userId
  action
  metadata (JSON)
  createdAt
}
```

---

## 2.7 FraudFlag

```js
FraudFlag {
  id
  userId
  reason
  resolved (boolean)
  createdAt
}
```

---

# 3. 🔁 CORE SYSTEM FLOWS

---

# 3.1 🧾 FUND WALLET (DEPOSIT FLOW)

```text
1. Validate request
2. Check idempotency
3. BEGIN TRANSACTION

4. Create transaction (PENDING)

5. Lock wallet (FOR UPDATE)

6. Create ledger entry (CREDIT)

7. Update wallet balance

8. Mark transaction SUCCESS

9. Store idempotency response

10. COMMIT
```

---

# 3.2 💸 TRANSFER FLOW (CRITICAL PATH)

```text
1. Validate request
2. Check idempotency

3. BEGIN TRANSACTION

4. Lock sender wallet (FOR UPDATE)
5. Validate balance

6. Lock receiver wallet

7. Create transaction (PENDING)

8. Create ledger entries:
   - Sender (DEBIT)
   - Receiver (CREDIT)

9. Update both balances

10. Mark transaction SUCCESS

11. Store idempotency response

12. COMMIT
```

---

# 3.3 🔁 REVERSAL FLOW (SUPER_ADMIN ONLY)

```text
1. Validate permissions

2. BEGIN TRANSACTION

3. Fetch original transaction
4. Validate not reversed

5. Create reversal transaction

6. Create opposite ledger entries:
   - Reverse sender/receiver

7. Update balances

8. Mark original as REVERSED

9. COMMIT
```

---

# 4. 🔒 CONCURRENCY CONTROL

## 4.1 Problem

Two requests attempt to spend same funds.

---

## 4.2 Solution

Use:

```sql
SELECT * FROM "Wallet"
WHERE id = $1
FOR UPDATE;
```

---

## 4.3 Guarantees

- Prevents double spending
- Ensures serialized execution

---

# 5. 🔁 IDEMPOTENCY DESIGN

---

## 5.1 Flow

```text
1. Check if key exists
2. If yes → return stored response
3. If no → process request
4. Store result
```

---

## 5.2 Edge Case Handling

- Partial failure → do NOT store success response
- Only store after successful commit

---

# 6. 🚨 FRAUD DETECTION SYSTEM

---

## 6.1 Detection Rules (Initial)

- > X transfers within Y seconds
- Repeated failed transactions
- Abnormal transaction size

---

## 6.2 Trigger Flow

```text
1. Detect anomaly
2. Create FraudFlag
3. Freeze account
4. Log audit event
```

---

## 6.3 Resolution

- ADMIN reviews
- SUPER_ADMIN resolves

---

# 7. 🛡️ SECURITY DESIGN

---

## 7.1 Authentication Middleware

- Verify JWT
- Attach user to request

---

## 7.2 Role Guard Middleware

```js
requireRole("ADMIN");
```

---

## 7.3 Rate Limiting

- Auth routes: strict
- Financial routes: moderate
- Global limit applied

---

## 7.4 Password Security

```js
bcrypt.hash(password, SALT_ROUNDS);
```

---

# 8. ⚙️ ERROR HANDLING DESIGN

---

## 8.1 Custom Error Class

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

---

## 8.2 Central Handler

- Catch all errors
- Return standardized response

---

# 9. 📊 LOGGING DESIGN

---

## 9.1 What to Log

- Requests
- Errors
- Transactions
- Admin actions

---

## 9.2 Audit vs Logs

| Type     | Purpose                   |
| -------- | ------------------------- |
| Logs     | Debugging                 |
| AuditLog | Compliance & traceability |

---

# 10. 🧠 DATA INTEGRITY RULES

---

## 10.1 MUST NEVER HAPPEN

- Negative balance (unless allowed)
- Missing ledger entry
- Duplicate transaction
- Partial writes

---

## 10.2 Enforced By

- DB transactions
- Unique constraints
- Service validation

---

# 11. 📡 API DESIGN STRUCTURE

---

## Auth

```text
POST /auth/register
POST /auth/login
```

---

## Wallet

```text
GET /wallet
POST /wallet/fund
```

---

## Transactions

```text
POST /transactions/transfer
GET /transactions
POST /transactions/reverse
```

---

# 12. ⚠️ FAILURE SCENARIOS (IMPORTANT)

---

## 12.1 Scenario: Crash after debit

Solution:

- Transaction rollback → no money lost

---

## 12.2 Scenario: Duplicate request

Solution:

- Idempotency → same response returned

---

## 12.3 Scenario: Concurrent transfers

Solution:

- Row locking → prevents overspending

---

## 12.4 Scenario: Partial system failure

Solution:

- Atomic DB transactions

---

# 13. 🚀 SCALABILITY CONSIDERATIONS

- Stateless API
- Horizontal scaling possible
- DB is bottleneck → optimized queries required

---

# 14. 🔐 SUPER ADMIN CONTROL DESIGN

---

## Restrictions

- Cannot be auto-created via public API
- Must be seeded or manually assigned

---

## Safeguards

- All actions logged
- Optional:
  - 2FA (future)
  - Approval workflows

---

# 🔥 FINAL REALITY CHECK

If you implement this SSD correctly:

- You’ve built a **mini fintech core system**
- You understand:
  - Transactions
  - Concurrency
  - Ledger accounting
  - System integrity

This is **not junior-level work anymore**.

---
