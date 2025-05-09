// Common entity types that will be used across the application
// These are based on the Drizzle schema

export interface Hotel {
  hotelId: string;
  name: string;
  addressId?: string;
  phone?: string;
  email?: string;
  website?: string;
  mapFile?: string;
  logo?: string;
  timezone?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Guest {
  guestId: string;
  hotelId: string;
  userId: string;
  nameId: string;
  dob?: Date;
  addressId: string;
  profilecreated?: Date;
  profilelastmodified?: Date;
  languageId: string;
  gender?: string;
  rewards?: boolean;
  isactive?: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface Employee {
  employeeId: string;
  hotelId: string;
  userId: string;
  nameId: string;
  roleId: string;
  createdat: Date;
  updatedat: Date;
}

export interface Reservation {
  reservationId: string;
  hotelId: string;
  guestId: string;
  estimatedCheckinTime?: Date;
  actualCheckinTime?: Date;
  estimatedCheckoutTime?: Date;
  actualCheckoutTime?: Date;
  numAdults?: number;
  numChildren?: number;
  paymentMethod?: string;
  bookingMethod?: string;
  purposeOfStay?: string;
  discountPercentage?: number;
  breakfastIncluded?: boolean;
  cancellationTimestamp?: Date;
  cancellationDescription?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Request {
  requestId: string;
  hotelId: string;
  guestId: string;
  reservationId: string;
  status: string;
  requestTypeId: string;
  scheduledTime?: Date;
  completedTime?: Date;
  assignedEmployeeId?: string;
  priority?: number;
  comments?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Room {
  roomId: string;
  hotelId: string;
  buildingId: string;
  roomNumber: string;
  floor?: string;
  type?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  createdat: Date;
  updatedat: Date;
}

export interface MenuItem {
  menuItemId: string;
  hotelId: string;
  restaurantMenuId: string;
  photo?: string;
  description?: string;
  ingredients?: string;
  category?: string;
  masterSection?: string;
  itemName?: string;
  spiceLevel?: string;
  price: string; // Reference to price table
  createdat: Date;
  updatedat: Date;
  isSpecial?: boolean;
  specialStartDate?: Date;
  specialEndDate?: Date;
}

export interface Restaurant {
  restaurantId: string;
  hotelId: string;
  name: string;
  description?: string;
  addressId?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  link?: string;
  menuCount?: number;
  headerPhoto?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Address {
  addressId: string;
  line1?: string;
  line2?: string;
  postalCode?: string;
  cityName?: string;
  stateCode: string;
}

export interface Name {
  nameId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  title?: string;
  suffix?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Message {
  messageId: string;
  hotelId: string;
  typeId: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  isRead?: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface Role {
  roleId: string;
  hotelId: string;
  name: string;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Permission {
  permissionId: string;
  name: string;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  hotelId: string;
  createdat: Date;
}

export interface Facility {
  facilityId: string;
  hotelId: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  location?: string;
  headerPhoto?: string;
  openTime?: Date;
  closeTime?: Date;
  capacity?: number;
  createdat: Date;
  updatedat: Date;
}

export interface Currency {
  currencyId: string;
  code: string;
  symbol?: string;
  name: string;
  createdat: Date;
  updatedat: Date;
}

export interface Price {
  priceId: string;
  hotelId: string;
  amount: number;
  currencyId: string;
  createdat: Date;
  updatedat: Date;
}

export interface Building {
  buildingId: string;
  hotelId: string;
  name: string;
  description?: string;
  addressId?: string;
  createdat: Date;
  updatedat: Date;
}

export interface Notification {
  notificationId: string;
  guestId: string;
  hotelId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead?: boolean;
  createdat: Date;
}

export interface GuestPreference {
  preferenceId: string;
  guestId: string;
  hotelId: string;
  preferenceType: string;
  preferenceValue?: any;
  createdat: Date;
  updatedat: Date;
}

export interface FeedbackType {
  typeId: string;
  type: string;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface GuestFeedback {
  feedbackId: string;
  hotelId: string;
  guestId: string;
  typeId: string;
  message?: string;
  rating?: number;
  createdat: Date;
}

export interface Country {
  countryCode: string;
  countryName: string;
  phonecode?: string;
  region?: string;
}

export interface State {
  stateCode: string;
  stateName?: string;
  countryCode: string;
}

export interface Language {
  languageCode: string;
  name: string;
  nativeName?: string;
  iso639?: string;
  createdat: Date;
  updatedat: Date;
}

export interface HotelEvent {
  eventId: string;
  hotelId: string;
  name: string;
  description?: string;
  location?: string;
  type?: string;
  isRecurring?: boolean;
  capacity?: number;
  price: string; // Reference to price
  createdat: Date;
  updatedat: Date;
}

export interface EventBooking {
  eventBookingId: string;
  hotelId: string;
  guestId: string;
  reservationId: string;
  eventId: string;
  eventTimeSlotId?: string;
  date?: Date;
  price: string; // Reference to price
  quantity?: number;
  numParticipants?: number;
  paid?: boolean;
  status: string;
  createdat: Date;
  updatedat: Date;
}

export interface EventTimeSlot {
  eventTimeSlotId: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  day?: string;
  maxCapacity?: number;
  createdat: Date;
  updatedat: Date;
}

export interface HousekeepingType {
  housekeepingTypeId: string;
  hotelId: string;
  type: string;
  description?: string;
  urgency?: number;
  createdat: Date;
  updatedat: Date;
}

export interface Housekeeping {
  housekeepingId: string;
  hotelId: string;
  name?: string;
  reservationId: string;
  roomId: string;
  type: string; // Reference to housekeepingType
  urgency?: number;
  createdat: Date;
  updatedat: Date;
}

export interface HousekeepingSchedule {
  scheduleId: string;
  roomId: string;
  day: string;
  intervalId: string;
  createdat: Date;
  updatedat: Date;
}

export interface ScheduleInterval {
  intervalId: string;
  hotelId: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface TemperatureSchedule {
  scheduleId: string;
  guestId: string;
  roomId: string;
  temperature: number;
  startTime: Date;
  endTime?: Date;
  isRecurring?: boolean;
  day?: string;
  createdat: Date;
  updatedat: Date;
}

export interface DoNotDisturbSchedule {
  scheduleId: string;
  guestId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  isRecurring?: boolean;
  day?: string;
  createdat: Date;
  updatedat: Date;
}

export interface RestaurantMenu {
  restaurantMenuId: string;
  restaurantId: string;
  menuName: string;
  description?: string;
  isActive: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface RoomServiceMenu {
  menuId: string;
  hotelId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface RoomServiceItem {
  rsItemId: string;
  menuId: string;
  itemName: string;
  description?: string;
  priceid: string;
  isActive: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface MenuOperatingSchedule {
  scheduleId: string;
  restaurantMenuId: string;
  intervalId: string;
  dayOfWeek: string;
  isActive: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface RestaurantOperatingSchedule {
  scheduleId: string;
  restaurantId: string;
  intervalId: string;
  dayOfWeek: string;
  isActive: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface DiningRequest {
  requestId: string;
  totalAmount?: number;
  deliveryInstructions?: string;
  roomId?: string;
  restaurantId?: string;
  numGuests?: number;
  paymentMethod?: string;
  paymentStatus: string;
  serviceContext: string;
  createdat: Date;
  updatedat: Date;
}

export interface DiningOrderItem {
  orderItemId: string;
  requestId: string;
  menuItemId?: string;
  rsItemId?: string;
  quantity: number;
  specialInstructions?: string;
  priceid: string;
  createdat: Date;
  updatedat: Date;
}

export interface PhoneNumber {
  phoneId: string;
  number: string;
  guestId: string;
  contactTypeId: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface EmailAddress {
  emailId: string;
  address: string;
  guestId: string;
  contactTypeId: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface ContactType {
  contactTypeId: string;
  type: string;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface WakeupCall {
  wakeupCallId: string;
  guestId: string;
  roomId: string;
  scheduledTime: Date;
  completed?: boolean;
  completedTime?: Date;
  createdat: Date;
  updatedat: Date;
}

export interface ImportantDate {
  importantDateId: string;
  date?: Date;
  description?: string;
  guestId: string;
  createdat: Date;
  updatedat: Date;
}

export interface MenuItemModifier {
  modifierId: string;
  hotelId: string;
  name: string;
  description?: string;
  price?: string; // Reference to price
  createdat: Date;
  updatedat: Date;
}

export interface MenuItemModification {
  menuItemId: string;
  modifierId: string;
  createdat: Date;
}

export interface Announcement {
  announcementId: string;
  hotelId: string;
  title: string;
  content: string;
  type?: string;
  startDate: Date;
  endDate?: Date;
  isActive?: boolean;
  createdat: Date;
  updatedat: Date;
}

export interface InventoryItem {
  itemId: string;
  hotelId: string;
  name: string;
  description?: string;
  category?: string;
  price?: string; // Reference to price
  availableQuantity?: number;
  minQuantity?: number;
  unit?: string;
  createdat: Date;
  updatedat: Date;
}

export interface FeedbackCategory {
  categoryId: string;
  hotelId: string;
  name: string;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface FeedbackRating {
  ratingId: string;
  guestId: string;
  hotelId: string;
  categoryId: string;
  rating: number;
  comments?: string;
  createdat: Date;
}

export interface DietaryRestriction {
  code: string;
  name: string;
  description?: string;
  createdat: Date;
  updatedat: Date;
}

export interface GuestDietaryRestriction {
  guestId: string;
  restrictionCode: string;
  createdat: Date;
}

export interface MenuDietaryRestriction {
  menuItemId: string;
  restrictionCode: string;
  createdat: Date;
}

export interface ServiceType {
  serviceTypeId: string;
  hotelId: string;
  name: string;
  description?: string;
  category?: string;
  price?: string; // Reference to price
  duration?: number;
  createdat: Date;
  updatedat: Date;
}

export interface ServicePackage {
  packageId: string;
  hotelId: string;
  name: string;
  description?: string;
  price?: string; // Reference to price
  createdat: Date;
  updatedat: Date;
}

export interface RoomReservation {
  reservationId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: string;
  createdat: Date;
  updatedat: Date;
}

export interface Charge {
  chargeId: string;
  hotelId: string;
  reservationId: string;
  guestId: string;
  description: string;
  baseAmount: string;
  taxAmount: string;
  totalAmount: string;
  currencyCode: string;
  isPaid: boolean;
  paidTimestamp?: Date;
  notes?: string;
  createdByEmployeeId?: string;
  sourceDiningOrderItemId?: string;
  sourceEventBookingId?: string;
  sourceSpecialProductId?: string;
  createdat: Date;
  updatedat: Date;
}

export interface ReservationComment {
  commentId: string;
  reservationId: string;
  employeeId: string;
  comment: string;
  createdat: Date;
}

export interface SpecialProducts {
  productId: string;
  hotelId: string;
  name: string;
  description?: string;
  priceId: string;
  isActive: boolean;
  priceAmount?: string;
  priceCurrencyCode?: string;
  priceType?: string;
  priceDescription?: string;
  createdat: Date;
  updatedat: Date;
}

export interface HotelSpa {
  spaId: string;
  hotelId: string;
  name: string;
  description?: string;
  location?: string;
  openTime?: Date;
  closeTime?: Date;
  capacity?: number;
  headerPhoto?: string;
  createdat: Date;
  updatedat: Date;
}

export interface GeneralRequest {
  requestId: string;
  requestCategory: string;
  description?: string;
  roomId?: string;
  createdat: Date;
  updatedat: Date;
}

export interface HotelPhone {
  number: string;
  hotelId: string;
  purpose?: string;
  createdat: Date;
  updatedat: Date;
}

export interface HotelEmail {
  email: string;
  hotelId: string;
  purpose?: string;
  createdat: Date;
  updatedat: Date;
}

export interface EventQuestion {
  questionId: string;
  eventId: string;
  hotelId: string;
  question: string;
  required?: boolean;
  type: string;
  options?: string[];
  createdat: Date;
  updatedat: Date;
}

export interface EventQuestionResponse {
  responseId: string;
  questionId: string;
  eventBookingId: string;
  response: string;
  createdat: Date;
}

export interface Bedroom {
  bedroomId: string;
  roomId: string;
  bedType: string;
  bedCount: number;
  createdat: Date;
  updatedat: Date;
}

export interface ItemAssignment {
  assignmentId: string;
  hotelId: string;
  itemId: string;
  roomId?: string;
  quantity: number;
  isPermanent?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdat: Date;
  updatedat: Date;
}

export interface GuestAddress {
  addressId: string;
  guestId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  createdat: Date;
  updatedat: Date;
} 