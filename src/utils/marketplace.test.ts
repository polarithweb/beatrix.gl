import test from 'node:test';
import assert from 'node:assert/strict';
import type { MarketplaceListing } from './marketplace.ts';
import {
  filterListings,
  validateNewListingInput,
  sanitizeListingPayload,
  formatPrice,
} from './marketplace.ts';

const TEST_FIXTURE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'test-1',
    title: 'Valorant Account NA',
    game: 'Valorant',
    category: 'Game Accounts',
    price: 100.0,
    sellerId: 'seller_1',
    sellerName: 'AlphaSeller',
    verified: true,
    status: 'active',
    deliveryTime: 'Instant',
  },
  {
    id: 'test-2',
    title: 'FC 25 Coins Pack',
    game: 'EA Sports FC 25',
    category: 'Game Coins',
    price: 45.0,
    sellerId: 'seller_2',
    sellerName: 'BetaSeller',
    verified: true,
    status: 'active',
    deliveryTime: '15 mins',
  },
];

test('filterListings filters empty and populated arrays accurately', () => {
  assert.deepEqual(filterListings([], 'All', ''), []);

  const all = filterListings(TEST_FIXTURE_LISTINGS, 'All', '');
  assert.equal(all.length, 2);

  const accounts = filterListings(TEST_FIXTURE_LISTINGS, 'Game Accounts', '');
  assert.equal(accounts.length, 1);

  const coins = filterListings(TEST_FIXTURE_LISTINGS, 'Game Coins', '');
  assert.equal(coins.length, 1);

  const valorantSearch = filterListings(TEST_FIXTURE_LISTINGS, 'All', 'valorant');
  assert.equal(valorantSearch.length, 1);
  assert.equal(valorantSearch[0].game, 'Valorant');

  const noMatch = filterListings(TEST_FIXTURE_LISTINGS, 'Gift Cards', 'Valorant');
  assert.equal(noMatch.length, 0);
});

test('validateNewListingInput enforces blueprint length, enum, and price constraints', () => {
  const valid = validateNewListingInput({
    title: 'Immortal 3 Valorant Account with Champions Vandal',
    game: 'Valorant',
    category: 'Game Accounts',
    price: '85.50',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});

  const invalid = validateNewListingInput({
    title: 'Hi',
    game: 'V',
    category: 'Invalid Category',
    price: '-10',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.game);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.price);
});

test('sanitizeListingPayload produces schema-compliant listing data', () => {
  const payload = sanitizeListingPayload(
    {
      title: '  50,000 VP Bundle Key  ',
      game: '  Valorant  ',
      category: 'Gift Cards',
      price: '49.999',
    },
    'user_123',
    'ProTrader',
    true
  );

  assert.equal(payload.title, '50,000 VP Bundle Key');
  assert.equal(payload.game, 'Valorant');
  assert.equal(payload.category, 'Gift Cards');
  assert.equal(payload.price, 50);
  assert.equal(payload.sellerId, 'user_123');
  assert.equal(payload.sellerName, 'ProTrader');
  assert.equal(payload.verified, true);
  assert.equal(payload.status, 'active');
});

test('formatPrice formats USD prices to two decimal places', () => {
  assert.equal(formatPrice(145), '$145.00');
  assert.equal(formatPrice(48.5), '$48.50');
});
