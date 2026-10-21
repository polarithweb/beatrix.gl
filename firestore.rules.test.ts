import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

interface AuthContext {
  uid: string;
  email_verified: boolean;
}

interface RequestEnv {
  auth: AuthContext | null;
  time: number;
}

const VALID_CATEGORIES = [
  'Game Accounts',
  'Game Coins',
  'In-Game Currency',
  'Items & Skins',
  'Top Up',
  'Gift Cards',
  'Game Pal',
  'Coaching',
  'Boosting',
  'Software',
];

function isValidId(id: unknown): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_\-]+$/.test(id)
  );
}

function isValidListing(data: Record<string, unknown>, auth: AuthContext | null): boolean {
  if (!auth) return false;
  const required = [
    'title',
    'game',
    'category',
    'price',
    'sellerId',
    'sellerName',
    'verified',
    'status',
    'deliveryTime',
    'createdAt',
  ];
  const allowed = [...required, 'updatedAt'];
  const keys = Object.keys(data);

  if (!required.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => allowed.includes(k))) return false;

  return (
    typeof data.title === 'string' &&
    data.title.length >= 3 &&
    data.title.length <= 120 &&
    typeof data.game === 'string' &&
    data.game.length >= 2 &&
    data.game.length <= 60 &&
    typeof data.category === 'string' &&
    VALID_CATEGORIES.includes(data.category) &&
    typeof data.price === 'number' &&
    data.price > 0 &&
    data.price <= 10000 &&
    typeof data.sellerId === 'string' &&
    isValidId(data.sellerId) &&
    data.sellerId === auth.uid &&
    typeof data.sellerName === 'string' &&
    data.sellerName.length >= 2 &&
    data.sellerName.length <= 50 &&
    typeof data.verified === 'boolean' &&
    typeof data.status === 'string' &&
    ['active', 'sold'].includes(data.status) &&
    typeof data.deliveryTime === 'string' &&
    data.deliveryTime.length >= 2 &&
    data.deliveryTime.length <= 30 &&
    typeof data.createdAt === 'number' &&
    (!('updatedAt' in data) || typeof data.updatedAt === 'number')
  );
}

function evaluateListingCreate(
  listingId: string,
  incoming: Record<string, unknown>,
  req: RequestEnv
): 'ALLOW' | 'PERMISSION_DENIED' {
  const verifiedUser = req.auth !== null && req.auth.email_verified === true;
  if (
    verifiedUser &&
    isValidId(listingId) &&
    isValidListing(incoming, req.auth) &&
    incoming.verified === true &&
    incoming.status === 'active' &&
    incoming.createdAt === req.time &&
    !('updatedAt' in incoming)
  ) {
    return 'ALLOW';
  }
  return 'PERMISSION_DENIED';
}

function evaluateListingUpdate(
  listingId: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  req: RequestEnv
): 'ALLOW' | 'PERMISSION_DENIED' {
  const verifiedUser = req.auth !== null && req.auth.email_verified === true;
  if (!isValidListing(incoming, req.auth)) return 'PERMISSION_DENIED';
  if (!verifiedUser || !isValidId(listingId)) return 'PERMISSION_DENIED';
  if (existing.status === 'sold') return 'PERMISSION_DENIED';
  if (existing.sellerId !== req.auth?.uid) return 'PERMISSION_DENIED';
  if (incoming.sellerId !== existing.sellerId) return 'PERMISSION_DENIED';
  if (incoming.verified !== existing.verified) return 'PERMISSION_DENIED';
  if (incoming.createdAt !== existing.createdAt) return 'PERMISSION_DENIED';
  if (incoming.game !== existing.game) return 'PERMISSION_DENIED';
  if (incoming.category !== existing.category) return 'PERMISSION_DENIED';
  if (!('updatedAt' in incoming) || incoming.updatedAt !== req.time) {
    return 'PERMISSION_DENIED';
  }

  const allKeys = new Set([...Object.keys(existing), ...Object.keys(incoming)]);
  const affectedKeys = [...allKeys].filter((k) => existing[k] !== incoming[k]);

  const isEditAction =
    incoming.status === 'active' &&
    affectedKeys.every((k) => ['title', 'price', 'updatedAt'].includes(k));
  const isSoldAction =
    incoming.status === 'sold' &&
    affectedKeys.every((k) => ['status', 'updatedAt'].includes(k));

  return isEditAction || isSoldAction ? 'ALLOW' : 'PERMISSION_DENIED';
}

function evaluateOrderCreate(
  orderId: string,
  incoming: Record<string, unknown>,
  listingsDb: Record<string, Record<string, unknown>>,
  req: RequestEnv
): 'ALLOW' | 'PERMISSION_DENIED' {
  const verifiedUser = req.auth !== null && req.auth.email_verified === true;
  if (!verifiedUser || !isValidId(orderId)) return 'PERMISSION_DENIED';

  const required = [
    'listingId',
    'listingTitle',
    'game',
    'price',
    'buyerId',
    'sellerId',
    'status',
    'createdAt',
  ];
  const keys = Object.keys(incoming);
  if (
    !required.every((k) => keys.includes(k)) ||
    !keys.every((k) => required.includes(k))
  ) {
    return 'PERMISSION_DENIED';
  }

  const parentListing = listingsDb[String(incoming.listingId)];
  if (!parentListing) return 'PERMISSION_DENIED';

  if (
    isValidId(incoming.listingId) &&
    typeof incoming.listingTitle === 'string' &&
    incoming.listingTitle.length >= 3 &&
    incoming.listingTitle.length <= 120 &&
    typeof incoming.game === 'string' &&
    incoming.game.length >= 2 &&
    incoming.game.length <= 60 &&
    typeof incoming.price === 'number' &&
    incoming.price > 0 &&
    incoming.price <= 10000 &&
    isValidId(incoming.buyerId) &&
    incoming.buyerId === req.auth?.uid &&
    isValidId(incoming.sellerId) &&
    incoming.buyerId !== incoming.sellerId &&
    incoming.status === 'completed' &&
    incoming.createdAt === req.time &&
    parentListing.status === 'active' &&
    parentListing.price === incoming.price &&
    parentListing.sellerId === incoming.sellerId
  ) {
    return 'ALLOW';
  }

  return 'PERMISSION_DENIED';
}

function evaluateOrderRead(
  orderId: string,
  existing: Record<string, unknown>,
  req: RequestEnv
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (
    req.auth !== null &&
    isValidId(orderId) &&
    (existing.buyerId === req.auth.uid || existing.sellerId === req.auth.uid)
  ) {
    return 'ALLOW';
  }
  return 'PERMISSION_DENIED';
}

const SERVER_NOW = 1760000000000;
const BASE_VALID_LISTING = {
  title: 'Test Gaming Listing',
  game: 'Valorant',
  category: 'Game Accounts',
  price: 120,
  sellerId: 'uid_seller',
  sellerName: 'TestSeller',
  verified: true,
  status: 'active',
  deliveryTime: 'Instant',
  createdAt: SERVER_NOW,
};

test('firestore.rules file exists and enforces hardened primitives', () => {
  const rulesText = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');
  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('allow read, write: if false;'));
  assert.ok(rulesText.includes('isValidListing(incoming())'));
  assert.ok(rulesText.includes('isValidOrder(incoming())'));
});

test('Dirty Dozen #1: Identity Spoofing (sellerId mismatch) returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    { ...BASE_VALID_LISTING, sellerId: 'uid_victim' },
    { auth: { uid: 'uid_attacker', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #2: Unverified Email Spoof returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    BASE_VALID_LISTING,
    { auth: { uid: 'uid_seller', email_verified: false }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #3: Shadow / Ghost Field Injection on Create returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    { ...BASE_VALID_LISTING, isFeatured: true },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #4: Shadow / Ghost Field Injection on Update returns PERMISSION_DENIED', () => {
  const res = evaluateListingUpdate(
    'listing_1',
    BASE_VALID_LISTING,
    { ...BASE_VALID_LISTING, adminNote: 'injected', updatedAt: SERVER_NOW + 10 },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW + 10 }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #5: String Boundary Overflow (>120 chars title) returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    { ...BASE_VALID_LISTING, title: 'A'.repeat(500) },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #6: Invalid Category Enum returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    { ...BASE_VALID_LISTING, category: 'Illegal Mods' },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #7: Negative or Zero Price Manipulation returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    { ...BASE_VALID_LISTING, price: -25 },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #8: Forged Client Timestamp returns PERMISSION_DENIED', () => {
  const res = evaluateListingCreate(
    'listing_1',
    { ...BASE_VALID_LISTING, createdAt: SERVER_NOW - 99999 },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #9: Terminal State Re-opening (sold -> active) returns PERMISSION_DENIED', () => {
  const res = evaluateListingUpdate(
    'listing_1',
    { ...BASE_VALID_LISTING, status: 'sold' },
    { ...BASE_VALID_LISTING, status: 'active', updatedAt: SERVER_NOW + 50 },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW + 50 }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #10: Immortal Field Mutation (changing game on update) returns PERMISSION_DENIED', () => {
  const res = evaluateListingUpdate(
    'listing_1',
    BASE_VALID_LISTING,
    { ...BASE_VALID_LISTING, game: 'Steam', updatedAt: SERVER_NOW + 50 },
    { auth: { uid: 'uid_seller', email_verified: true }, time: SERVER_NOW + 50 }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #11: Orphaned or Price-Tampered Order Creation returns PERMISSION_DENIED', () => {
  const res = evaluateOrderCreate(
    'order_1',
    {
      listingId: 'listing_1',
      listingTitle: BASE_VALID_LISTING.title,
      game: BASE_VALID_LISTING.game,
      price: 1.0, // Tampered price != 120
      buyerId: 'uid_buyer',
      sellerId: 'uid_seller',
      status: 'completed',
      createdAt: SERVER_NOW,
    },
    { listing_1: BASE_VALID_LISTING },
    { auth: { uid: 'uid_buyer', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});

test('Dirty Dozen #12: Unauthorized Order Read by non-participant returns PERMISSION_DENIED', () => {
  const res = evaluateOrderRead(
    'order_1',
    {
      listingId: 'listing_1',
      buyerId: 'uid_buyer',
      sellerId: 'uid_seller',
      price: 120,
      status: 'completed',
    },
    { auth: { uid: 'uid_stranger', email_verified: true }, time: SERVER_NOW }
  );
  assert.equal(res, 'PERMISSION_DENIED');
});
