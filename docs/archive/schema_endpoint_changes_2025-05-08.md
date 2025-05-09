# API Review Summary & Frontend Changes (May 8, 2024)

This document summarizes the findings and changes made during the backend API review conducted on May 8, 2024. The review focused on aligning the Management (`/api/management`) and Guest (`/api/guest`) APIs with recent schema updates, improving consistency, and addressing functional gaps.

## Backend API Review Checklist

**Overall Goal:** Review Management and Guest APIs (`src/api/management/`, `src/api/guest/`) for schema alignment, functionality correctness, consistency, and potential issues after recent schema changes.

**I. Schema & Documentation Review:**
*   [x] Read `src/models/schema.ts` to understand current table structures.
*   [x] Read `db/DATABASE.MD` for context and changelog.
*   [x] Noted key schema changes (e.g., `GuestID` removed, `HotelID` added, contact info normalized).

**II. Management API (`src/api/management/`) Review:**
*   [x] `specialProducts.ts`: Reviewed - **Re-confirmed Alignment Post Schema Change.**
    *   [x] Schema: `specialproducts` table now defines hotel-specific products (no `GuestID`, `Quantity`; adds `HotelID`, `PriceID`). `productid` is PK. Unique on `(HotelID, Name)`.
    *   [x] Endpoints (GET, POST, PUT, DELETE): All correctly manage these hotel-specific product definitions and their associated prices. Aligned with schema. No code changes were needed in this file.
*   [x] `general.ts`: Reviewed - Aligned and functional.
*   [x] `requests.ts`: Reviewed - Aligned and functional.
*   [x] `prices.ts`: Reviewed - Aligned and functional.
*   [x] `hotel.ts`: Reviewed & Edited
    *   [x] Events: Aligned GET/POST (removed `starttime`/`endtime`).
    *   [x] Rooms: Aligned POST/PUT (explicit fields, validation).
    *   [x] Facilities: Aligned POST/PUT (explicit fields, validation).
    *   [x] Restaurants: Aligned POST/PUT (explicit fields, validation).
    *   [x] Menus: Aligned POST/PUT (explicit fields, validation).
    *   [x] **Room Service: FULLY IMPLEMENTED**
        *   [x] Room Service Menus: Added complete CRUD endpoints.
        *   [x] Room Service Items: Added complete CRUD endpoints.
        *   [x] Room Service Schedules: Added complete CRUD endpoints.
*   [x] `reservation-requests.ts`: Reviewed & Edited
    *   [x] Aligned PUT status (casing).
    *   [x] Removed manual timestamps.
    *   [x] Added re-fetch logic for POST response consistency.
*   [x] `messages.ts`: Reviewed & Edited
    *   [x] Corrected guest contact fetching in GET `/`.
    *   [x] Removed manual timestamps.
*   [x] `dining.ts`: **Reviewed & Edited - FULLY IMPLEMENTED**
    *   [x] **Schema Usage:** Uses `diningrequest`, `request`, `diningorderitem`, `menuitem`, `roomserviceitem`, `price`, `currency`, `requestStatusEnum`, `diningRequestPaymentStatusEnum`.
    *   [x] **`GET /` and `GET /:requestId`:** Fetches dining requests with comprehensive details including guest info, room, restaurant, and order items with pricing. Pagination and filtering by status and payment status implemented. Uses `diningRequestPaymentStatusEnum` for payment status filtering.
    *   [x] **`PUT /:requestId/status`:** Updates dining request status in the `request` table using `requestStatusEnum`. Sets `completedat` timestamp correctly.
    *   [x] **`PUT /:requestId/payment`:** Updates dining request payment status and method. Uses `diningRequestPaymentStatusEnum` for validating `paymentStatus`.
    *   **TODOs Addressed/Updated:**
        *   [x] Validate `paymentStatus` against an enum: `diningRequestPaymentStatusEnum` created in `schema.ts` and implemented in `dining.ts` for validation in `GET /` and `PUT /:requestId/payment`.
        *   [x] **IMPLEMENTED** - Cascading payment status updates to related `charge` records: The implementation now identifies all charges associated with order items in a dining request and updates them based on payment status changes:
            * For "Paid" status: Sets `ispaid = true`, updates `paidtimestamp`, adds audit notes
            * For "Failed"/"Waived"/"Refunded" status: Updates `description` with status marker, adds audit notes
            * All updates occur within a transaction to ensure data consistency
    *   **Overall:** Fully aligned with schema requirements with comprehensive transaction handling for payment status updates and charge records.

**III. Guest API (`src/api/guest/`) Review:**
*   [x] `profile.ts`: Reviewed & Edited
    *   [x] Removed manual timestamps.
    *   [x] Expanded `PUT /` response for better consistency.
    *   [x] Noted complexity of PUT contact/address replacement logic (requires thorough testing).
    *   [x] Confirmed reliance on external AuthN/AuthZ (Clerk assumed).
*   [x] `hotel.ts`: Reviewed & Edited
    *   [x] Added missing price information to `GET .../items` response.
    *   [x] Noted lack of restaurant schedules in main list (performance consideration).
    *   [x] **`GET /:hotelId/special-products`**: This endpoint correctly lists active special products *defined by the hotel*, including their price details. Aligned with the schema change where special products are hotel-level definitions. No POST/PUT/DELETE for guests to "order" special products directly via a `specialproducts` table record, as this table is now definitional. Guest orders would likely be handled via creating `Charge` records in the backend, linked to the `specialproducts.productid`.
    *   [x] **Room Service: FULLY IMPLEMENTED**
        *   [x] **`GET /:hotelId/room-service`**: This endpoint correctly returns all room service menus with their items and price details.
        *   [x] **`GET /:hotelId/room-service/:menuId/schedule`**: Added new endpoint to retrieve operating schedules for a specific room service menu.
*   [x] `dining-requests.ts`: Reviewed & Edited
    *   [x] Removed manual timestamps.
    *   [x] Standardized POST/PUT responses (re-fetch full object).
    *   [x] Refined count query.
    *   [x] Added TODO comment for tax calculation.
    *   [x] **IMPLEMENTED** - Charge voiding logic on cancel:
        *   [x] Added transaction-based implementation in `PUT /:requestId/cancel`
        *   [x] Finds all dining order items for the request and their linked charges
        *   [x] Updates payment status to "Failed" using `diningRequestPaymentStatusEnum`
        *   [x] Marks relevant charges as voided: adds `[VOIDED]` suffix to description, zeroes amounts, adds audit notes
        *   [x] Only voids unpaid charges to avoid accounting issues with already-paid charges
*   [x] `reservation-requests.ts`: Reviewed & Edited
    *   [x] Removed manual timestamps.
    *   [x] Standardized POST/PUT responses (re-fetch full object).
    *   [x] Refined count query.
*   [x] `general-requests.ts`: Reviewed & Edited
    *   [x] Removed manual timestamps.
    *   [x] Standardized POST/PUT responses (re-fetch full object).
    *   [x] Refined count query.
    *   [x] **IMPLEMENTED** - Charge voiding logic on cancel:
        *   [x] Added transaction-based implementation in `PUT /:requestId/cancel`
        *   [x] Finds charges related to general request by reservation ID, guest ID, hotel ID, and matching description
        *   [x] Marks charges as voided: adds `[VOIDED]` suffix to description, zeroes amounts, adds audit notes
        *   [x] Only voids unpaid charges to preserve financial records for paid charges
*   [x] `messages.ts`: Reviewed & Edited
    *   [x] Standardized ID source (Headers only).
    *   [x] Refined count query.
    *   [x] **PARTIALLY IMPLEMENTED** - `isread` functionality:
        *   [x] Implemented `POST /:messageId/read` endpoint to acknowledge message read status
        *   [x] **LIMITATION**: The message table currently lacks an `isread` boolean field in the schema
        *   [x] Current implementation updates the message timestamp but indicates that proper read status tracking requires a schema update
        *   [x] Added note in code documentation about schema requirements for full implementation
*   [x] `feedback.ts`: Reviewed & Edited
    *   [x] Re-enabled `POST /` endpoint.
    *   [x] Removed manual timestamps.
    *   [x] Standardized error handling (`asyncHandler`).
    *   [x] Standardized POST responses (return created object).
    *   [x] Refined count query.
*   [x] `index.ts`: Reviewed
    *   [x] Confirmed all routers are correctly mounted.
    *   [x] Confirmed comment regarding external authentication (Clerk).

**IV. Cross-Cutting Concerns & Findings:**
*   [x] **Timestamp Handling:** Removed most manual settings in favor of DB defaults (requires schema verification).
*   [x] **Type Definitions (`src/types/entities.ts`)**:
    *   [x] `SpecialProducts` interface updated to align with schema (removed `guestId`, `quantity`; added `hotelId`, `priceId`, `isActive`, and joined price fields).
*   [x] **Response Consistency:** Standardized POST/PUT/Cancel responses where appropriate to return the full updated/created object.
*   [x] **Error Handling:** Ensured consistent use of `asyncHandler` and custom error classes.
*   [x] **Authentication:** Externalized to Clerk (assumed handled by middleware setting headers like `X-Guest-ID`).
*   [x] **Charge Voiding Logic:** **IMPLEMENTED** - Added transaction-based implementations for cancellable requests (Dining, General) with associated charges.
*   [ ] **Tax Calculation:** **SIGNIFICANT GAP** - Needs implementation, especially for Dining requests.
*   [x] **Message `isread` Flag:** **PARTIALLY IMPLEMENTED** - Basic acknowledgement endpoint functions, but full tracking requires schema update.
*   [ ] **Database Defaults:** Need verification that `createdat`/`updatedat` defaults are set in the DB schema.
*   [x] **Payment Status Enum:** **IMPLEMENTED** - Defined `diningRequestPaymentStatusEnum` and used throughout `management/dining.ts`.
*   [x] **Room Service Implementation:** **FULLY IMPLEMENTED** - Complete set of endpoints for room service menus, items, and schedules in both management and guest APIs.

---

## Documentation for Frontend Developers

Here's a summary of the backend API changes made during this review session that might impact frontend development:

**General Changes:**

*   **Improved Response Consistency:** For many POST (create) and PUT (update/cancel) operations across both Management and Guest APIs, the response body will now consistently contain the full created or updated object, mirroring the structure you'd get from a corresponding GET request for that specific resource. This should simplify state management on the frontend. Examples include creating/cancelling dining requests, reservation requests, general requests, updating dining status/payment, etc.
*   **`SpecialProducts` Schema and Type Definition Change:**
    *   **Change:** The underlying `specialproducts` table and the corresponding `SpecialProducts` type in `src/types/entities.ts` have changed. Special products are now defined at the *hotel level* (managed by hotel staff) and no longer represent individual guest orders with quantities directly in this table.
        *   The `SpecialProducts` type now includes `hotelId`, `priceId`, `isActive` and lacks `guestId` and `quantity`.
    *   **Impact:**
        *   Frontend code relying on the old `SpecialProducts` type (e.g., expecting `guestId` or `quantity`) will need to be updated.
        *   Management API (`/api/management/special-products`): Continues to allow CRUD operations for *defining* these hotel-level special products. This API is aligned with the new schema.
        *   Guest API (`/api/guest/hotels/:hotelId/special-products`): This `GET` endpoint allows guests to *view* available special products for a hotel. There are no guest endpoints to directly create/update/delete "special product orders" against the `specialproducts` table. If guests "order" a special product, this is now likely handled by creating a `Charge` record in the backend, linked to the `specialproducts.productid`. Consult backend documentation for how guest orders of special products are initiated (e.g., potentially via a general request or a new dedicated endpoint that creates a charge).
*   **Room Service APIs Now Fully Implemented:**
    *   The system now provides complete support for room service functionality with both management and guest endpoints.
    *   Management API supports creating, reading, updating, and deleting room service menus, items, and schedules.
    *   Guest API supports viewing room service menus with their items and schedules.

**Management API (`/api/management`) Changes:**

*   **`hotel.ts` (Multiple Endpoints):**
    *   `POST /:hotelId/rooms`, `PUT /:hotelId/rooms/:roomId`
    *   `POST /:hotelId/facilities`, `PUT /:hotelId/facilities/:facilityId`
    *   `POST /:hotelId/restaurants`, `PUT /:hotelId/restaurants/:restaurantId`
    *   `POST /:hotelId/restaurants/:restaurantId/menus`, `PUT /:hotelId/restaurants/:restaurantId/menus/:menuId`
        *   **Change:** These POST/PUT endpoints now perform stricter validation on the request body. They only accept fields explicitly defined in the schema (e.g., `roomnumber`, `name`, `description`, etc., depending on the endpoint). Ensure you are only sending valid fields defined in the API documentation or schema for these entities. Extraneous fields will be ignored. Required fields (like `roomnumber` for rooms, `name` for facilities/restaurants/menus) are mandatory.
        *   **Impact:** Review request bodies sent to these endpoints to ensure only valid and required fields are included.
    *   `GET /:hotelId/events`, `POST /:hotelId/events`
        *   **Change:** Removed `starttime` and `endtime` fields from the request and response for these endpoints, as they don't exist on the `hotelevent` schema.
        *   **Impact:** Do not send `starttime`/`endtime` when creating events; do not expect them in the response when getting events.
    *   **NEW - Room Service Management Endpoints:**
        *   **Change:** Full CRUD functionality is now available for room service through the following endpoints:
            *   Room Service Menu Management:
                *   `GET /:hotelId/room-service-menus`
                *   `POST /:hotelId/room-service-menus`
                *   `PUT /:hotelId/room-service-menus/:menuId`
                *   `DELETE /:hotelId/room-service-menus/:menuId`
            *   Room Service Item Management:
                *   `GET /:hotelId/room-service-menus/:menuId/items`
                *   `POST /:hotelId/room-service-menus/:menuId/items`
                *   `PUT /:hotelId/room-service-menus/:menuId/items/:itemId`
                *   `DELETE /:hotelId/room-service-menus/:menuId/items/:itemId`
            *   Room Service Schedule Management:
                *   `GET /:hotelId/room-service-menus/:menuId/schedules`
                *   `POST /:hotelId/room-service-menus/:menuId/schedules`
                *   `PUT /:hotelId/room-service-menus/:menuId/schedules/:scheduleId`
                *   `DELETE /:hotelId/room-service-menus/:menuId/schedules/:scheduleId`
        *   **Impact:** Frontend can now implement complete management interfaces for room service, including defining menus, adding/editing items, and setting availability schedules.
*   **`reservation-requests.ts`:**
    *   `POST /`
        *   **Change:** The response body now contains the full details of the newly created reservation request, consistent with `GET /:requestId`.
        *   **Impact:** Frontend can directly use the response to display/update state for the new request.
*   **`messages.ts`:**
    *   `GET /:messageId`
        *   **Change:** The structure of the `receiver` object in the response has been updated. It now correctly fetches and includes the guest's primary `email` and `phone` from normalized contact tables, along with their `name` and `guestId`.
        *   **Impact:** Update frontend code that displays receiver details for a specific message to use the corrected structure within the `receiver` object.
*   **`dining.ts`:**
    *   `PUT /:requestId/status`, `PUT /:requestId/payment`
        *   **Change:** The response body for these updates now contains the full, updated dining request object, consistent with `GET /:requestId`.
        *   **Impact:** Frontend can directly use the response to update the state of the modified dining request.
        *   **IMPORTANT NEW CHANGE:** The `/payment` endpoint now implements cascading payment status updates to related charge records:
            *   When updating payment status to "Paid", associated charge records are updated:
                * `ispaid` is set to `true`
                * `paidtimestamp` is updated to current time
                * Audit notes about the payment are added
            *   When updating to "Failed", "Waived", or "Refunded", charge records are updated differently:
                * Description field is updated with the status in square brackets (e.g., "[FAILED]")
                * Audit notes about the status change are added
            *   These updates happen within a database transaction to ensure all-or-nothing success
            *   **Impact for Frontend:** Charge status will now be automatically kept in sync with dining request payment status. The frontend should display appropriate messaging to indicate that charges linked to the dining request have been updated. The UI could show confirmation messages that both the dining request and related charges have been updated.

**Guest API (`/api/guest`) Changes:**

*   **`profile.ts`:**
    *   `PUT /` (Update Basic Profile)
        *   **Change:** The response body now contains a richer set of the updated profile information (core guest data, name, language details), though not the *entire* profile as returned by `GET /`.
        *   **Impact:** Frontend receives more context immediately after a basic profile update.
*   **`hotel.ts`:**
    *   `GET /:hotelId/restaurants/:restaurantId/menus/:menuId/items`
        *   **Change:** The response body for each item in the list now includes a `price` object (containing `priceId`, `amount`, `currencyCode`, `type`, `description`) if a price is associated with the menu item. It will be `null` if no price is set.
        *   **Impact:** Frontend can now display prices for restaurant menu items. Update UI accordingly.
    *   **NEW - Room Service Guest Endpoints:**
        *   **Change:** Complete room service functionality is now available for guests:
            *   `GET /:hotelId/room-service`
                *   Returns all active room service menus with their items and prices
                *   Items include detailed price information (amount, currency, etc.)
            *   `GET /:hotelId/room-service/:menuId/schedule`
                *   Returns the operating schedule for a specific room service menu
                *   Includes day of week, time intervals, and active status
        *   **Impact:** Frontend can now implement comprehensive room service ordering features for guests, including viewing available menus, items with prices, and checking when room service is available.
*   **`dining-requests.ts`:**
    *   `POST /` (Create Request)
    *   `PUT /:requestId/cancel` (Cancel Request)
        *   **Change:** The response bodies for creating or cancelling a dining request now contain the full dining request object (including order items), consistent with `GET /:requestId`.
        *   **Impact:** Frontend can directly use the response to display/update state for the new or cancelled request.
        *   **IMPORTANT NEW CHANGE:** The `/cancel` endpoint now implements charge voiding logic:
            *   When a dining request is cancelled, all related unpaid charges are voided
            *   Voided charges have "[VOIDED]" added to their description, amounts zeroed out, and audit notes added
            *   The dining request's payment status is automatically updated to "Failed"
            *   **Impact for Frontend:** The UI should reflect that cancellation now has financial implications (voiding of charges). Consider adding explanatory text in the cancellation confirmation dialog indicating that any pending charges will be voided. The returned object will also show the updated payment status.
*   **`reservation-requests.ts`:**
    *   `POST /` (Create Request)
    *   `PUT /:requestId/cancel` (Cancel Request)
        *   **Change:** The response bodies for creating or cancelling a reservation request now contain the full reservation request object, consistent with `GET /:requestId`.
        *   **Impact:** Frontend can directly use the response to display/update state for the new or cancelled request.
*   **`messages.ts`:**
    *   `GET /`, `GET /:messageId`, `POST /:messageId/read`
        *   **Change:** The `guestId` required for these endpoints must now be provided via the `X-Guest-ID` HTTP header. Sending it as a query parameter is no longer supported.
        *   **Impact:** Ensure all requests to these endpoints include the `X-Guest-ID` header.
    *   `GET /announcements`
        *   **Change:** The `hotelId` required for this endpoint must now be provided via the `X-Hotel-ID` HTTP header. Sending it as a query parameter is no longer supported.
        *   **Impact:** Ensure all requests to this endpoint include the `X-Hotel-ID` header.
    *   **IMPORTANT NEW CHANGE:** `POST /:messageId/read` (Mark Message as Read)
        *   **Change:** This endpoint has been implemented with a limitation:
            *   The endpoint updates the message's `updatedat` timestamp when a message is "read"
            *   The response includes a `read: true` flag, but this is not persisted in the database
            *   Full read status tracking awaits a schema update to add an `isread` column to the message table
            *   Response now includes a note indicating the schema limitation
        *   **Impact for Frontend:**
            *   The frontend can call this endpoint to mark messages as read, but should not rely on the server to persistently track read status
            *   Consider implementing client-side tracking of read messages (e.g., in localStorage) until a schema update is completed
            *   UI should be designed to avoid strong visual indicators of read/unread state that might be inconsistent on reload
            *   Response format example:
              ```json
              {
                "messageId": "message-uuid",
                "read": true,
                "note": "Message marked as read. Note: Full read status tracking requires schema update.",
                "updatedAt": "2024-05-08T14:23:45Z"
              }
              ```
*   **`feedback.ts`:**
    *   `POST /` (Submit Overall Feedback)
        *   **Change:** This endpoint has been **re-enabled**.
        *   **Impact:** Frontend can now use this endpoint to submit general feedback.
    *   `POST /rating` (Submit Category Rating)
        *   **Change:** The response body now contains the full object of the newly created rating record, including its database-generated `ratingid` and `createdat` timestamp.
        *   **Impact:** Frontend receives the confirmed created record.
*   **`general-requests.ts`:**
    *   `POST /` (Create Request)
    *   `PUT /:requestId/cancel` (Cancel Request)
        *   **Change:** The response bodies for creating or cancelling a general request now contain the full general request object, consistent with `GET /:requestId`.
        *   **Impact:** Frontend can directly use the response to display/update state for the new or cancelled request.
        *   **IMPORTANT NEW CHANGE:** The `/cancel` endpoint now implements charge voiding logic:
            *   When a general request is cancelled, related unpaid charges are identified and voided
            *   The backend searches for charges matching the reservation ID, guest ID, hotel ID, and with descriptions related to the request
            *   Voided charges have "[VOIDED]" added to their description, amounts zeroed out, and audit notes added
            *   **Impact for Frontend:** The UI should reflect that cancellation now has financial implications (voiding of charges). Consider adding explanatory text in the cancellation confirmation dialog indicating that any pending charges will be voided.

### Additional Technical Details for Frontend Integration

**1. Charge Voiding Logic Implementation**

When requests that might have associated charges (dining requests, general requests) are cancelled, the backend now automatically voids unpaid charges. Here's what frontend developers need to know:

* **Void vs. Delete:** Charges are not deleted but "voided" by appending "[VOIDED]" to their description, setting amounts to zero, and adding audit notes.
* **Paid vs. Unpaid:** Only unpaid charges (`ispaid = false`) are voided. Paid charges remain unchanged to preserve financial records.
* **Visibility:** Voided charges will still appear in charge listings but with zero amounts and clear marking.
* **API Responses:** Cancellation endpoints return the updated request object, not the modified charges.
* **UI Considerations:**
  * Add clear messaging in cancellation confirmation dialogs that charges will be voided
  * If displaying charges, show voided ones differently (e.g., strikethrough, different color)
  * Consider adding a filter option to include/exclude voided charges in financial reports

**2. Payment Status Cascading Implementation**

The dining request payment status update now cascades to related charges. This ensures consistency between the dining request payment status and its associated charge records:

* **Automatic Sync:** When a dining request payment status changes, all associated charges are automatically updated in a single transaction.
* **Statuses Handled:**
  * "Paid" → Sets charges to paid, updates payment timestamp
  * "Failed" → Marks charges with "[FAILED]" suffix, preserves amounts (unlike void which zeroes amounts)
  * "Waived" → Marks charges with "[WAIVED]" suffix
  * "Refunded" → Marks charges with "[REFUNDED]" suffix
* **UI Considerations:**
  * Payment status changes should be reflected immediately in the UI
  * Consider showing a success message that mentions both the dining request and charge updates
  * Financial reports/dashboards should correctly categorize charges based on their updated status

**3. Message Read Status Limitation**

Due to schema limitations, the message read status tracking is only partially implemented:

* **Current Behavior:**
  * The `POST /:messageId/read` endpoint acknowledges the read action by updating the timestamp
  * The response includes `read: true` but this is purely for client consumption
  * The message's read status is not persisted in the database
* **Recommended Frontend Implementation:**
  * Track read messages client-side (localStorage, IndexedDB, etc.)
  * Synchronize with server by calling the endpoint, but do not rely on it for persistence
  * Design the UI to gracefully handle read states being reset (e.g., after app reload)
  * Prepare for future schema update that will add proper persistence

**4. Room Service Implementation**

The room service functionality has been fully implemented with both management and guest interfaces:

* **Complete Feature Set:**
  * Management can create and maintain room service menus, items, and schedules
  * Guests can view available room service menus with detailed item information
  * Guests can check when room service is available through schedule endpoints
* **UI Considerations:**
  * Room service menus should be presented similar to restaurant menus
  * Operating schedules should be clearly displayed to show when room service is available
  * The ordering process can integrate with the existing dining request system
  * Management interfaces should provide full CRUD functionality for room service configuration

**5. Testing Focus Areas**

Frontend developers should focus testing efforts on these key areas:

* **Cancellation Flows:** Test the full cycle of creating and cancelling requests with charges
* **Payment Status Updates:** Verify dining request payment status changes and their effects on charges
* **Message Read Status:** Test both the client-side state and server interactions
* **Response Structure Consistency:** Ensure your application correctly processes the updated response formats
* **Room Service Functionality:** Test the full room service experience including menu browsing, schedule checking, and ordering processes

Please review these changes and update your frontend implementations accordingly. Key areas for backend follow-up include implementing dynamic tax calculation and completing the message read status functionality once the schema update is available. 