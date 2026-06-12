# Mobile App Routes

## Purpose

This document lists all mobile app routes for Sui Dhaga.

The Expo Router structure must follow these routes.

---

# Auth Routes

| Route                   | Page Sections                                            |
| ----------------------- | -------------------------------------------------------- |
| `/auth/login`           | Login Form, Forgot Password, Register Link, Social Login |
| `/auth/register`        | Role Selection, Signup Form, Terms Agreement, Login Link |
| `/auth/forgot-password` | Email Input, Send Reset Link, Back to Login              |

---

# Main Customer Tab Routes

| Route       | Page Sections                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `/home`     | Hero, Quick Actions, Popular Categories, Recommended Tailors, Recent Designs, Community Preview |
| `/tailors`  | Search Bar, Filters, Tailor List, Tailor Cards, View Profile Button                             |
| `/design`   | New Design, Text to Design, Image to Design, Sketch to Design, My Designs, Templates            |
| `/orders`   | Active Orders, Completed Orders, Cancelled Orders, Order Cards                                  |
| `/messages` | Conversation List, Search Messages, Unread Messages                                             |
| `/profile`  | User Info, Measurements, Saved Designs, Payment Methods, Settings, Logout                       |

---

# Tailor Discovery Routes

| Route                 | Page Sections                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `/tailors/map`        | Map View, Nearby Tailor Pins, Tailor Preview Card, Search This Area, Filter Button                      |
| `/tailors/[tailorId]` | Tailor Header, Rating, Specialties, Gallery, Services, Reviews, Message Button, Book Appointment Button |
| `/tailors/compare`    | Selected Tailors, Comparison Table, Price, Rating, Experience, Book Button                              |

---

# Booking & Orders Routes

| Route                           | Page Sections                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `/booking/[tailorId]`           | Select Service, Select Date, Select Time, Add Notes, Appointment Summary, Confirm Booking     |
| `/appointments`                 | Upcoming, Completed, Cancelled, Appointment Cards                                             |
| `/appointments/[appointmentId]` | Appointment Detail, Tailor Info, Service Info, Date Time, Status, Cancel / Reschedule         |
| `/orders/[orderId]`             | Order Header, Tracking Timeline, Order Details, Tailor Info, Payment Summary, Contact Support |

---

# Messages Routes

| Route                        | Page Sections                                               |
| ---------------------------- | ----------------------------------------------------------- |
| `/messages/[conversationId]` | Chat Header, Message List, Message Input, Attachment Button |

---

# AI Design Studio Routes

| Route                              | Page Sections                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/design-studio`                   | Design Options, Recent Designs, Templates, AI Suggestions                                                 |
| `/design-studio/text-to-design`    | Prompt Input, Garment Type, Style Options, Generate Button, Preview                                       |
| `/design-studio/image-to-design`   | Upload Image, Reference Preview, Prompt Input, Generate Button, Preview                                   |
| `/design-studio/sketch-to-design`  | Upload Sketch, Prompt Input, Generate Button, Preview                                                     |
| `/design-studio/chat`              | AI Chat, Design Preview, Suggested Replies, Save Design Button                                            |
| `/design-studio/editor/[designId]` | Design Preview, Colors, Fabrics, Embroidery, Measurements, AI Assistant, Save Button                      |
| `/design-studio/export/[designId]` | Tech Pack Preview, Garment Details, Size Chart, Color Palette, Fabric Details, Download PDF, Share Button |

---

# Measurements Routes

| Route                           | Page Sections                                                   |
| ------------------------------- | --------------------------------------------------------------- |
| `/measurements`                 | Body Diagram, Measurement List, Add New Measurement, Size Guide |
| `/measurements/new`             | Measurement Form, Unit Selection, Save Button                   |
| `/measurements/[measurementId]` | Measurement Details, Edit Button, Delete Button                 |

---

# Community Routes

| Route                 | Page Sections                                                  |
| --------------------- | -------------------------------------------------------------- |
| `/community`          | Feed, Trending, Following, Post Cards, Create Post Button      |
| `/community/create`   | Upload Image, Caption, Tags, Post Button                       |
| `/community/[postId]` | Post Detail, Image, Caption, Likes, Comments, Use As Reference |

---

# Checkout Routes

| Route               | Page Sections                                             |
| ------------------- | --------------------------------------------------------- |
| `/checkout`         | Order Summary, Payment Methods, Price Details, Pay Button |
| `/checkout/success` | Success Message, Order Summary, Track Order Button        |
| `/checkout/failed`  | Failure Message, Retry Payment, Contact Support           |

---

# Tailor App Routes

| Route                            | Page Sections                                                     |
| -------------------------------- | ----------------------------------------------------------------- |
| `/tailor-dashboard`              | Overview, New Orders, Appointments, Messages, Earnings            |
| `/tailor-dashboard/orders`       | Order Requests, In Progress, Completed, Cancelled                 |
| `/tailor-dashboard/appointments` | Appointment Requests, Upcoming, Completed, Accept / Reject        |
| `/tailor-dashboard/services`     | Service List, Add Service, Edit Service, Delete Service           |
| `/tailor-dashboard/availability` | Calendar, Time Slots, Add Slot, Remove Slot                       |
| `/tailor-dashboard/earnings`     | Total Earnings, Monthly Earnings, Pending Payments, Order History |

---

# Route Implementation Rule

Each route file inside `app/` should only connect routing to the matching feature screen.

Example:

```tsx
import TailorProfileScreen from "@/src/features/tailors/screens/TailorProfileScreen";

export default TailorProfileScreen;
```

Do not place full screen logic directly inside route files.

---

# Source Of Truth

This file is the source of truth for mobile routes.

If routes change, update this file first.
