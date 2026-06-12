# Mobile App Architecture

## Purpose

This document defines the architecture rules for the Sui Dhaga React Native Expo mobile app.

Agents must follow this structure when adding or updating features.

---

# Main Rule

The `app/` folder is only for routing.

The `src/` folder contains actual application logic.

---

# Folder Responsibilities

## app/

Contains Expo Router files only.

Use this folder for:

* Route files
* Layout files
* Dynamic routes

Do not place business logic here.

Example:

```tsx
import LoginScreen from "@/src/features/auth/screens/LoginScreen";

export default LoginScreen;
```

---

## src/api/

Contains backend API calls.

Use this folder for:

* Request functions
* API client
* Endpoint wrappers

Example files:

```txt
auth.api.ts
tailors.api.ts
designs.api.ts
orders.api.ts
```

---

## src/features/

Contains feature-specific code.

Each feature may contain:

```txt
screens/
components/
hooks/
schemas/
utils/
```

Example:

```txt
src/features/tailors/
├── screens/
├── components/
├── hooks/
└── schemas/
```

---

## src/components/

Contains reusable shared components.

Use this folder for components used by multiple features.

Examples:

```txt
Button
Input
Card
Modal
BottomSheet
Avatar
```

---

## src/stores/

Contains Zustand stores.

Use stores only for state shared across screens.

Examples:

```txt
auth.store.ts
user.store.ts
design.store.ts
order.store.ts
message.store.ts
```

Do not store temporary form state in Zustand.

---

## src/hooks/

Contains shared hooks.

Use this folder for hooks used by multiple features.

Feature-specific hooks should stay inside that feature.

---

## src/services/

Contains external service integrations.

Examples:

```txt
supabase.ts
storage.service.ts
realtime.service.ts
maps.service.ts
notifications.service.ts
payments.service.ts
```

---

## src/constants/

Contains shared constants.

Examples:

```txt
routes.ts
endpoints.ts
colors.ts
config.ts
roles.ts
```

---

## src/types/

Contains shared TypeScript types.

Feature-specific types may stay inside the feature when not reused.

---

## src/utils/

Contains shared utility functions.

Examples:

```txt
formatDate.ts
formatPrice.ts
validators.ts
imageHelpers.ts
errorHandler.ts
permissions.ts
```

---

## src/styles/

Contains shared theme and typography files.

Examples:

```txt
theme.ts
typography.ts
```

---

# Feature Structure

Use this structure when creating a feature:

```txt
src/features/feature-name/
├── screens/
├── components/
├── hooks/
├── schemas/
├── utils/
└── index.ts
```

Only create folders that are needed.

---

# API Flow

All backend communication must go through:

```txt
src/api/
```

Screen should not call `fetch` directly.

Correct:

```txt
Screen → Feature Hook → API File → Backend
```

Wrong:

```txt
Screen → fetch()
```

---

# State Management Flow

Use Zustand for:

* Auth state
* Current user
* Selected design
* Cart or checkout state
* Message state
* App settings

Do not use Zustand for:

* One-screen form input
* Temporary modal state
* Local UI toggles

Use local component state for those.

---

# Screen Rule

Screens should focus on:

* Rendering UI
* Calling hooks
* Handling navigation actions

Screens should not contain:

* Large API logic
* Complex data transformation
* Reusable business rules

Move those into hooks, utils, or API files.

---

# Component Rule

Components should be reusable and focused.

A component should not know too much about backend data.

Prefer passing props.

---

# Validation Rule

Use Zod for forms and request validation.

Validation schemas should live close to the feature.

Example:

```txt
src/features/auth/schemas/login.schema.ts
```

---

# Realtime Rule

Realtime logic should live in:

```txt
src/services/realtime.service.ts
```

or feature-specific hooks.

Do not place realtime subscriptions directly inside route files.

---

# Upload Rule

All uploads must go through:

```txt
src/api/uploads.api.ts
```

or:

```txt
src/services/storage.service.ts
```

Do not upload files directly from screens.

---

# Final Rule

Keep routing, UI, state, services, and API logic separated.

Do not mix everything inside screen files.
