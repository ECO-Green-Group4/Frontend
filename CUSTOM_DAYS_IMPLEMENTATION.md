# Implementation: Custom Days Purchase Feature

## ✅ Completed (Frontend)

### 1. UI - Input Field for Days
- Added input field to select number of days (1+)
- Real-time price calculation
- Visual feedback showing total amount

### 2. Payment Flow
- Payment page displays number of days
- Total amount shows correctly
- `packageAmount` is passed to backend

### 3. Code Changes

**Files Modified:**
- ✅ `src/pages/CreatePost.tsx`
- ✅ `src/pages/Payment.tsx`
- ✅ `src/services/PaymentService.ts`

**Key Changes:**
```typescript
// Payment.tsx
const listingDataWithDays = {
  ...formData.data,
  durationDays: paymentInfo.days || 1,
  packageAmount: paymentInfo.amount // ← Total amount
};

// PaymentService.ts
const requestData = {
  ...cleanData,
  packageAmount: cleanData.packageAmount // ← Pass to backend
};
```

## ⚠️ Known Issue

**Problem:** VNPay shows 2,000 ₫ instead of 20,000 ₫ when buying 10 days

**Root Cause:** Backend doesn't use `packageAmount` when creating listing package, uses fixed price from package.

**Status:** Frontend fixed, **Backend fix required**

## 📋 Backend Action Required

See `BACKEND_REQUIREMENT.md` for details.

Quick fix needed in backend:
- Either accept `packageAmount` field
- Or calculate: `amount = listingFee × durationDays`

## 🧪 Testing

### Before Backend Fix:
1. Create post with 10 days
2. Payment page shows: 20,000 ₫ ✅
3. VNPay shows: 2,000 ₫ ❌

### After Backend Fix:
1. Create post with 10 days
2. Payment page shows: 20,000 ₫ ✅
3. VNPay shows: 20,000 ₫ ✅

## 📁 Documentation Files

- `PAYMENT_AMOUNT_FIX.md` - Technical explanation of the fix
- `BACKEND_REQUIREMENT.md` - Backend implementation guide
- `CUSTOM_DAYS_IMPLEMENTATION.md` - This file

