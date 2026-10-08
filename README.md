# 🧵 Sui Dhaga — AI-Powered Custom Tailoring Platform

<p align="center">
  <img src="./assets/logos/main-logo.png" alt="Sui Dhaga Logo" width="180" />
</p>

<p align="center">
  <strong>Discover tailors. Design with AI. Get custom clothes made — all from your phone.</strong>
</p>

<p align="center">
  <a href="#-download">
    <img src="https://img.shields.io/badge/Download-APK-14919B?style=for-the-badge&logo=android&logoColor=white" alt="Download APK" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/Expo-SDK_56-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 56" />
  &nbsp;
  <img src="https://img.shields.io/badge/React_Native-0.85-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 📥 Download

> **Try the latest build on your Android device:**
>
> 👉 **[Download APK]([YOUR_APK_LINK_HERE](https://drive.google.com/file/d/1V2iOrs21xR46zGUpPfCZrwenY8GA-a-t/view?usp=sharing))**
>

---

## 📖 About

**Sui Dhaga** (सुई धागा — _Needle & Thread_) is a full-featured mobile platform that bridges the gap between customers and tailors. It combines a **Tailor Marketplace** for discovering, booking, and communicating with tailors, and an **AI Design Studio** that lets you generate custom clothing designs from text, images, or sketches — all powered by AI.

Whether you're a customer looking for the perfect tailor or a tailor managing your business, Sui Dhaga has you covered.

---

## ✨ Features

### 🏪 Tailor Marketplace
- **Discover Tailors** — Browse tailors by specialty, rating, and location
- **Map View** — Find nearby tailors on an interactive map with real-time location
- **Tailor Profiles** — View portfolios, services, pricing, reviews & ratings
- **Search & Filters** — Filter by garment type, price range, distance, and availability
- **Book Appointments** — Schedule fittings and consultations directly
- **Place Orders** — Order custom garments with real-time status tracking
- **In-App Messaging** — Chat with tailors with text, images & voice messages
- **Reviews & Ratings** — Rate and review tailors after completed orders
- **Payments** — Secure checkout with Stripe & Safepay integration

### 🎨 AI Design Studio
- **Text to Design** — Describe your dream outfit and AI generates it
- **Image to Design** — Upload a reference photo and get AI variations
- **Sketch to Design** — Draw a rough sketch and let AI refine it
- **Conversational Design** — Chat with AI to iteratively refine designs
- **Design Editor** — Customize colors, fabrics, embroidery, and details
- **PDF Export** — Export finalized designs as professional spec sheets
- **Tailor Handoff** — Send designs directly to a tailor for ordering

### 📏 Measurements & More
- **Body Measurements** — Save and manage measurement profiles
- **Community Feed** — Share designs, get inspiration, and engage with posts
- **Push Notifications** — Stay updated on orders, messages & appointments
- **Tailor Dashboard** — Full business management for tailors (orders, earnings, availability, profile setup)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native + Expo (SDK 56) |
| **Routing** | Expo Router (file-based) |
| **Language** | TypeScript 6.0 |
| **Styling** | NativeWind (Tailwind CSS for RN) |
| **State Management** | Zustand |
| **Backend** | Node.js + Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email, Google OAuth) |
| **Storage** | Supabase Storage |
| **Realtime** | Supabase Realtime |
| **Maps** | Leaflet / Google Maps |
| **AI** | OpenAI API |
| **Payments** | Stripe + Safepay |
| **Notifications** | Expo Notifications |
| **Animations** | React Native Reanimated |
| **Forms / Validation** | Zod |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm**
- **Expo CLI** — `npm install -g expo-cli`
- **Android Studio** (for emulator) or a physical Android device with [Expo Go](https://expo.dev/go)
- **EAS CLI** (for builds) — `npm install -g eas-cli`

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/AdeelTahir-SE/Sui-Dhaga.git
cd mobile-app/sui-dhaga-mobile

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API URL:
#   EXPO_PUBLIC_API_URL=https://sui-dhaga-backend.vercel.app
#   EXPO_PUBLIC_BACKEND_URL=https://sui-dhaga-backend.vercel.app

# 4. Start the development server
npx expo start
```

### Running on Device / Emulator

```bash
# Android emulator
npx expo run:android

# iOS simulator (macOS only)
npx expo run:ios

# Web (experimental)
npx expo start --web
```

### Building APK with EAS

```bash
# Development build
eas build --platform android --profile development

# Preview APK
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

---

## 🏗️ Project Architecture

The app follows a **feature-first architecture** with a clear separation between routing and business logic:

```
sui-dhaga-mobile/
├── app/                        # Expo Router — routes & layouts only
│   ├── auth/                   #   Authentication screens
│   ├── (customer-tabs)/        #   Customer bottom tab navigation
│   ├── (tailor-tabs)/          #   Tailor bottom tab navigation
│   ├── tailors/                #   Tailor discovery routes
│   ├── booking/                #   Appointment booking flow
│   ├── orders/                 #   Order management
│   ├── design-studio/          #   AI Design Studio
│   ├── measurements/           #   Body measurements
│   ├── community/              #   Social community feed
│   └── checkout/               #   Payment checkout
│
├── src/
│   ├── api/                    # Backend API client & endpoint wrappers
│   ├── features/               # Feature modules (screens, components, hooks)
│   │   ├── auth/               #   Login, Register, Google OAuth
│   │   ├── customer-tabs/      #   Home, Explore, Profile
│   │   ├── tailors/            #   Discovery, Map, Profiles
│   │   ├── booking-orders/     #   Booking flow & order tracking
│   │   ├── design-studio/      #   AI design generation & editing
│   │   ├── measurements-community-checkout/
│   │   │                       #   Measurements, Community, Checkout
│   │   └── tailor-dashboard/   #   Tailor business management
│   ├── components/             # Shared reusable UI components
│   │   ├── ui/                 #   Buttons, Inputs, Cards, Modals
│   │   └── layout/             #   Layout wrappers & shells
│   ├── hooks/                  # Shared hooks (theme, location, presence)
│   ├── services/               # External services (Supabase, notifications)
│   ├── stores/                 # Zustand global stores (auth, user)
│   ├── types/                  # Shared TypeScript types
│   ├── constants/              # App-wide constants & config
│   └── utils/                  # Utility functions (cache, formatters)
│
├── assets/
│   ├── logos/                  # App icons & logos
│   ├── illustrations/          # Feature illustrations & previews
│   ├── images/                 # Tab icons & backgrounds
│   └── texture/                # Button & surface textures
│
├── .env.example                # Environment variable template
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build profiles
├── tailwind.config.js          # NativeWind/Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

### Key Architecture Rules

- **`app/`** contains **only** Expo Router route files — no business logic
- **`src/features/`** contains all feature-specific screens, components, hooks & logic
- **`src/components/`** holds **reusable** components shared across features
- **API flow:** `Screen → Feature Hook → API File → Backend` (never fetch directly from screens)
- **State:** Zustand for global/shared state, local `useState` for ephemeral UI state
- **Validation:** Zod schemas co-located within feature folders

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| **Ivory Base** | `#FFFDF9` | Global background canvas |
| **Deep Teal** | `#007A7A` | Primary actions, headers, brand color |
| **Creative Coral** | `#FF5B52` | Accent highlights, decorative waves |
| **Pure White** | `#FFFFFF` | Cards, panels, input surfaces |
| **Charcoal** | `#1E1E1E` | Primary text |
| **Muted Slate** | `#6B7280` | Secondary text, placeholders |
| **Success Green** | `#22C55E` | Active, verified, in-progress states |
| **Warning Orange** | `#F97316` | Pending states, alerts |

- **Corners:** Soft rounded (`8px–16px`) for a boutique, approachable feel
- **Typography:** Geometric sans-serif headings + legible body text
- **Visual Style:** Warm, premium, hand-crafted textile aesthetic

---

## 🔌 API & Backend

The mobile app connects to the **Sui Dhaga Backend** — a Node.js/Express REST API with Swagger documentation.

- **Backend Repo:** [github.com/AdeelTahir-SE/Sui-Dhaga-backend](https://github.com/AdeelTahir-SE/Sui-Dhaga-backend)
- **Live API:** `https://sui-dhaga-backend.vercel.app`
- **API Docs:** `https://sui-dhaga-backend.vercel.app/api-docs`

### API Modules

| Module | Description |
|---|---|
| Auth | Email/password & Google OAuth authentication |
| Users | User profile management |
| Tailors | Tailor profiles, verification, services & availability |
| Appointments | Booking & scheduling management |
| Orders | Custom tailoring order lifecycle |
| Conversations | Real-time messaging with attachments |
| Designs | AI design generation & studio |
| Measurements | Customer body measurement profiles |
| Fabrics | Fabric catalog & pricing |
| Reviews | Ratings & reviews system |
| Wishlist | Saved designs & tailor bookmarks |
| Payments | Stripe/Safepay checkout & webhooks |
| Notifications | Push notification management |
| Uploads | Media & document file uploads |
| Community | Social posts & engagement |
| Admin | Analytics, moderation & management |

---

## 📱 Screenshots

> _Coming soon — screenshots of the app in action._

<!-- Uncomment and add your screenshots:
<p align="center">
  <img src="./docs/screenshots/home.png" width="200" />
  <img src="./docs/screenshots/tailors.png" width="200" />
  <img src="./docs/screenshots/design-studio.png" width="200" />
  <img src="./docs/screenshots/tailor-dashboard.png" width="200" />
</p>
-->

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing **feature-first architecture** — don't create new patterns
4. Use **TypeScript** everywhere — avoid `any`
5. Validate with **Zod** schemas
6. Commit your changes: `git commit -m "feat: add amazing feature"`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**Adeel Tahir**

- GitHub: [@AdeelTahir-SE](https://github.com/AdeelTahir-SE)

---

<p align="center">
  Made with ❤️ and 🧵
  <br />
  <strong>सुई धागा — Where tradition meets technology</strong>
</p>
