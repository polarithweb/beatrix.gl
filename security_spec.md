# Polarith Gamerz — Firestore Security Specification

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every path not explicitly matched under `/listings/{listingId}` or `/orders/{orderId}` is unconditionally denied (`allow read, write: if false;`).
2. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) enforces `isValidId(id)` (`1..128` chars matching `^[a-zA-Z0-9_\-]+$`). `list` operations do not invoke `isValidId` on the collection path variable.
3. **Strict Schema & Anti-Shadow-Field Gate**:
   - `Listing` documents must contain only `['title', 'game', 'category', 'price', 'sellerId', 'sellerName', 'verified', 'status', 'deliveryTime', 'createdAt', 'updatedAt']` and require all except `updatedAt` on creation.
   - `Order` documents must contain strictly `['listingId', 'listingTitle', 'game', 'price', 'buyerId', 'sellerId', 'status', 'createdAt']`.
4. **Identity & Verified Email Integrity**:
   - All write operations require `request.auth != null && request.auth.token.email_verified == true`.
   - `Listing.sellerId` must strictly equal `request.auth.uid`.
   - `Order.buyerId` must strictly equal `request.auth.uid` and cannot equal `Order.sellerId`.
5. **Temporal Integrity**:
   - On `create`, `createdAt == request.time`.
   - On `update`, `updatedAt == request.time` and `createdAt == resource.data.createdAt`.
6. **Terminal State Locking**:
   - Once a `Listing` reaches `status == 'sold'`, no further updates are permitted.
   - `Order` documents are created in terminal state `status == 'completed'` and forbid all updates and deletions.
7. **Relational & Query Enforcement**:
   - Creating an `Order` verifies via `exists()` and `get()` that the referenced `/listings/{listingId}` exists, has `status == 'active'`, and matches `price` and `sellerId`.
   - `list` queries on `/listings` require `resource.data.status == 'active' || resource.data.sellerId == request.auth.uid`.
   - `list` queries on `/orders` require `resource.data.buyerId == request.auth.uid || resource.data.sellerId == request.auth.uid`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Identity Spoofing (`sellerId` mismatch)**: Authenticated user `uid_attacker` creates a `Listing` with `sellerId: "uid_victim"`. Expected: `PERMISSION_DENIED`.
2. **Payload 2 — Unverified Email Spoof**: Authenticated user with `email_verified: false` attempts to create a `Listing`. Expected: `PERMISSION_DENIED`.
3. **Payload 3 — Shadow / Ghost Field Injection on Create**: Creating a `Listing` with an extra undeclared field `isFeatured: true`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 — Shadow / Ghost Field Injection on Update**: Updating a `Listing` with `affectedKeys` containing `verified: true` or an arbitrary field `adminNote: "hacked"`. Expected: `PERMISSION_DENIED`.
5. **Payload 5 — String Boundary / Denial-of-Wallet Overflow**: Creating a `Listing` where `title` has 500 characters (`> 120` max). Expected: `PERMISSION_DENIED`.
6. **Payload 6 — Invalid Category Enum**: Creating a `Listing` with `category: "Illegal Mods"`. Expected: `PERMISSION_DENIED`.
7. **Payload 7 — Negative or Zero Price Manipulation**: Creating or updating a `Listing` with `price: -25` or `price: 0`. Expected: `PERMISSION_DENIED`.
8. **Payload 8 — Forged Client Timestamp**: Creating a `Listing` with a past or future `createdAt` timestamp not equal to `request.time`. Expected: `PERMISSION_DENIED`.
9. **Payload 9 — Terminal State Re-opening**: Updating a `Listing` whose existing `status` is `'sold'` back to `'active'`. Expected: `PERMISSION_DENIED`.
10. **Payload 10 — Immortal Field Mutation**: Updating `sellerId`, `game`, `category`, or `createdAt` on an existing `Listing`. Expected: `PERMISSION_DENIED`.
11. **Payload 11 — Orphaned / Price-Tampered Order Creation**: Creating an `Order` referencing a non-existent `listingId` or passing a lower `price` than the parent `Listing.price`. Expected: `PERMISSION_DENIED`.
12. **Payload 12 — Unauthorized Order Read / List Scraping**: Authenticated user `uid_stranger` attempting `get` or `list` on `/orders` belonging to `uid_buyer` and `uid_seller`. Expected: `PERMISSION_DENIED`.
