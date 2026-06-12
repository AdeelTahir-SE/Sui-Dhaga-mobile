sui-dhaga-mobile/
├── agents/
│   ├── README.md
│   ├── mobile-design-guidelines.md
│   ├── expo-router-structure.md
│   ├── ui-designs/
│   │   ├── main-tabs.png
│   │   ├── auth-flow.png
│   │   ├── tailor-discovery.png
│   │   ├── booking-orders.png
│   │   ├── ai-design-studio.png
│   │   ├── measurements-community-checkout.png
│   │   └── tailor-app-routes.png
│   ├── routes.md
│   ├── architecture.md
│   └── components.md
├── app/
│   ├── auth/
│   ├── (customer-tabs)/
│   ├── tailors/
│   ├── booking/
│   ├── orders/
│   ├── appointments/
│   ├── design-studio/
│   ├── measurements/
│   ├── community/
│   ├── checkout/
│   └── (tailor-tabs)/
├── src/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── constants/
├── assets/
├── .env.example
├── README.md
└── package.json



# Sui Dhaga Mobile Agents Guide

## Purpose

This folder contains instructions, architecture documents, route references, UI references, and development standards for AI coding agents working on the Sui Dhaga mobile application.

Agents must read this folder before making any code changes.

This documentation acts as the source of truth for:

* Project architecture
* Expo Router structure
* Design system
* Navigation patterns
* Component standards
* State management
* Feature organization
* API integration
* Mobile UX guidelines

---

# Project Overview

Sui Dhaga is an AI-powered tailoring platform.

The platform has two major sections:

## 1. Tailor Marketplace

A marketplace for discovering, comparing, hiring, and communicating with tailors.

Features include:

* Tailor discovery
* Tailor search
* Tailor comparison
* Nearby tailors
* Map integration
* Tailor profiles
* Messaging
* Appointments
* Orders
* Reviews
* Payments

---

## 2. AI Design Studio

An AI-powered clothing design system.

Features include:

* Text to Design
* Image to Design
* Sketch to Design
* Conversational Design Chat
* Design Editing
* Design Customization
* PDF Export
* Tailor Handoff

---

# Tech Stack

## Mobile

* React Native
* Expo
* Expo Router
* TypeScript

## State Management

* Zustand

## Backend

* Node.js
* Express.js

## Database

* Supabase PostgreSQL

## Authentication

* Supabase Auth

## Storage

* Supabase Storage

## Realtime

* Supabase Realtime

## Maps

* Google Maps API
* Mapbox

## AI

* OpenAI API

## Payments

* Stripe
* Safepay

## Notifications

* Firebase Cloud Messaging
* Expo Notifications

---

# Development Principles

## Simplicity First

Always choose the simplest implementation that solves the problem.

Avoid unnecessary abstractions.

---

## Feature First Organization

All business logic belongs inside feature folders.

Good:

src/features/design-studio

src/features/tailors

src/features/orders

Bad:

src/helpers/design

src/random/design

---

## Reusable Components

If a component will be used in multiple screens, place it in:

src/components

If it is only used by one feature, place it inside that feature.

---

## Mobile First

All UI decisions should prioritize:

* Touch interactions
* Small screens
* Accessibility
* Performance

---

## Type Safety

Use TypeScript everywhere.

Avoid:

any

Use:

interfaces

types

zod schemas

---

## API Driven Architecture

Backend is the source of truth.

Never directly access database logic from mobile.

All data must come through APIs.

---

## Single Source Of Truth

Do not duplicate:

* Business logic
* Validation rules
* Constants
* API definitions

---

# Folder Responsibilities

## app/

Contains only Expo Router routes.

No business logic should live here.

Routes should remain thin.

---

## src/features/

Contains feature-specific:

* Screens
* Hooks
* Services
* Components
* Logic

---

## src/components/

Reusable UI components.

Examples:

* Buttons
* Inputs
* Cards
* Modals
* Bottom Sheets

---

## src/api/

Backend communication layer.

All API requests must pass through this folder.

---

## src/stores/

Global Zustand stores.

---

## src/services/

External services.

Examples:

* Maps
* Storage
* Notifications
* Realtime

---

## src/types/

Shared TypeScript types.

---

# Design Philosophy

The Sui Dhaga mobile app should look exactly like designs in agents/ui-designs


---

# Agent Workflow

Before implementing any feature:

1. Read architecture.md
2. Read routes.md
3. Read expo-router-structure.md
4. Read components.md
5. Follow mobile-design-guidelines.md

Only then begin implementation.

---

# Rule

When uncertain:

Follow existing architecture instead of creating new patterns.

Consistency is more important than cleverness.


