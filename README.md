Migrate Mate – Subscription Cancellation Flow
Overview

This project handles user profiles and subscription cancellations for Migrate Mate using Next.js, React, TailwindCSS, and Supabase.

We extended the original Figma-based flow into a fully functional 3-step cancellation modal, fixed bugs, added A/B testing, and improved user experience.

Key Features & Changes
1. Profile Page

Fetches and displays user email and subscription details correctly from Supabase.

Added loading indicators while data is being fetched.

Handles subscription status and next payment dates dynamically.

2. Cancellation Flow

Fully functional 3-step modal:

Ask user for cancellation reason

Show A/B offer (50% off) if applicable

Final confirmation to cancel

Implemented cryptographically secure A/B testing:

Variant B shows the downsell offer.

Variant A skips the offer.

Variant assignment persists for the user in Supabase.

Step navigation: Back, Close, and dynamic step handling.

Progress bar shows current step of the flow.

Offers accept/decline actions with discount logic simulated.

3. Supabase Integration

Fetch and persist user, subscription, and cancellation data.

Update subscription to pending cancellation if canceled.

Store cancellation details:

user_id, downsell_variant, reason, accepted_downsell, created_at.

Applied error handling for all API calls.

4. UX Improvements

Smooth step transitions and modals for mobile & desktop.

Styled offer card with discount details and action buttons.

Loading states for actions like discount application and cancellation.

Clear feedback to user after cancellation or offer acceptance.

5. Code Quality

Centralized API logic for cancellation and discount.

Fully typed with TypeScript for safety.

Modular components for Step1, Step2, Step3 and ProgressBar.

Improved React hooks usage to avoid common warnings/errors.

Tech Stack

Next.js with App Router

React with TypeScript

Tailwind CSS

Supabase (Postgres + Row-Level Security)

Setup
Clone the repo:
git clone <repo-url>
cd cancel-flow-task-main


Install dependencies:
npm install


Add environment variables in .env file:
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>


Set up local Supabase database:
npm run db:setup


Run the app:
npm run dev

Notes

Supabase CLI should be updated to latest version.
User authentication is mocked for development purposes.
Payment processing is stubbed—no real payments occur.
The project now has a fully working cancellation modal with persisted A/B testing.
