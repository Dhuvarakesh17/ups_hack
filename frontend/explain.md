You are an expert senior full-stack engineer, UI/UX designer,
AI engineer, database architect, DevOps-aware developer, and
software architect.

Build a complete, production-quality full-stack web application
based on all requirements below.

IMPORTANT:
- Do not build only static UI.
- Build a fully functional application.
- Implement frontend, backend, database schema, authentication,
  APIs, AI assistant integration, prediction engine, analytics,
  drafts, notifications, email integration, and responsive design.
- Use clean, scalable, modular architecture.
- Use TypeScript for the frontend.
- Use Python for the backend.
- Do not leave major features as placeholders.
- Seed realistic demo data.
- Ensure the project can run locally.
- Create .env.example files.
- Make every important button functional.
- All application/business APIs must be handled by FastAPI.
- Authentication endpoints must be handled by Better Auth through
  the Next.js catch-all route.
- Do not duplicate FastAPI business logic inside Next.js API routes.

====================================================
PROJECT NAME
====================================================

One Logistics Experience

Tagline:

"One seamless shipment booking experience across every channel."

This is an AI-powered shipment booking and management platform
inspired by a global logistics company.

The main problem being solved:

Customers should be able to start booking a shipment on one channel
and continue or complete it later without losing their information.

The platform should provide:

- Unified customer profile
- Multi-channel shipment booking journey
- Shipment service recommendations
- AI-powered shipment assistant
- Saved drafts
- Cross-session continuation
- Real-time shipment tracking
- Shipment notifications
- Personalized preferences
- Predictive estimated delivery time
- Analytics dashboard
- Mobile-first experience

====================================================
CORE TECH STACK
====================================================

Frontend:
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Modern reusable component architecture
- Lucide Icons
- Framer Motion for subtle animations
- Recharts for analytics visualizations

Authentication:
- Better Auth
- Email/password authentication
- Google OAuth
- Secure sessions
- Protected routes
- Middleware authentication checks

IMPORTANT AUTH ARCHITECTURE:

Create the following catch-all route:

frontend/
└── app/
    └── api/
        └── auth/
            └── [...all]/
                └── route.ts

This route must handle all Better Auth authentication endpoints.

The route should conceptually use:

import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler;

The Better Auth route should handle:

- Email/password signup
- Email/password login
- Logout
- Google OAuth
- OAuth callbacks
- Session management
- Authentication callbacks
- Better Auth internal authentication endpoints

The Next.js API route is ONLY for authentication.

DO NOT create duplicate Next.js API routes for:

- Shipments
- Drafts
- Analytics
- Preferences
- Profile business logic
- Notifications
- AI
- Prediction engine
- Shipment simulation

All of those application APIs must come from FastAPI.

Architecture:

Browser
   ↓
Next.js Frontend
   ↓
/api/auth/[...all]
   ↓
Better Auth


For business/application data:

Browser
   ↓
Next.js Frontend
   ↓
FastAPI Backend
   ↓
Neon PostgreSQL


Backend:
- FastAPI
- Python
- RESTful API architecture
- Pydantic models
- Modular routers
- Service layer architecture

Database:
- Neon PostgreSQL
- PostgreSQL
- Proper foreign keys
- Proper indexes
- Connection pooling

ORM:
- Choose a production-ready ORM compatible with FastAPI
  and PostgreSQL.

AI:
- Groq API
- Use an appropriate available Groq LLM
- Support generic and user-specific shipment queries.

Email:
- Environment-based email configuration.
- Send shipment status update emails to the sender.

Image Storage:
- Supabase Storage or equivalent.
- Use for profile images.

====================================================
CENTRALIZED API CLIENT
====================================================

Create:

frontend/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts

The lib/api.ts file must act as the centralized client for all
FastAPI application APIs.

Use:

NEXT_PUBLIC_BACKEND_API_URL

The API client should:

- Centralize fetch logic
- Handle authentication/session information
- Handle errors consistently
- Use typed request and response models where practical
- Avoid duplicate API request code
- Provide reusable methods for:
  - shipments
  - drafts
  - analytics
  - preferences
  - profile
  - notifications
  - AI
  - simulation

====================================================
DESIGN SYSTEM AND UI REQUIREMENTS
====================================================

The design should be:

- Modern
- Premium
- Minimal
- Professional
- Logistics/enterprise focused
- Mobile-first
- Clean
- Accessible
- Responsive

Use:

- White backgrounds
- Very subtle gray backgrounds
- Light colors
- Soft blue accents where appropriate
- Soft shadows
- Rounded cards
- Good whitespace
- Excellent typography hierarchy

Do not make the interface cluttered.

Support:

- Light mode
- Dark mode

Add:

- Loading states
- Skeleton loaders
- Empty states
- Error states
- Success states
- Toast notifications
- Form validation messages
- Confirmation dialogs

====================================================
APPLICATION PAGES
====================================================

1. Home Page
2. Login Page
3. Signup Page
4. Authentication Callback Handling
5. Dashboard
6. Booking Page
7. Analytics Page
8. Settings and Preferences Page
9. Profile Page
10. Drafts Page
11. Shipment Details Page
12. 404/Error Page

====================================================
HOME PAGE
====================================================

Create a polished landing page.

Sections:

1. Hero Section

Headline concept:

"Ship smarter. Continue anywhere."

Explain:

- Start booking on one channel.
- Save progress.
- Continue later.
- Manage everything from one dashboard.

CTA buttons:

- Get Started
- Login

2. Problem/Solution Section

3. Feature Cards

Show:

- Unified Profile
- AI Shipment Assistant
- Smart Recommendations
- Saved Drafts
- Real-Time Tracking
- Predictive Delivery Estimates
- Analytics
- Personalized Preferences

4. How It Works

Customer
↓
Booking
↓
Save Draft / Continue
↓
Service Recommendation
↓
Payment Selection
↓
Booking Confirmation
↓
Shipment Tracking
↓
Notifications

5. AI Assistant Showcase

6. Final CTA

====================================================
AUTHENTICATION
====================================================

Implement Better Auth.

Support:

- Email/password signup
- Email/password login
- Google OAuth
- Logout
- Session persistence
- Protected dashboard routes
- Redirect unauthenticated users to login

Create middleware to protect:

- /dashboard
- /booking
- /analytics
- /settings
- /profile
- /drafts
- /shipments

Authentication UI:

- Email
- Password
- Confirm password during signup
- Google sign-in
- Validation
- Loading states
- Error messages

====================================================
DASHBOARD
====================================================

Create a modern application shell.

Desktop:

- Left sidebar
- Main content
- Top header

Mobile:

- Collapsible sidebar/drawer
- Mobile-friendly navigation

Sidebar:

- Dashboard
- Booking
- Analytics
- Drafts
- Settings
- Profile

Header:

- Page title
- Notification icon
- User avatar
- Profile menu

----------------------------------------------------
DASHBOARD KPI CARDS
----------------------------------------------------

Show:

- Total Shipments
- Drafts
- Completed Shipments
- Shipments In Progress
- Failed/Exception Shipments if available

----------------------------------------------------
RECENT SHIPMENTS
----------------------------------------------------

Display real user shipments.

Each shipment should show:

- Shipment ID
- Product name
- Sender
- Receiver
- Current status
- Estimated delivery
- Created date

Actions:

- View Details
- Simulate Next Status

Clicking View Details:

/shipments/[shipmentId]

====================================================
SHIPMENT STATUS SIMULATION
====================================================

IMPORTANT:

Add a "Simulate Next Status" button to the Dashboard.

This is a development/demo feature.

Purpose:

Demonstrate:

- Status transition
- Real-time UI update
- Shipment timeline update
- Prediction engine update
- In-app notification
- Email notification

Recommended button display:

[ Simulate Next Status ]

Or dynamically:

[ Simulate: In Transit → Out for Delivery ]

Each shipment can have its own simulation button.

Example:

Current status:

In Transit

Click:

Simulate Next Status

Transition:

In Transit
      ↓
Out for Delivery

The frontend must call FastAPI.

Example endpoint:

POST /api/shipments/{shipment_id}/simulate-next-status

DO NOT determine the next status in the frontend.

The backend must determine the valid next status.

----------------------------------------------------
SIMULATION BACKEND FLOW
----------------------------------------------------

When the endpoint is called:

1. Authenticate the user.
2. Verify shipment ownership.
3. Retrieve current shipment status.
4. Determine the next valid status.
5. Update shipment current status.
6. Add ShipmentStatusHistory record.
7. Store timestamp.
8. Recalculate estimated delivery prediction.
9. Create in-app notification.
10. Send email notification.
11. Return updated shipment.

Normal status flow:

created
↓
picked_up
↓
in_transit
↓
out_for_delivery
↓
delivered

Example transition map:

created → picked_up

picked_up → in_transit

in_transit → out_for_delivery

out_for_delivery → delivered

For:

- delivered
- failed
- exception

Return:

"No further status transition is available."

Do not allow invalid transitions.

----------------------------------------------------
SIMULATION FRONTEND UX
----------------------------------------------------

For each shipment:

[ View Details ] [ Simulate ]

The button should:

- Show next transition where possible.
- Show loading state during request.
- Disable during request.
- Update status immediately after success.
- Refresh relevant dashboard data.
- Update KPI cards if necessary.
- Show a success toast.

Example:

"Simulation successful! Shipment is now Out for Delivery.
Notification email triggered."

If shipment is already delivered:

- Disable simulation button.

Tooltip:

"Shipment already completed."

----------------------------------------------------
DEMO MODE SECURITY
----------------------------------------------------

Add backend environment variable:

ENABLE_SHIPMENT_SIMULATION=true

If false:

- Hide simulation buttons in frontend.
- Backend rejects simulation API requests.

The backend must never trust the frontend for status progression.

====================================================
NOTIFICATIONS
====================================================

Dashboard header must contain a notification icon.

When shipment status changes:

1. Create an in-app notification.
2. Send an email to the sender.

Example:

Title:

"Shipment Out for Delivery"

Message:

"Your shipment UPS-XXXXXX is now out for delivery."

Email subject:

"Your shipment is out for delivery"

Notification should link to:

/shipments/[shipmentId]

Notification center should support:

- Read/unread
- Timestamp
- Related shipment
- Navigation to shipment

====================================================
FLOATING AI ASSISTANT
====================================================

Place a floating AI assistant in the bottom-right corner.

It should:

- Open chat interface
- Answer generic questions
- Answer user-specific questions
- Access only the authenticated user's relevant shipment data
- Provide shipment recommendations
- Return structured recommendations where appropriate

====================================================
BOOKING PAGE
====================================================

Create a multi-step booking flow with 5 steps.

Every step should support:

- Save as Draft
- Save current progress
- Continue later

----------------------------------------------------
STEP 1 — SENDER DETAILS
----------------------------------------------------

Fields:

- Full Name
- Email
- Phone Number
- Address
- City
- State
- Postal Code
- Country
- Location

----------------------------------------------------
STEP 2 — RECEIVER DETAILS
----------------------------------------------------

Same fields:

- Full Name
- Email
- Phone Number
- Address
- City
- State
- Postal Code
- Country
- Location

----------------------------------------------------
STEP 3 — PRODUCT DETAILS
----------------------------------------------------

Fields:

- Product Name
- Product Description
- Length
- Width
- Height
- Weight
- Product Type

Product types:

- Fragile
- Standard
- Electronics
- Documents
- Other

If Other:

Allow custom input.

----------------------------------------------------
STEP 4 — PAYMENT AND DELIVERY
----------------------------------------------------

Fields:

Billing Location:

- Sender
- Receiver

Payment Mode:

- Cash
- UPI Payment

Delivery Type:

- Standard
- Express

Add button:

"Use My Preferences"

When clicked:

Retrieve saved user preferences.

Auto-fill:

- Delivery type
- Payment mode
- Payment location

If no preferences exist:

"No saved preferences found. Please configure your
preferences in Settings."

----------------------------------------------------
STEP 5 — REVIEW AND CONFIRM
----------------------------------------------------

Show complete summary:

- Sender
- Receiver
- Product
- Payment
- Delivery

Each section has Edit button.

Add:

- Recommendation summary
- Confirmation
- Place Booking button

When placing booking:

1. Validate data.
2. Create shipment.
3. Create initial status.
4. Store timestamps.
5. Remove associated draft if applicable.
6. Redirect to shipment details.
7. Show success state.

====================================================
DRAFT MANAGEMENT
====================================================

Allow saving drafts at ANY booking stage.

When saving:

Ask for:

- Draft Name

Store:

- Draft ID
- User ID
- Draft Name
- Current Step
- Sender Details
- Receiver Details
- Product Details
- Payment Details
- Created At
- Updated At

====================================================
DRAFTS PAGE
====================================================

Show all user drafts.

Display:

- Draft Name
- Current Step
- Last Updated
- Brief Summary

Actions:

1. Use Draft

- Navigate to Booking.
- Pre-fill data.
- Continue from saved step.

2. Edit

- Edit draft.
- Save updated data.

3. Delete

- Confirm deletion.
- Delete draft.

====================================================
SHIPMENT DETAILS PAGE
====================================================

Display:

Shipment Header:

- Shipment ID
- Current status
- Product name
- Created date

Sender Details:

- Name
- Contact
- Address
- Email

Receiver Details:

- Name
- Contact
- Address
- Email

Product Details:

- Product name
- Dimensions
- Weight
- Product type

Delivery Details:

- Delivery type
- Payment mode
- Billing location

----------------------------------------------------
STATUS TIMELINE
----------------------------------------------------

Show:

- Shipment Created
- Picked Up
- In Transit
- Out for Delivery
- Delivered

Support exceptional statuses:

- Delayed
- Exception
- Failed

Each history record:

- Status
- Timestamp
- Location
- Note

Timeline:

- Completed stages highlighted
- Current stage emphasized
- Future stages muted
- Exceptions visually distinct

====================================================
PREDICTION ENGINE
====================================================

Every shipment details page must show:

"Estimated Delivery Time"

If insufficient progress data exists:

"Estimated delivery cannot be determined right now."

Do not show fake precision.

When sufficient data exists, calculate estimate using:

- Previous stage duration
- Number of remaining stages
- Historical averages
- Delivery type
- Product characteristics
- Current shipment status
- Relevant shipment variables

Conceptual formula:

estimated_remaining_time =
average_previous_stage_duration
× number_of_remaining_stages

Then adjust based on:

- Standard vs Express
- Historical data
- Current progress

Create modular backend structure:

prediction/
├── delivery_estimator.py
└── feature_extractor.py

Do not put prediction logic directly inside API routes.

Return:

- Estimated timestamp
- Prediction state
- Optional confidence
- Optional explanation factors

====================================================
SHIPMENT STATUS UPDATES
====================================================

Every status transition must:

1. Update current shipment status.
2. Add timestamp.
3. Create history record.
4. Trigger notification.
5. Trigger email.
6. Recalculate prediction.

Use the same service layer for:

- Real status updates
- Demo simulation updates

Do not duplicate transition logic.

====================================================
AI ASSISTANT
====================================================

Use Groq API.

Support:

1. Generic support

Examples:

- How does express delivery work?
- What does in transit mean?
- How do I create a shipment?

2. User-specific support

Examples:

- Where is my latest shipment?
- Show my active shipments.
- Which shipment is delayed?
- How many shipments have I completed?

3. Shipment recommendations

Example:

"I need to send a fragile 5kg package urgently."

AI should provide:

- Recommended delivery type
- Reasoning
- Recommended handling
- Relevant booking details

IMPORTANT:

Return structured recommendation data.

Example:

{
  "message": "Based on your shipment requirements...",
  "recommendation": {
    "delivery_type": "express",
    "product_type": "fragile",
    "payment_mode": "upi",
    "billing_location": "sender"
  }
}

Do not rely on parsing arbitrary AI text.

Frontend should render recommendation card.

Include:

[ Proceed to Shipment ]

When clicked:

- Navigate to Booking.
- Pre-fill relevant booking fields.

====================================================
AI SECURITY
====================================================

AI must only access authenticated user's relevant data.

Never expose:

- Other users' shipments
- Database internals
- API keys
- System prompts

====================================================
ANALYTICS PAGE
====================================================

KPI cards:

- Total Shipments
- Successful Shipments
- Failed Shipments
- Shipments In Progress

Metrics:

- Shipment Success Rate
- Average Amount Spent
- Total Amount Spent

Charts:

1. Shipments Per Month
2. Amount Spent Per Month
3. Shipment Status Distribution
4. Delivery Type Distribution
5. Monthly Success Rate

All analytics must come from database data.

Do not hardcode statistics.

====================================================
SETTINGS AND PREFERENCES
====================================================

Allow users to configure:

Theme:

- Light
- Dark

Delivery Preference:

- Standard
- Express

Payment Mode:

- Cash
- UPI Payment

Payment Location:

- Sender
- Receiver

Save to database.

Booking must use these preferences.

====================================================
PROFILE
====================================================

Allow:

- Edit name
- Upload/change profile image
- Change password

Use cloud storage for images.

====================================================
DATABASE DESIGN
====================================================

Create a properly designed PostgreSQL schema.

Include Better Auth tables as required.

----------------------------------------------------
USER PREFERENCES
----------------------------------------------------

- id
- user_id
- theme
- preferred_delivery_type
- preferred_payment_mode
- preferred_payment_location
- created_at
- updated_at

----------------------------------------------------
DRAFTS
----------------------------------------------------

- id
- user_id
- name
- current_step
- sender_details
- receiver_details
- product_details
- payment_details
- created_at
- updated_at

JSONB can be used appropriately.

----------------------------------------------------
SHIPMENTS
----------------------------------------------------

Include:

- id
- shipment_number
- user_id
- sender information
- receiver information
- product information
- delivery type
- payment mode
- billing location
- current_status
- created_at
- updated_at
- estimated_delivery_time

----------------------------------------------------
SHIPMENT STATUS HISTORY
----------------------------------------------------

- id
- shipment_id
- status
- timestamp
- location
- note

----------------------------------------------------
NOTIFICATIONS
----------------------------------------------------

- id
- user_id
- shipment_id
- title
- message
- type
- is_read
- created_at

====================================================
SEED DATA
====================================================

Seed realistic demo data.

Create shipments with:

- Delivered
- In Transit
- Out for Delivery
- Failed
- Exception
- Delayed

IMPORTANT:

At least one seeded shipment should have:

Current Status:

In Transit

This shipment should be suitable for demonstrating:

In Transit
↓
Out for Delivery

through the Simulate Next Status button.

Seed:

- Status histories
- Timestamps
- Different delivery types
- Different spending amounts
- Drafts
- Notifications

====================================================
BACKEND ARCHITECTURE
====================================================

Suggested:

backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── shipments.py
│   │   ├── drafts.py
│   │   ├── analytics.py
│   │   ├── preferences.py
│   │   ├── profile.py
│   │   ├── notifications.py
│   │   ├── ai.py
│   │   └── simulation.py
│   │
│   ├── models/
│   ├── schemas/
│   │
│   ├── services/
│   │   ├── shipment_service.py
│   │   ├── shipment_transition_service.py
│   │   ├── draft_service.py
│   │   ├── analytics_service.py
│   │   ├── notification_service.py
│   │   ├── email_service.py
│   │   └── ai_service.py
│   │
│   ├── prediction/
│   │   ├── delivery_estimator.py
│   │   └── feature_extractor.py
│   │
│   ├── database/
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   └── seed/
│
└── requirements.txt

The shipment transition service should be reused by:

- Normal shipment updates
- Demo simulation

====================================================
FRONTEND ARCHITECTURE
====================================================

frontend/
│
├── app/
│   ├── page.tsx
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts
│   │
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── booking/
│   ├── analytics/
│   ├── drafts/
│   ├── settings/
│   ├── profile/
│   └── shipments/
│       └── [id]/
│
├── components/
│   ├── dashboard/
│   ├── booking/
│   ├── shipment/
│   ├── analytics/
│   ├── ai/
│   ├── notifications/
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
│
├── hooks/
├── types/
│
└── middleware.ts

====================================================
FASTAPI ENDPOINTS
====================================================

SHIPMENTS:

POST   /api/shipments
GET    /api/shipments
GET    /api/shipments/{id}
PATCH  /api/shipments/{id}/status

SIMULATION:

POST /api/shipments/{id}/simulate-next-status

DRAFTS:

POST   /api/drafts
GET    /api/drafts
GET    /api/drafts/{id}
PATCH  /api/drafts/{id}
DELETE /api/drafts/{id}

ANALYTICS:

GET /api/analytics/dashboard
GET /api/analytics/shipments
GET /api/analytics/monthly-shipments
GET /api/analytics/monthly-spending

PREFERENCES:

GET   /api/preferences
PATCH /api/preferences

PROFILE:

GET   /api/profile
PATCH /api/profile
POST  /api/profile/image
POST  /api/profile/change-password

NOTIFICATIONS:

GET   /api/notifications
PATCH /api/notifications/{id}/read
PATCH /api/notifications/read-all

AI:

POST /api/ai/chat
POST /api/ai/recommendation

====================================================
FORM VALIDATION
====================================================

Validate:

- Email
- Phone
- Address
- Positive weight
- Positive dimensions
- Payment method
- Delivery type

Show inline errors.

Do not allow invalid bookings.

====================================================
ERROR HANDLING
====================================================

Handle:

- API failures
- Database failures
- Authentication failures
- AI API failures
- Missing preferences
- Invalid shipment IDs
- Unauthorized access
- Network errors
- Email failures

Use user-friendly messages.

====================================================
ENVIRONMENT VARIABLES
====================================================

Create .env.example.

Frontend:

NEXT_PUBLIC_BACKEND_API_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_ENABLE_SHIPMENT_SIMULATION=

Authentication:

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

Google:

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

Backend:

DATABASE_URL=
DATABASE_POOL_URL=

AI:

GROQ_API_KEY=

Email:

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_FROM=

Storage:

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET_NAME=

Demo:

ENABLE_SHIPMENT_SIMULATION=true

Never hardcode secrets.

====================================================
SECURITY
====================================================

Implement:

- Authentication
- Authorization
- User ownership validation
- Protected routes
- Secure environment variables
- Input validation
- No cross-user shipment access
- No API keys exposed to frontend

For simulation:

- Backend verifies user ownership.
- Backend determines next status.
- Frontend cannot force arbitrary status transitions.
- Backend rejects simulation if disabled.

====================================================
FINAL QUALITY REQUIREMENTS
====================================================

Do not:

- Build only static pages.
- Use fake frontend-only data everywhere.
- Leave buttons non-functional.
- Hardcode dashboard statistics.
- Fake analytics.
- Ignore authentication.
- Ignore mobile responsiveness.
- Duplicate business APIs inside Next.js.
- Allow frontend to directly control shipment status progression.

Do:

- Connect frontend to FastAPI properly.
- Use Better Auth through:
  app/api/auth/[...all]/route.ts
- Use real database CRUD.
- Seed realistic demo data.
- Implement simulation.
- Trigger real notification flow.
- Trigger email flow.
- Use structured AI recommendations.
- Make all major features functional.

====================================================
BUILD ORDER
====================================================

PHASE 1:

- Initialize Next.js frontend.
- Initialize FastAPI backend.
- Configure Neon database.
- Configure environment variables.

PHASE 2:

- Configure Better Auth.
- Create:
  app/api/auth/[...all]/route.ts
- Implement email/password authentication.
- Implement Google OAuth.
- Implement middleware.
- Protect routes.

PHASE 3:

- Create database schema.
- Run migrations.
- Seed realistic data.

PHASE 4:

- Build dashboard shell.
- Sidebar.
- Header.
- Notifications UI.

PHASE 5:

- Build booking flow.
- Validation.
- Preferences.
- Draft saving/resuming.

PHASE 6:

- Implement shipment APIs.
- Shipment details.
- Timeline.
- Status history.

PHASE 7:

- Implement shipment transition service.
- Implement simulation endpoint.
- Implement Simulate Next Status buttons.
- Implement in-app notifications.
- Implement email notifications.

PHASE 8:

- Implement analytics.

PHASE 9:

- Implement AI assistant.
- Structured recommendations.
- Proceed to Shipment flow.

PHASE 10:

- Implement prediction engine.

PHASE 11:

- Profile.
- Settings.
- Image upload.

PHASE 12:

- Mobile responsiveness.
- Loading states.
- Error handling.
- Accessibility.
- Testing.
- Final polish.

====================================================
FINAL DEMO FLOW
====================================================

The application should support this impressive demo:

1. User logs in through Better Auth.
2. Dashboard loads data from FastAPI.
3. User sees a shipment with status:
   "In Transit".
4. User clicks:

   "Simulate Next Status"

5. Frontend calls FastAPI.
6. Backend verifies ownership.
7. Backend changes:

   In Transit
   ↓
   Out for Delivery

8. Backend creates status history.
9. Prediction engine recalculates delivery estimate.
10. Backend creates in-app notification.
11. Backend sends notification email.
12. Dashboard updates status.
13. Notification icon shows unread notification.
14. Shipment details timeline updates.

====================================================
FINAL VERIFICATION
====================================================

Before considering the application complete, verify:

1. Home page works.
2. Better Auth route works:
   app/api/auth/[...all]/route.ts
3. Email/password authentication works.
4. Google OAuth works.
5. Protected routes work.
6. FastAPI receives all business/application API requests.
7. Dashboard KPIs use database data.
8. Booking works.
9. Draft save/resume works.
10. Preferences auto-fill works.
11. Shipment details work.
12. Timeline works.
13. Analytics work.
14. AI assistant works.
15. Structured AI recommendation prefills booking.
16. Prediction engine works.
17. Notifications work.
18. Email notifications work.
19. Simulation button works.
20. In Transit → Out for Delivery transition works.
21. Simulation updates timeline.
22. Simulation triggers notification.
23. Simulation triggers email.
24. Delivered shipments cannot progress further.
25. Mobile responsiveness works.
26. Seed data works.
27. Environment configuration is documented.

Build the application incrementally, but ensure every phase
integrates into one complete working system.

First analyze the complete architecture and create:

1. Folder structure
2. Database schema
3. API contract
4. Authentication flow
5. Shipment status transition flow
6. Simulation flow
7. Implementation plan

Then begin implementation phase by phase.

Do not simplify or skip core features.