# Proposal: Checkout & Order Management

## Intent

Users can add products to cart but cannot complete a purchase. The "Proceder al pago" button is disabled. This change closes the gap between cart and order — users review items, enter shipping info, and create an order that decrements stock.

## Scope

### In Scope
- Enhanced Order model (OrderStatus enum, structured shipping fields, orderNumber)
- Server Action for order creation (validate session, recalculate from DB prices, check stock, create in transaction)
- Checkout page at `/checkout` with order summary + shipping form
- Order confirmation page at `/orden/[orderNumber]`
- Stock decrement + cart clearing on successful order

### Out of Scope
- Real payment integration (deferred)
- Admin order management
- Email notifications
- Order history / "My Orders" page

## Capabilities

### New Capabilities
- `checkout`: Order creation flow — checkout page, shipping form, Server Action, confirmation page, stock decrement

### Modified Capabilities
- `data-schema`: Order model enhanced — `status` changes from String to OrderStatus enum, `shippingAddress` split into structured fields, `orderNumber` added
- `shopping-cart`: Checkout Preparation requirement updated — deferred flag removed

## Approach

1. **Schema**: Replace `status String` → `OrderStatus` enum (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`). Split `shippingAddress String?` into `shippingName`, `shippingStreet`, `shippingCity`, `shippingProvince`, `shippingZip`, `shippingPhone`. Add `orderNumber Int` with auto-increment.
2. **Server Action** (`lib/actions/checkout.ts`): Reads items from request, queries DB for current prices/stock, validates stock across all items, creates Order + OrderItems in a Prisma transaction, decrements product stock. Returns orderNumber on success.
3. **Checkout page** (`/checkout`): Client component — reads cart from Zustand store, displays order summary, shipping form. On submit, calls Server Action, on success clears cart and redirects to confirmation.
4. **Confirmation page** (`/orden/[orderNumber]`): Server component — fetches order by number, displays details.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | OrderStatus enum, structured shipping, orderNumber |
| `src/lib/actions/checkout.ts` | New | Server Action — order creation |
| `src/app/checkout/page.tsx` | New | Checkout page with shipping form |
| `src/app/orden/[orderNumber]/page.tsx` | New | Order confirmation page |
| `src/store/cart-store.ts` | Modified | Wire clearCart for post-checkout |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stock race condition (two users buy last item) | Low | Prisma transaction + stock check inside; fail with user-friendly message |
| Schema migration with existing data | Low | Default enum value PENDING; orderNumber uses sequence, not cuid |

## Rollback Plan

1. `git checkout -- prisma/schema.prisma`
2. Delete new files (`Remove-Item -Recurse src/lib/actions src/app/checkout src/app/orden`)
3. `npx prisma db push` to restore previous schema

## Dependencies

- Zustand cart store (exists)
- Prisma Order/OrderItem models (exist, need enhancement)
- NextAuth v5 session (exists)

## Success Criteria

- [ ] Order is created in a transaction with recalculated prices + stock check
- [ ] Out-of-stock items cause the entire order to fail with a clear message
- [ ] Stock decrements correctly on successful order
- [ ] Cart clears after successful checkout
- [ ] Confirmation page displays order details
- [ ] `next build` succeeds with no TS errors
