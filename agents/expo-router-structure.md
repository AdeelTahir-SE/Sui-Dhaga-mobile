# Expo Router Structure

## Purpose

This document defines the routing architecture of the Sui Dhaga mobile application.

All navigation must follow this structure.

The `app/` directory is responsible only for routing.

Business logic must not be placed inside route files.

---

# Routing Rules

## Use Expo Router

Use:

```txt
expo-router
```

for all navigation.

Do not use React Navigation directly.

---

## Route Files

Files inside:

```txt
app/
```

represent routes.

Example:

```txt
app/auth/login.tsx
```

becomes:

```txt
/ auth / login
```

---

## Layout Files

Files named:

```txt
_layout.tsx
```

define navigation layouts.

Examples:

```txt
app/_layout.tsx
app/auth/_layout.tsx
app/(customer-tabs)/_layout.tsx
app/tailor-dashboard/_layout.tsx
```

---

# Root Structure

```txt
sui-dhaga-mobile/
├── agents/
│   ├── README.md
│   ├── mobile-design-guidelines.md
│   ├── expo-router-structure.md
│   ├── ui-designs/
│   │   ├── .....
│   ├── routes.md
│   ├── architecture.md
│   └── components.md
│
├── src/
│   ├── app/
│   │   ├── _layout.tsx                         # ROOT STACK
│   │   ├── index.tsx                           # ENTRY / REDIRECT
│   │   │
│   │   ├── auth/
│   │   │   ├── _layout.tsx                     # AUTH STACK
│   │   │   ├── login.tsx                       # AUTH
│   │   │   ├── register.tsx                    # AUTH
│   │   │   ├── forgot-password.tsx             # AUTH
│   │   │   └── reset-password.tsx              # AUTH
│   │   │
│   │   ├── (customer-tabs)/
│   │   │   ├── _layout.tsx                     # CUSTOMER BOTTOM TABS
│   │   │   ├── home.tsx                        # CUSTOMER
│   │   │   ├── tailors.tsx                     # CUSTOMER
│   │   │   ├── design.tsx                      # CUSTOMER
│   │   │   ├── orders.tsx                      # CUSTOMER
│   │   │   ├── messages.tsx                    # CUSTOMER
│   │   │   └── profile.tsx                     # CUSTOMER
│   │   │
│   │   ├── tailors/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # CUSTOMER
│   │   │   ├── map.tsx                         # CUSTOMER
│   │   │   ├── [tailorId].tsx                  # CUSTOMER
│   │   │   └── compare.tsx                     # CUSTOMER
│   │   │
│   │   ├── booking/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   └── [tailorId].tsx                  # CUSTOMER
│   │   │
│   │   ├── design-studio/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # CUSTOMER
│   │   │   ├── text-to-design.tsx              # CUSTOMER
│   │   │   ├── image-to-design.tsx             # CUSTOMER
│   │   │   ├── sketch-to-design.tsx            # CUSTOMER
│   │   │   ├── chat.tsx                        # CUSTOMER
│   │   │   ├── editor/
│   │   │   │   └── [designId].tsx              # CUSTOMER
│   │   │   └── export/
│   │   │       └── [designId].tsx              # CUSTOMER
│   │   │
│   │   ├── orders/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # CUSTOMER
│   │   │   └── [orderId].tsx                   # CUSTOMER
│   │   │
│   │   ├── appointments/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # CUSTOMER
│   │   │   └── [appointmentId].tsx             # CUSTOMER
│   │   │
│   │   ├── measurements/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # CUSTOMER
│   │   │   ├── new.tsx                         # CUSTOMER
│   │   │   └── [measurementId].tsx             # CUSTOMER
│   │   │
│   │   ├── community/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # SHARED_AUTH
│   │   │   ├── create.tsx                      # SHARED_AUTH
│   │   │   └── [postId].tsx                    # SHARED_AUTH
│   │   │
│   │   ├── checkout/
│   │   │   ├── _layout.tsx                     # STACK
│   │   │   ├── index.tsx                       # CUSTOMER
│   │   │   ├── success.tsx                     # CUSTOMER
│   │   │   └── failed.tsx                      # CUSTOMER
│   │   │
│   │   └── (tailor-tabs)/
│   │       ├── _layout.tsx                     # TAILOR BOTTOM TABS
│   │       ├── dashboard.tsx                   # TAILOR
│   │       ├── orders.tsx                      # TAILOR
│   │       ├── appointments.tsx                # TAILOR
│   │       ├── messages.tsx                    # TAILOR
│   │       ├── earnings.tsx                    # TAILOR
│   │       └── profile.tsx                     # TAILOR
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── users.api.ts
│   │   ├── tailors.api.ts
│   │   ├── appointments.api.ts
│   │   ├── orders.api.ts
│   │   ├── conversations.api.ts
│   │   ├── designs.api.ts
│   │   ├── measurements.api.ts
│   │   ├── community.api.ts
│   │   ├── payments.api.ts
│   │   ├── notifications.api.ts
│   │   └── uploads.api.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── cards/
│   │   ├── maps/
│   │   ├── design-studio/
│   │   ├── tailor/
│   │   ├── orders/
│   │   ├── community/
│   │   └── measurements/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── tailors/
│   │   ├── booking/
│   │   ├── appointments/
│   │   ├── orders/
│   │   ├── messages/
│   │   ├── design-studio/
│   │   ├── measurements/
│   │   ├── community/
│   │   ├── checkout/
│   │   ├── profile/
│   │   └── tailor-dashboard/
│   │
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── user.store.ts
│   │   ├── tailor.store.ts
│   │   ├── design.store.ts
│   │   ├── order.store.ts
│   │   ├── message.store.ts
│   │   └── app.store.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useLocation.ts
│   │   ├── useUpload.ts
│   │   ├── useRealtimeMessages.ts
│   │   └── useNotifications.ts
│   │
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── storage.service.ts
│   │   ├── realtime.service.ts
│   │   ├── maps.service.ts
│   │   ├── notifications.service.ts
│   │   ├── payments.service.ts
│   │   └── permissions.service.ts
│   │
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── endpoints.ts
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   └── roles.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── tailor.types.ts
│   │   ├── design.types.ts
│   │   ├── order.types.ts
│   │   ├── appointment.types.ts
│   │   ├── message.types.ts
│   │   ├── community.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── formatPrice.ts
│   │   ├── validators.ts
│   │   ├── imageHelpers.ts
│   │   ├── errorHandler.ts
│   │   └── permissions.ts
│   │
│   └── styles/
│       ├── theme.ts
│       └── typography.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── illustrations/
│
├── docs/
│   ├── app-flow.md
│   ├── backend-contract.md
│   ├── database-notes.md
│   └── deployment.md
│
├── .env.example
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── babel.config.js
└── README.md



```

---

# Root Layout

File:

```txt
app/_layout.tsx
```

Responsibilities:

* App initialization
* Auth initialization
* Theme initialization
* Notification initialization
* Route protection

Do not place screen UI here.

---

# Auth Routes

Folder:

```txt
app/auth/
```

Routes:

```txt
/auth/login
/auth/register
/auth/forgot-password
```

Layout:

```txt
app/auth/_layout.tsx
```

Uses:

```txt
Stack Navigator
```

---

# Customer Tabs

Folder:

```txt
app/(customer-tabs)/
```

Uses:

```txt
Tabs Navigator
```

Routes:

```txt
/home
/tailors
/design
/orders
/messages
/profile
```

Layout:

```txt
app/(customer-tabs)/_layout.tsx
```

This is the primary customer navigation.

---

# Tailor Discovery Routes

Folder:

```txt
app/tailors/
```

Routes:

```txt
/tailors/map
/tailors/compare
/tailors/[tailorId]
```

Uses:

```txt
Stack Navigation
```

---

# Booking Routes

Folder:

```txt
app/booking/
```

Routes:

```txt
/booking/[tailorId]
```

---

# Appointment Routes

Folder:

```txt
app/appointments/
```

Routes:

```txt
/appointments
/appointments/[appointmentId]
```

---

# Order Routes

Folder:

```txt
app/orders/
```

Routes:

```txt
/orders/[orderId]
```

---

# Message Routes

Folder:

```txt
app/messages/
```

Routes:

```txt
/messages/[conversationId]
```

---

# Design Studio Routes

Folder:

```txt
app/design-studio/
```

Routes:

```txt
/design-studio
/design-studio/text-to-design
/design-studio/image-to-design
/design-studio/sketch-to-design
/design-studio/chat
/design-studio/editor/[designId]
/design-studio/export/[designId]
```

---

# Measurements Routes

Folder:

```txt
app/measurements/
```

Routes:

```txt
/measurements
/measurements/new
/measurements/[measurementId]
```

---

# Community Routes

Folder:

```txt
app/community/
```

Routes:

```txt
/community
/community/create
/community/[postId]
```

---

# Checkout Routes

Folder:

```txt
app/checkout/
```

Routes:

```txt
/checkout
/checkout/success
/checkout/failed
```

---

# Tailor Dashboard Routes

Folder:

```txt
app/tailor-dashboard/
```

Routes:

```txt
/tailor-dashboard
/tailor-dashboard/orders
/tailor-dashboard/appointments
/tailor-dashboard/services
/tailor-dashboard/availability
/tailor-dashboard/earnings
```

Layout:

```txt
app/tailor-dashboard/_layout.tsx
```

Uses:

```txt
Stack Navigation
```

---

# Dynamic Routes

Use dynamic route files for resource pages.

Examples:

```txt
[tailorId].tsx
[appointmentId].tsx
[orderId].tsx
[conversationId].tsx
[designId].tsx
[measurementId].tsx
[postId].tsx
```

Do not create separate static files for individual resources.

---

# Route Responsibilities

Route files should:

* Load feature screens
* Handle navigation
* Read route params

Route files should not:

* Contain API logic
* Contain business logic
* Contain complex state management

Those belong in:

```txt
src/features/
```

---

# Navigation Rule

When creating a new screen:

1. Add route in `app/`
2. Implement feature in `src/features/`
3. Connect route to feature

Keep routing and business logic separate.

---

# Source Of Truth

The routing structure defined in this document is the source of truth for navigation.

All agents must follow it.
