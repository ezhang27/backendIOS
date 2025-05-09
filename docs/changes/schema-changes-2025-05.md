# Schema Changes - May 2025

This document details the schema changes implemented in May 2025, including the room service implementation and other recent modifications to the SelfServe backend.

## Room Service Implementation

### New Tables

The following tables were added to support room service functionality:

#### `roomservicemenu`

Stores information about available room service menus.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `hotelid` | UUID | Reference to hotel |
| `menuname` | TEXT | Name of the menu |
| `description` | TEXT | Description of the menu |
| `isactive` | BOOLEAN | Whether the menu is currently active |
| `createdat` | TIMESTAMP | Creation timestamp |
| `updatedat` | TIMESTAMP | Last update timestamp |

#### `roomservicemenuitem`

Stores information about items available on room service menus.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `menuid` | UUID | Reference to room service menu |
| `name` | TEXT | Name of the item |
| `description` | TEXT | Description of the item |
| `price` | DECIMAL | Price of the item |
| `isactive` | BOOLEAN | Whether the item is currently available |
| `category` | TEXT | Category of the item (e.g., "Breakfast", "Lunch") |
| `createdat` | TIMESTAMP | Creation timestamp |
| `updatedat` | TIMESTAMP | Last update timestamp |

#### `roomservicemenuschedule`

Stores schedule information for when room service menus are available.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `menuid` | UUID | Reference to room service menu |
| `day` | DAY_OF_WEEK | Day of the week (ENUM type) |
| `starttime` | TIME | Start time when menu is available |
| `endtime` | TIME | End time when menu is no longer available |
| `createdat` | TIMESTAMP | Creation timestamp |
| `updatedat` | TIMESTAMP | Last update timestamp |

### New ENUM Types

#### `DAY_OF_WEEK`

Represents days of the week.

```sql
CREATE TYPE DAY_OF_WEEK AS ENUM (
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
);
```

### Foreign Key Relationships

The following foreign key relationships were implemented:

- `roomservicemenuitem.menuid` → `roomservicemenu.id` (ON DELETE CASCADE)
- `roomservicemenuschedule.menuid` → `roomservicemenu.id` (ON DELETE CASCADE)
- `roomservicemenu.hotelid` → `hotel.id` (ON DELETE CASCADE)

## Restaurant Operating Hours

### New Table

#### `restaurantschedule`

Stores operating hours for restaurant facilities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `restaurantid` | UUID | Reference to restaurant |
| `day` | DAY_OF_WEEK | Day of the week |
| `openingtime` | TIME | Opening time |
| `closingtime` | TIME | Closing time |
| `isopen` | BOOLEAN | Whether restaurant is open on this day |
| `createdat` | TIMESTAMP | Creation timestamp |
| `updatedat` | TIMESTAMP | Last update timestamp |

### Foreign Key Relationships

- `restaurantschedule.restaurantid` → `restaurant.id` (ON DELETE CASCADE)

## Special Products

### New Table

#### `specialproduct`

Stores information about special products/services offered by the hotel.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `hotelid` | UUID | Reference to hotel |
| `name` | TEXT | Name of the special product |
| `description` | TEXT | Description of the product |
| `price` | DECIMAL | Price of the product |
| `category` | PRODUCT_CATEGORY | Category of the product |
| `isactive` | BOOLEAN | Whether the product is currently available |
| `createdat` | TIMESTAMP | Creation timestamp |
| `updatedat` | TIMESTAMP | Last update timestamp |

### New ENUM Types

#### `PRODUCT_CATEGORY`

Categorizes special products.

```sql
CREATE TYPE PRODUCT_CATEGORY AS ENUM (
  'CELEBRATION',
  'AMENITY',
  'EXPERIENCE',
  'SERVICE',
  'OTHER'
);
```

### Foreign Key Relationships

- `specialproduct.hotelid` → `hotel.id` (ON DELETE CASCADE)

## Guest Profile Refinements

### Updated Table

#### `guestprofile`

Added new columns for improved profile management:

| New Column | Type | Description |
|------------|------|-------------|
| `language` | TEXT | Preferred language |
| `dietaryrestrictions` | TEXT[] | Array of dietary restrictions |

## ON DELETE Policy Implementation

The following ON DELETE CASCADE policies were implemented for existing tables to ensure data integrity:

- `request.guestid` → `guestprofile.id` (ON DELETE CASCADE)
- `feedback.guestid` → `guestprofile.id` (ON DELETE CASCADE)
- `message.guestid` → `guestprofile.id` (ON DELETE CASCADE)
- `request.hotelid` → `hotel.id` (ON DELETE CASCADE)
- `facility.hotelid` → `hotel.id` (ON DELETE CASCADE)
- `restaurant.hotelid` → `hotel.id` (ON DELETE CASCADE)

## API Changes

### New Guest API Endpoints

- `GET /api/guest/hotel/roomservice/menus` - Get all active room service menus with items
- `GET /api/guest/hotel/roomservice/menus/:menuId/schedule` - Get schedule for a specific menu

### New Management API Endpoints

- `GET /api/management/hotel/roomservice/menus` - Get all room service menus
- `POST /api/management/hotel/roomservice/menus` - Create a new room service menu
- `PUT /api/management/hotel/roomservice/menus/:menuId` - Update a room service menu
- `DELETE /api/management/hotel/roomservice/menus/:menuId` - Delete a room service menu
- `GET /api/management/hotel/roomservice/menus/:menuId/items` - Get all items for a menu
- `POST /api/management/hotel/roomservice/menus/:menuId/items` - Create a new menu item
- `PUT /api/management/hotel/roomservice/menus/:menuId/items/:itemId` - Update a menu item
- `DELETE /api/management/hotel/roomservice/menus/:menuId/items/:itemId` - Delete a menu item
- `GET /api/management/hotel/roomservice/menus/:menuId/schedules` - Get all schedules for a menu
- `POST /api/management/hotel/roomservice/menus/:menuId/schedules` - Create a new menu schedule
- `PUT /api/management/hotel/roomservice/menus/:menuId/schedules/:scheduleId` - Update a menu schedule
- `DELETE /api/management/hotel/roomservice/menus/:menuId/schedules/:scheduleId` - Delete a menu schedule
- `GET /api/management/hotel/specialproducts` - Get all special products
- `POST /api/management/hotel/specialproducts` - Create a new special product
- `PUT /api/management/hotel/specialproducts/:productId` - Update a special product
- `DELETE /api/management/hotel/specialproducts/:productId` - Delete a special product
- `GET /api/management/dining/restaurants/:restaurantId/schedule` - Get restaurant operating hours
- `PUT /api/management/dining/restaurants/:restaurantId/schedule/:day` - Update restaurant operating hours

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Room Service Tables | Complete | All tables created and properly related |
| Room Service Management API | Complete | Full CRUD operations for menus, items, and schedules |
| Room Service Guest API | Complete | Read operations for active menus and schedules |
| Restaurant Operating Hours | Complete | Table and API endpoints implemented |
| Special Products | Complete | Table and API endpoints implemented |
| Guest Profile Refinements | Complete | New columns added |
| ON DELETE Policies | Complete | All foreign key relationships updated |
| DAY_OF_WEEK ENUM | Complete | Used in room service and restaurant schedules |
| PRODUCT_CATEGORY ENUM | Complete | Used in special products |

## Migration Scripts

Migration scripts for these changes are available in the `migrations` folder:

- `20250501_room_service_tables.sql`
- `20250502_restaurant_schedule.sql`
- `20250503_special_products.sql`
- `20250504_guest_profile_refinements.sql`
- `20250505_on_delete_policies.sql`

## Documentation

Updated API documentation for these changes is available in:

- [Guest API Reference](../api/guest-api.md)
- [Management API Reference](../api/management-api.md)
- [API Testing Guide](../testing/api-testing-guide.md) 