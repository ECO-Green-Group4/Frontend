# Functional Requirements

## 1. Authentication & Access Control

### 1.1 Login & Role Redirect
- **Function trigger**: User clicks `Sign in` on `Login.tsx`.
- **Function description**: USER/STAFF/ADMIN roles authenticate; the form runs `validateForm`, calls `AuthService.login`, updates `AuthContext`, and redirects based on role.
- **Screen layout**: EcoGreen logo, email/password form, sign-in button, forgot-password link.
- **Function details**: Validate email and required password; store `token`/`refreshToken` in `localStorage`; persist user state in context; helpers `isAdmin`/`isStaff` decide navigation to `/admin`, `/staff/orders`, or the previous route.

### 1.2 User Registration
- **Function trigger**: User clicks `Sign up` on `Register.tsx`.
- **Function description**: Visitors create a new account by filling personal information and submitting to `AuthService.register`.
- **Screen layout**: Multi-field form (username, full name, email, phone, ID number, date of birth, gender, address, password).
- **Function details**: `validationRules` and `VALIDATION_RULES` enforce required fields and regex checks; ensure password confirmation matches; parse backend validation errors for field-level feedback; on success, show toast and redirect to `/login`.

### 1.3 Password Recovery
- **Function trigger**: User chooses “Forgot password” or opens the reset dialog in `Profile.tsx`.
- **Function description**: Send OTP to email, enter OTP and new password.
- **Screen layout**: `/forgot-password` page and `Profile.tsx` dialog with two steps (send OTP, submit OTP + new password).
- **Function details**: Validate email format, enforce OTP length ≥ 4, require strong password (regex); call `AuthService.forgotPassword` and `AuthService.resetPassword`; display toasts and handle 401/404 errors gracefully.

## 2. Account Profile & Membership

### 2.1 Profile Management
- **Function trigger**: User visits `/profile` (ProtectedRoute).
- **Function description**: Display and edit personal information, sync updates with the backend.
- **Screen layout**: Header/Footer, user info card, edit dialog capturing phone, address, DOB, gender, ID number, plus reset-password button.
- **Function details**: `Profile.tsx` fetches `/auth/me`, binds data to the form; validates phone, date, and ID number; calls `updateProfileComplete`; refetches data and shows toast feedback.

### 2.2 Membership Purchase
- **Function trigger**: User opens `/membership` and selects a plan.
- **Function description**: Compare Standard/Premium/VIP tiers and prepare payment details when `Choose Plan` is pressed.
- **Screen layout**: Plan cards grid with pricing, feature list, call-to-action button.
- **Function details**: `createMembershipPaymentInfo` builds payload (id, name, amount, description) for `PaymentButton`; follows the common VNPay checkout flow.

## 3. Marketplace Browsing & Engagement

### 3.1 Main Listing Discovery
- **Function trigger**: User visits `/` or other public routes.
- **Function description**: Surface active EV/battery listings with hero banner and filters.
- **Screen layout**: `MainScreen.tsx` hero plus `VehiclePostCard` list.
- **Function details**: Call `api.get("/buyer/listings")`, show loading state, segment by category, render cards with image, price, and status badges.

### 3.2 Listing Detail View
- **Function trigger**: User opens `/description-ev/:id` or `/description-battery/:id`.
- **Function description**: Present full description, imagery, and technical specifications.
- **Screen layout**: Image gallery, technical details section, contact block.
- **Function details**: Fetch listing details by ID, provide fallbacks when data is missing; ProtectedRoute ensures only authenticated users access the page.

### 3.3 Favorites Management
- **Function trigger**: User visits `/favorited`.
- **Function description**: Display and remove saved listings.
- **Screen layout**: Gradient hero, favorite count, list of `VehiclePostCard`.
- **Function details**: `FavoriteService.getFavorites` / `removeFavorite`; convert API payload to card format; show toasts and skeleton loaders.

## 4. Listing Creation & Package Selection

### 4.1 Create Post Wizard
- **Function trigger**: Seller visits `/create-post` (ProtectedRoute).
- **Function description**: Choose EV/Battery category, pick a package, complete listing form.
- **Screen layout**: Category tabs, package selector, `VehicleForm` or `BatteryForm`.
- **Function details**: `useEffect` fetches `/seller/packages`; state manages `selectedPackageId` and `customDays`; enforce package selection before submit; form validates title, price, images, and raises `showToast` for missing data.

### 4.2 Listing Data Submission
- **Function trigger**: Seller submits `VehicleForm` / `BatteryForm`.
- **Function description**: Upload media to ImgBB, prepare payload, store draft for checkout.
- **Screen layout**: Multi-section form with uploader preview.
- **Function details**: `uploadImgBBMultipleFile` returns valid URLs; attach `packageId` and `category`; persist `pendingPostData` in `sessionStorage`; compute `paymentInfo` with `totalAmount = listingFee * customDays`; `navigate("/payment")`.

## 5. Payments & Transaction Handling

### 5.1 VNPay Checkout
- **Function trigger**: User clicks “Thanh toán VNPay” on `/payment`.
- **Function description**: Read `paymentInfo` from navigation state, validate staged data, request VNPay payment URL.
- **Screen layout**: Two-column layout—order summary and VNPay payment method.
- **Function details**: Verify `pendingPostData` in `sessionStorage`, ensure mandatory fields exist; call `PaymentService.createListingWithPackage` then `createVnPayPayment`; retry if URL expires; store `pendingListingId`, redirect to VNPay, emit toasts for status.

### 5.2 Post-Payment Fulfillment
- **Function trigger**: Successful VNPay callback (`/vnpay-callback`) or explicit call to `PostPaymentService.createPostAfterPayment`.
- **Function description**: Finalize listing creation, clear staged data, notify user.
- **Screen layout**: Background processing page.
- **Function details**: Read `pendingPostData`, map payload via `toVehiclePayload`/`toBatteryPayload`, POST to `/seller/listings/...`; clear session storage, show success toast, handle 401/validation errors.

### 5.3 VNPay Callback & Waiting Screen
- **Function trigger**: VNPay redirects the user to `/vnpay-callback`; after processing redirect to `/waiting`.
- **Function description**: Confirm payment status with backend, update listing state, and present a holding screen while admin reviews the submission.
- **Screen layout**: `VnPayCallback` shows success/error feedback with icons; `Waiting` page displays a hero card, customizable message, and “Back to Home” button.
- **Function details**: `PaymentService.handleVnPayFrontendCallback` validates response and forces listing status to `PENDING_APPROVAL`; stores/clears `pendingListingId`; on success navigates to `/waiting` with state message; handles response codes and network errors gracefully.

## 6. User Orders & Contracts

### 6.1 Transaction History
- **Function trigger**: Authenticated user opens `/history`.
- **Function description**: Review platform transactions with rich filtering and drill-down details.
- **Screen layout**: Header stats, filter card (role/status/date/amount), list of transaction cards, detail dialog.
- **Function details**: `TransactionService.getHistory` loads baseline data; `filterHistory` attempts server-side filtering, with client-side fallback via `applyLocalFilters`; supports keyword search, role (buyer/seller), date ranges, amount ranges; detail modal fetches `getDetail` for order specifics; status badges color-coded; summary metrics derived locally; toasts surface errors.

### 6.2 My Contracts Overview
- **Function trigger**: User visits `/my-contracts`.
- **Function description**: Display contracts associated with the current account and quick stats.
- **Screen layout**: Header with refresh, KPI cards (total/signed/unsigned/draft), list of contract cards with status badges and call-to-action buttons.
- **Function details**: Fetches `/contract/my-contracts` via Axios; handles 401 with login prompt and toast; date formatting helpers; each card shows signing status for buyer/seller and links to detail route `/my-contracts/:contractId`.

### 6.3 Contract Detail & Signing
- **Function trigger**: User opens `/my-contracts/:contractId`.
- **Function description**: Review contract meta, add-ons, sign with OTP, and pay outstanding add-on fees.
- **Screen layout**: Detail cards (status, parties, dates), add-on sections per payer, OTP input, payment buttons, navigation bar.
- **Function details**: Retrieves detail from `/contract/contractDetails/:id`; auto-detects user role (buyer/seller) to tailor UI; `ContractService.getContractOtp` sends OTP; signing posts to `/contract/sign` with role; handles add-on VNPay payments for buyer/seller via `/payments/contract/:id/addons/vnpay`; toasts for all outcomes; maintains loading state for OTP, signing, payments.

### 6.4 Notes on Upcoming Screens
- **ElectricVehicle**, **Battery**, and **ViewCart** routes currently render placeholder content (“Trang này sẽ được phát triển sau”) indicating roadmap items still under construction.

## 7. Administrative Operations

### 7.1 User Management
- **Function trigger**: Admin visits `/admin/users`.
- **Function description**: Search, filter, activate/deactivate users, change roles.
- **Screen layout**: `AdminLayout` with card list, status/role filters, action dropdowns.
- **Function details**: `UserService.getAllUsers` with mock fallback when API fails; `handleToggleStatus` adjusts activation; `handleChangeRole` switches between admin/user/staff; badges visualize status; toasts confirm outcomes.

### 7.2 Package Management
- **Function trigger**: Admin visits `/admin/packages`.
- **Function description**: CRUD for membership/listing packages.
- **Screen layout**: Card/table hybrid, add/edit dialogs, delete confirmations.
- **Function details**: `PackageService` exposes `getAllPackages`, `create/update/delete`; forms validate every field; toasts show errors; admin token required; supports search/filtering.

### 7.3 Listing Moderation
- **Function trigger**: Admin opens `/admin/posts`.
- **Function description**: Approve, reject, or deactivate user listings.
- **Screen layout**: Stats header, status/category filters, card grid, detail dialog (images, user, package info).
- **Function details**: `PostService.getAllPosts`, `updatePostStatus`, `deletePost`; handle payment-pending states, soft delete to `INACTIVE`; modal provides approve/reject actions with comprehensive metadata.

### 7.4 Order Assignment
- **Function trigger**: Admin visits `/admin/orders`.
- **Function description**: Review marketplace orders, search/filter them, and assign staff handlers.
- **Screen layout**: `OrderManagement` header with refresh, filter card (search box, status select, counter), list of order cards with buyer/seller info, assign dialog modal.
- **Function details**: `OrderService.getAllOrders` loads orders; `UserService.getStaffList` retrieves staff options; search filters by order ID, buyer/seller name/email; status filter narrows by workflow state; `assignStaffToOrder` associates a staff user; validations enforce staff selection, handle API errors (403/404/500) with toasts; modal refreshes staff list each time it opens.

### 7.5 Service Catalog Management
- **Function trigger**: Admin visits `/admin/services`.
- **Function description**: Maintain add-on services (create, update, delete, view) that attach to contracts/orders.
- **Screen layout**: Header actions (add service), search card, list of service cards with status badges and action icons, detail/edit dialogs.
- **Function details**: `ServiceService.getAllServices` populates catalog; create/update forms validate required fields and positive fees before calling `createService` / `updateService`; delete flow confirms via `window.confirm` then calls `deleteService`; detail modal shows description/fee/status; status badges color-code ACTIVE/INACTIVE; toasts surface API responses and validation errors.

### 7.6 Reporting & Analytics
- **Function trigger**: Admin opens `/admin/reports`.
- **Function description**: Visualize operational metrics (listings, users, orders, payments) to monitor platform health.
- **Screen layout**: `StatisticsChart` renders summary cards followed by bar charts (overview, listings breakdown, users breakdown) using Recharts.
- **Function details**: `AdminStatisticsService.getStatistics` fetches aggregate data; loading state shows spinner, errors render alert card; transforms API payload into chart datasets (overviewData, listingsData, usersData); charts highlight totals vs active/rejected/pending segments; responsive container ensures charts scale across breakpoints.

## 8. Staff Fulfillment & Contracts

### 8.1 Staff Order Management
- **Function trigger**: Staff visits `/staff/orders`.
- **Function description**: Review assigned orders, inspect buyer/seller details, open listing insights.
- **Screen layout**: `StaffLayout` with stats cards, search box, order list, detail dialog.
- **Function details**: `StaffOrderService.getAllOrders`, filter by buyer/seller/orderId; `getOrderListingDetail` returns listing, package, and images; format currency values; raise toasts for permission errors.

### 8.2 Contract Generation & Completion
- **Function trigger**: Staff navigates to `/staff/contracts` and acts on orders.
- **Function description**: Generate contracts, jump to add-on page for signing, mark completion.
- **Screen layout**: Order list with “Create Contract” and “Complete” buttons, status badges, search box.
- **Function details**: `ContractService.generateContract(orderId)` returns contract data and redirects to `/staff/contract-addon`; handle existing contracts by routing to add-on directly; `completeContractByOrderId` updates status, refreshes list, and shows toast notifications.

### 8.3 Contract Add-on Assignment
- **Function trigger**: Staff opens `/staff/contract-addon` (with optional `contractId` query).
- **Function description**: Load available add-on services, attach them to a contract, and designate who pays.
- **Screen layout**: Contract ID initializer, summary banner, added-addons list, service selection grid with totals, toggles for charged party.
- **Function details**: Fetches active services via `/addon/services`; loads existing add-ons from `/addon/contract/:id/addons`; validates contract ID input; supports multi-select add-ons and bulk POST to `/addon/contract-addon`; maintains totals, payment status badges, and toasts; allows switching contract ID without reloading.


