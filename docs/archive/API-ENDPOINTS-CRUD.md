# SelfServe API Endpoints CRUD Matrix

This document provides a comprehensive overview of all API endpoints in the SelfServe backend and their supported CRUD operations.

## Legend

- ✅ = Implemented
- ❌ = Not Implemented
- 🟡 = Partially Implemented

| **Entity Type** | **Endpoint** | **Create** | **Read** | **Update** | **Delete** | **Notes** |
|-----------------|--------------|------------|----------|------------|------------|-----------|

## Guest API

| **Entity Type** | **Endpoint** | **Create** | **Read** | **Update** | **Delete** | **Notes** |
|-----------------|--------------|------------|----------|------------|------------|-----------|
| **Base** | `/api/guest` | - | ✅ | - | - | Welcome message only |
| **Profile** | `/api/guest/profile` | - | ✅ | - | - | Get guest profile |
| **Profile Preferences** | `/api/guest/profile/preferences` | - | - | ✅ | - | Update preferences |
| **Dietary Restrictions** | `/api/guest/profile/dietary-restrictions` | - | - | ✅ | - | Update dietary restrictions |
| **General Requests** | `/api/guest/general-requests` | ✅ | ✅ | - | - | List and create |
| **General Request (Single)** | `/api/guest/general-requests/:requestId` | - | ✅ | - | - | Get specific request |
| **General Request Cancel** | `/api/guest/general-requests/:requestId/cancel` | - | - | ✅ | - | Cancel a request |
| **Dining Requests** | `/api/guest/dining-requests` | ✅ | ✅ | - | - | List and create |
| **Dining Request (Single)** | `/api/guest/dining-requests/:requestId` | - | ✅ | - | - | Get specific request |
| **Dining Request Cancel** | `/api/guest/dining-requests/:requestId/cancel` | - | - | ✅ | - | Cancel a request |
| **Reservation Requests** | `/api/guest/reservation-requests` | ✅ | ✅ | - | - | List and create |
| **Reservation Request (Single)** | `/api/guest/reservation-requests/:requestId` | - | ✅ | - | - | Get specific request |
| **Reservation Request Cancel** | `/api/guest/reservation-requests/:requestId/cancel` | - | - | ✅ | - | Cancel a request |
| **Hotel** | `/api/guest/hotel/:hotelId` | - | ✅ | - | - | Get hotel details |
| **Hotel Events** | `/api/guest/hotel/:hotelId/events` | - | ✅ | - | - | Get hotel events |
| **Hotel Rooms** | `/api/guest/hotel/:hotelId/rooms` | - | ✅ | - | - | Get hotel rooms |
| **Hotel Restaurants** | `/api/guest/hotel/:hotelId/restaurants` | - | ✅ | - | - | Get hotel restaurants |
| **Hotel Facilities** | `/api/guest/hotel/:hotelId/facilities` | - | ✅ | - | - | Get hotel facilities |
| **Hotel Facilities By Type** | `/api/guest/hotel/:hotelId/facilities/:type` | - | ✅ | - | - | Get facilities by type |
| **Restaurant Menus** | `/api/guest/hotel/:hotelId/restaurants/:restaurantId/menus` | - | ✅ | - | - | Get restaurant menus |
| **Menu Items** | `/api/guest/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/items` | - | ✅ | - | - | Get menu items |
| **Menu Schedule** | `/api/guest/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/schedule` | - | ✅ | - | - | Get menu schedule |
| **Room Service** | `/api/guest/hotel/:hotelId/room-service` | - | ✅ | - | - | Get room service menus |
| **Housekeeping Types** | `/api/guest/hotel/:hotelId/housekeeping-types` | - | ✅ | - | - | Get housekeeping types |
| **Special Products** | `/api/guest/hotel/:hotelId/special-products` | - | ✅ | - | - | Get special products |
| **Messages** | `/api/guest/messages` | - | ✅ | - | - | List messages |
| **Message (Single)** | `/api/guest/messages/:messageId` | - | ✅ | - | - | Get specific message |
| **Announcements** | `/api/guest/messages/announcements` | - | ✅ | - | - | List announcements |
| **Feedback** | `/api/guest/feedback` | ✅ | ✅ | - | - | List and submit feedback |
| **Feedback Categories** | `/api/guest/feedback/categories` | - | ✅ | - | - | Get feedback categories |
| **Feedback Types** | `/api/guest/feedback/types` | - | ✅ | - | - | Get feedback types |
| **Feedback Rating** | `/api/guest/feedback/rating` | ✅ | - | - | - | Submit rating |
| **Guest Balance** | `/api/guest/balance` | - | ❌ | - | - | Not implemented |
| **Guest Transactions** | `/api/guest/transactions` | - | ❌ | - | - | Not implemented |
| **Guest Notifications** | `/api/guest/notifications` | - | ❌ | - | - | Not implemented |
| **Notification Settings** | `/api/guest/notifications/settings` | - | ❌ | ❌ | - | Not implemented |

## Management API

| **Entity Type** | **Endpoint** | **Create** | **Read** | **Update** | **Delete** | **Notes** |
|-----------------|--------------|------------|----------|------------|------------|-----------|
| **Base** | `/api/management` | - | ✅ | - | - | Welcome message only |
| **All Requests** | `/api/management/requests` | - | ✅ | - | - | List all requests |
| **Request (Single)** | `/api/management/requests/:requestId` | - | ✅ | - | - | Get specific request |
| **Request Status** | `/api/management/requests/:requestId/status` | - | - | ✅ | - | Update request status |
| **Hotel** | `/api/management/hotel/:hotelId` | - | ✅ | ✅ | - | Get and update hotel details |
| **Hotel Events** | `/api/management/hotel/:hotelId/events` | ✅ | ✅ | - | - | Get and create events |
| **Hotel Event (Single)** | `/api/management/hotel/:hotelId/events/:eventId` | - | - | ✅ | ✅ | Update and delete event |
| **Hotel Rooms** | `/api/management/hotel/:hotelId/rooms` | ✅ | ✅ | - | - | Get and create rooms |
| **Hotel Room (Single)** | `/api/management/hotel/:hotelId/rooms/:roomId` | - | - | ✅ | ✅ | Update and delete room |
| **Hotel Restaurants** | `/api/management/hotel/:hotelId/restaurants` | ✅ | ✅ | - | - | Get and create restaurants |
| **Hotel Restaurant (Single)** | `/api/management/hotel/:hotelId/restaurants/:restaurantId` | - | - | ✅ | ✅ | Update and delete restaurant |
| **Hotel Facilities** | `/api/management/hotel/:hotelId/facilities` | ✅ | ✅ | - | - | Get and create facilities |
| **Hotel Facility (Single)** | `/api/management/hotel/:hotelId/facilities/:facilityId` | - | - | ✅ | ✅ | Update and delete facility |
| **Restaurant Menus** | `/api/management/hotel/:hotelId/restaurants/:restaurantId/menus` | ✅ | ✅ | - | - | Get and create menus |
| **Restaurant Menu (Single)** | `/api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId` | - | - | ✅ | ✅ | Update and delete menu |
| **Menu Items** | `/api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/items` | ✅ | ✅ | - | - | Get and create menu items |
| **Menu Item (Single)** | `/api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/items/:itemId` | - | - | ✅ | ✅ | Update and delete menu item |
| **Menu Schedules** | `/api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/schedules` | ✅ | ✅ | - | - | Get and create schedules |
| **Menu Schedule (Single)** | `/api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/schedules/:scheduleId` | - | - | ✅ | ✅ | Update and delete schedule |
| **Feedback** | `/api/management/feedback` | - | ✅ | - | - | List all feedback |
| **Feedback (Single)** | `/api/management/feedback/:feedbackId` | - | ✅ | - | - | Get specific feedback |
| **Feedback Types** | `/api/management/feedback/types/all` | - | ✅ | - | - | Get all feedback types |
| **Messages** | `/api/management/messages` | ✅ | ✅ | - | - | List and send messages |
| **Message Types** | `/api/management/messages/types` | - | ✅ | - | - | Get message types |
| **Announcements** | `/api/management/messages/announcements` | ✅ | ✅ | - | - | List and create announcements |
| **Employees** | `/api/management/employees` | ✅ | ✅ | - | - | List and create employees |
| **Employee (Single)** | `/api/management/employees/:employeeId` | - | ✅ | - | ✅ | Get and delete employee |
| **Current Employee** | `/api/management/employees/me` | - | ✅ | - | - | Get authenticated employee |
| **Employee Role** | `/api/management/employees/:employeeId/role` | - | - | ✅ | - | Update employee role |
| **Employee Profile** | `/api/management/employees/:employeeId/profile` | - | - | ✅ | - | Update employee profile |
| **Employee Roles** | `/api/management/employees/roles/all` | - | ✅ | - | - | Get all roles |
| **Dining Requests** | `/api/management/dining` | - | ✅ | - | - | List dining requests |
| **Dining Request (Single)** | `/api/management/dining/:requestId` | - | ✅ | - | - | Get specific dining request |
| **Dining Request Status** | `/api/management/dining/:requestId/status` | - | - | ✅ | - | Update dining request status |
| **Dining Request Payment** | `/api/management/dining/:requestId/payment` | - | - | ✅ | - | Update payment status |
| **Reservation Requests** | `/api/management/reservation-requests` | - | ✅ | - | - | List reservation requests |
| **Reservation Request (Single)** | `/api/management/reservation-requests/:requestId` | - | ✅ | - | - | Get specific reservation request |
| **Reservation Request Status** | `/api/management/reservation-requests/:requestId/status` | - | - | ✅ | - | Update reservation request status |
| **General Requests** | `/api/management/general` | - | ✅ | - | - | List general requests |
| **General Request (Single)** | `/api/management/general/:requestId` | - | ✅ | - | - | Get specific general request |
| **General Request Status** | `/api/management/general/:requestId/status` | - | - | ✅ | - | Update general request status |
| **General Request Categories** | `/api/management/general/categories/all` | - | ✅ | - | - | Get all categories |
| **Special Products** | `/api/management/special-products` | ✅ | ✅ | - | - | List and create special products |
| **Special Product (Single)** | `/api/management/special-products/:productId` | - | ✅ | ✅ | ✅ | Get, update, and delete product |
| **Housekeeping Types** | `/api/management/housekeeping-types` | ✅ | ✅ | - | - | List and create housekeeping types |
| **Housekeeping Type (Single)** | `/api/management/housekeeping-types/:typeId` | - | ✅ | ✅ | ✅ | Get, update, and delete type |
| **Prices** | `/api/management/prices` | ✅ | ✅ | - | - | List and create prices |
| **Price (Single)** | `/api/management/prices/:priceId` | - | ✅ | ✅ | ✅ | Get, update, and delete price |
| **Analytics/Dashboard** | `/api/management/analytics/*` | - | ❌ | - | - | Not implemented |
| **Employee Bulk Operations** | `/api/management/employees/bulk` | ❌ | - | - | - | Not implemented |
| **Guest Management** | `/api/management/guests` | - | ❌ | - | - | Not implemented |
| **Guest Profile (Single)** | `/api/management/guests/:guestId` | - | ❌ | - | - | Not implemented |
| **Guest Notes** | `/api/management/guests/:guestId/notes` | ❌ | ❌ | ❌ | ❌ | Not implemented |
| **Notifications** | `/api/management/notifications` | ❌ | ❌ | - | - | Not implemented |

## Missing Endpoints Summary

### Guest API Missing Endpoints
1. **Guest Balance/Transactions**
   - `/api/guest/balance` (GET) - View current balance
   - `/api/guest/transactions` (GET) - View transaction history

2. **Notifications**
   - `/api/guest/notifications` (GET) - Get all notifications
   - `/api/guest/notifications/:notificationId/read` (PUT) - Mark as read
   - `/api/guest/notifications/settings` (PUT) - Update notification preferences

3. **Hotel Check-in Process**
   - `/api/guest/auth/hotel-select` (POST) - Set selected hotel
   - `/api/guest/auth/check-in` (POST) - Digital check-in

### Management API Missing Endpoints
1. **Analytics/Dashboard**
   - `/api/management/analytics/requests` (GET) - Request analytics
   - `/api/management/analytics/guest-feedback` (GET) - Feedback analytics
   - `/api/management/analytics/occupancy` (GET) - Occupancy analytics

2. **Employee Management Extensions**
   - `/api/management/employees/bulk` (POST) - Bulk create employees
   - `/api/management/employees/roles` (GET) - Get all employee roles

3. **Guest Management**
   - `/api/management/guests` (GET) - List all guests
   - `/api/management/guests/:guestId` (GET) - Get guest profile
   - `/api/management/guests/:guestId/notes` (GET/POST/PUT/DELETE) - Guest notes

4. **Notification Management**
   - `/api/management/notifications` (GET) - List notifications
   - `/api/management/notifications/bulk` (POST) - Send bulk notifications

## Implementation Next Steps

Based on this matrix, the recommended implementation priorities are:

1. **Authentication Integration**
   - Implement Clerk authentication for all endpoints

2. **Critical Guest Experience Endpoints**
   - Implement notification endpoints
   - Add balance/transaction endpoints

3. **Management Dashboard Enhancements**
   - Add analytics endpoints
   - Implement guest management features

4. **Guest Notes Functionality**
   - Complete CRUD operations for guest notes 