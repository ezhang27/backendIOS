# Seed Data Documentation

This document provides an overview of the database seeding process implemented in `scripts/compositeSeed.ts`. The seed file creates all necessary data for both "Inn at Hastings Park" and "The Grand City Plaza" hotels, including employees, guests, rooms, reservations, and various request types.

## Database Tables Seeding Status

The following checklist indicates which tables from the database schema are populated by the seed file:

| Table Name | Seeded | Notes |
|------------|:------:|-------|
| `address` | ✅ | For hotels, restaurants, and guests |
| `addresstype` | ✅ | Types like 'Home', 'Work', 'Billing' |
| `announcement` | ❌ | Structure exists, but no new announcements are seeded. |
| `bedroom` | ✅ | Bed types for rooms |
| `building` | ✅ | Hotel buildings |
| `charge` | ❌ | Structure exists, but no new charges are seeded. |
| `contacttype` | ✅ | Types of contact information |
| `country` | ✅ | Country records |
| `currency` | ✅ | Currency records (USD, etc.) |
| `dietaryrestriction` | ✅ | Dietary restrictions for menu items |
| `diningorderitem` | ✅ | Items in dining orders (including for room service) |
| `diningrequest` | ✅ | Restaurant and room service requests |
| `donotdisturbschedule` | ❌ | |
| `emailaddress` | ✅ | Guest email addresses |
| `employee` | ✅ | Hotel staff |
| `eventbooking` | ❌ | |
| `eventparticipant` | ❌ | |
| `eventquestion` | ❌ | |
| `eventquestionresponse` | ❌ | |
| `eventtimeslot` | ❌ | |
| `facility` | ✅ | Hotel facilities like spa, gym |
| `feedbackcategory` | ✅ | Categories for guest feedback |
| `feedbackrating` | ✅ | Sample feedback ratings are seeded. |
| `feedbacktype` | ✅ | Types of feedback |
| `generalrequest` | ✅ | General guest requests |
| `guest` | ✅ | Hotel guests |
| `guestaddress` | ✅ | Guest address associations |
| `guestdietaryrestriction` | ✅ | Sample guest dietary restrictions are seeded. |
| `guestfeedback` | ❌ | |
| `guestpreference` | ❌ | |
| `hotel` | ✅ | Main hotel records |
| `hotelemail` | ✅ | Hotel email addresses |
| `hotelevent` | ✅ | Events hosted by hotels |
| `hotelphone` | ✅ | Hotel phone numbers |
| `housekeeping` | ✅ | Housekeeping tasks |
| `housekeepingschedule` | ❌ | |
| `housekeepingtype` | ✅ | Types of housekeeping services |
| `importantdate` | ❌ | |
| `inventoryitem` | ❌ | Structure exists, but no new inventory items are seeded. |
| `itemassignment` | ❌ | |
| `language` | ✅ | Language records |
| `menudietaryrestriction` | ✅ | Dietary info for menu items |
| `menuitem` | ✅ | Restaurant menu items |
| `menuitemmodification` | ✅ | Links menu items to their modifiers. |
| `menuitemmodifier` | ✅ | Modifiers for menu items |
| `menuoperatingschedule` | ❌ | Specific schedules for general restaurant menus not directly seeded; see `restaurantoperatingschedule` and `roomservicemenuschedule`. |
| `message` | ❌ | |
| `messagetype` | ✅ | Types of messages |
| `modificationrestriction` | ❌ | |
| `name` | ✅ | Name records for people |
| `notification` | ❌ | |
| `permission` | ✅ | System permissions |
| `phonenumber` | ✅ | Guest phone numbers |
| `price` | ✅ | Price records for items/services |
| `region` | ✅ | Geographic regions |
| `request` | ✅ | Base request records |
| `reservation` | ✅ | Guest reservations |
| `reservationcomment` | ❌ | |
| `reservationrequest` | ✅ | Facility reservation requests |
| `restaurant` | ✅ | Hotel restaurants |
| `restaurantmenu` | ✅ | Restaurant menus |
| `restaurantoperatingschedule` | ✅ | Schedule for restaurants |
| `role` | ✅ | Staff roles |
| `rolepermission` | ✅ | Role-permission associations |
| `room` | ✅ | Hotel rooms |
| `roomreservation` | ✅ | Room-reservation associations |
| `roomserviceitem` | ✅ | Room service menu items |
| `roomservicemenu` | ✅ | Room service menus |
| `roomservicemenuschedule` | ✅ | Schedule for room service |
| `scheduleinterval` | ✅ | Time intervals for schedules |
| `schema_migrations` | ❌ | System table, not seeded directly |
| `servicepackage` | ❌ | |
| `servicetype` | ❌ | |
| `specialproducts` | ❌ | |
| `state` | ✅ | State/province records |
| `temperatureschedule` | ❌ | |
| `wakeupcall` | ❌ | |

## Important IDs in Seed Data

The seed file defines and tracks the following important IDs:

### Hotel IDs

```typescript
const HASTINGS_PARK_HOTEL_ID = 'e9f07880-2083-4d39-8b05-6efba294c94e'; // Inn at Hastings Park
const TEST_HOTEL_ID = '97877ada-b254-41ba-8ce0-d3188d9f5f15'; // The Grand City Plaza
```

### Guest IDs

Guest IDs are dynamically generated during seeding, but tracked by the following variables in `compositeSeed.ts`:

| Guest Name | Email/UserID | Variable Name |
|------------|--------------|---------------|
| Alice Wonderland | alice.wonderland@example.com | `aliceWonderlandGuestId` |
| Bob The Builder | bob.builder@example.com | `bobTheBuilderGuestId` |
| Charlie Chaplin | charlie.chaplin@example.com | `charlieChaplinGuestId` |
| Michael Davis | michael.davis@example.com | `michaelDavisGuestId` |
| Sarah Chen | sarah.chen@example.com | `sarahChenGuestId` |

### Employee IDs

Employee IDs are dynamically generated during seeding. The following employees are created:

#### Inn at Hastings Park Employees

| Name | Role | Email/UserID |
|------|------|--------------|
| John Doe | General Manager | john.doe@hastings.com |
| Jane Smith | Front Desk Supervisor | jane.smith@hastings.com |
| Robert Brown | Housekeeping Supervisor | robert.brown@hastings.com |
| Emily Davis | Restaurant Manager | emily.davis.rm@hastings.com |
| Michael Wilson | Chef | michael.wilson.chef@hastings.com |
| Jessica Garcia | Concierge | jessica.garcia@hastings.com |
| Linda Rodriguez | Hotel Admin | linda.rodriguez.admin@hastings.com |
| Sarah Miller | Front Desk Staff | sarah.miller@hastings.com |
| David Martinez | Housekeeper | david.martinez@hastings.com |

#### The Grand City Plaza Employees

| Name | Role | Email/UserID |
|------|------|--------------|
| Admin PlazaUser | Hotel Admin | admin@grandcityplaza.com |
| Staff PlazaMember | Hotel Staff | staff@grandcityplaza.com |
| Front PlazaDesk | Front Desk Staff | frontdesk@grandcityplaza.com |
| House PlazaKeeper | Housekeeper | housekeeper@grandcityplaza.com |

### Reservation IDs

Reservation IDs are dynamically generated during seeding. The script creates:

#### Inn at Hastings Park Reservations

- Active reservation for Alice Wonderland (current date range)
- Future reservation for Bob The Builder (next week)
- Past reservation for Charlie Chaplin (last month, completed)

#### The Grand City Plaza Reservations

- Active reservation for Michael Davis (current date range)
- Future reservation for Sarah Chen (next week)

## Room Service Data

Room service data is organized into four menus for Inn at Hastings Park:

1. **Breakfast Menu** - Available 6:00 AM - 11:00 AM
   - Includes: Continental Breakfast, Mesa Pancakes, Farm Fresh Eggs, Steel-Cut Oatmeal, Avocado Toast, Breakfast Bowl, Linguiça Hash, various Omelettes, Sides, Coffee, Tea, Juice, Kombucha.

2. **Lunch Menu** - Available 11:30 AM - 2:30 PM
   - Includes: New England Clam Chowder, Cheese Board, Smoked Bluefish Pate, Simple Salad, Traditional Caesar Salad, Winter Citrus Salad.

3. **Dinner Menu** - Available 5:00 PM - 10:00 PM
   - Includes: Grain Bowl, Daily Quiche, Scallop Roll, Hastings Burger, Risotto, Arctic Char, Local Oysters, 1930s New England Rum Tart, Lemon Posset, Bete Noire, Affogato, Rancatore's Ice Cream/Sorbet.

4. **All Day Menu** - Available 6:00 AM - 10:00 PM
   - Includes: Broadsheet Coffee, J'enwey Tea Co., Kombucha, Juice Selections.

## Running the Seed File

To run the seed file and populate the database:

```bash
node -r ts-node/register scripts/compositeSeed.ts
```

This will clear existing data (as defined in the script) and populate tables with the seed data. 