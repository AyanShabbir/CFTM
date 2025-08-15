Migrate Mate – Subscription Cancellation Flow

Overview
This project manages user profiles and subscription cancellations for Migrate Mate using Next.js, React, TailwindCSS, and Supabase.

Originally, the project provided a Figma-designed cancellation flow and basic Supabase setup. We implemented and fixed several issues to make it fully functional.

Key Changes and Improvements
Profile Page Fixes
Correctly fetches and displays user email and subscription details from Supabase.
Added loading states to prevent empty fields while data is loading.
Cancellation Flow Updates

Fully functional 3-step modal:
Ask user for cancellation reason
Show A/B offer (discount) if applicable
Confirm cancellation and update subscription
Applied cryptographically secure random variant picker (A/B testing) and persisted the variant to Supabase.
Fixed all React hook errors and TypeScript props issues.
Supabase Integration
Queries for user, subscription, and cancellation records are now reliable.
Implemented create/update logic for cancellations and pending cancellations.
Ensured data persistence for all user actions.

UX Improvements
Added Back/Close buttons and smooth step transitions.
Improved error handling with console logs for easier debugging.
Loading indicators show while fetching data.
Code Quality
Cleaned up hooks and component structure.
Centralized API logic for cancellation and discount handling.
Added proper TypeScript types across all components.

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
