# Hotel Data Seeding

This document summarizes the data seeding process for the Inn at Hastings Park hotel (ID: `2f9c8b7a-e7a0-4c70-9d35-add5e67a8c7d`).

## Seeded Data

We've created the following seed scripts to populate data for the Inn at Hastings Park hotel:

### 1. Hotel Information (`scripts/updateHotelInfo.ts`)
- Updated hotel with address, email, phone, and website
- Created necessary region, country, and state data
- Added complete contact information for the hotel

### 2. Announcements (`scripts/seedAnnouncementTypes.ts`)
- Added various announcements with different types:
  - Normal announcements: welcome messages, events
  - Important announcements: service updates, maintenance notices
  - Emergency announcements: security protocols, safety information

### 3. Housekeeping Types (`scripts/seedHousekeepingTypes.ts`)
- Added 7 housekeeping service types:
  - DAILY_CLEANING
  - TURN_DOWN 
  - FRESH_TOWELS
  - BEDDING_CHANGE
  - URGENT_CLEANING
  - DEEP_CLEANING
  - DO_NOT_DISTURB

### 4. Dining Requests (`scripts/seedDiningRequests.ts`)
- Added sample dining requests with:
  - Room service orders
  - Delivery instructions
  - Payment methods and statuses
  - Multiple guest configurations

## Combined Seeding Script

For easy maintenance, we've created a combined script `scripts/seedHotelRequests.ts` that runs both the housekeeping types and dining requests seeding in sequence.

## Running the Scripts

To populate or update the data, run:

```bash
# Update hotel information
npx tsx scripts/updateHotelInfo.ts

# Seed various announcement types
npx tsx scripts/seedAnnouncementTypes.ts

# Seed housekeeping types and dining requests
npx tsx scripts/seedHotelRequests.ts
```

## Data Status

After running these scripts, the Inn at Hastings Park hotel should have:

1. Complete hotel information (address, contact details)
2. At least 25 announcements with various types
3. 7 housekeeping service types
4. At least 5 dining requests

This data ensures that the guest-facing application will display appropriate options and content for hotel services.

## Notes

- All seed scripts are designed to be idempotent - they can be run multiple times without duplicating data.
- The scripts check for existing data before attempting to create new entries.
- The combined script provides a summary of the seeding operations. 