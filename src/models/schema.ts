import { pgTable, varchar, unique, uuid, timestamp, text, index, foreignKey, check, numeric, integer, time, date, jsonb, boolean, uniqueIndex, char, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const announcementTypeEnum = pgEnum("announcement_type_enum", ['emergency', 'important', 'normal'])
export const diningRequestContextEnum = pgEnum("dining_request_context_enum", ['InRestaurant', 'RoomService', 'TakeAway', 'Poolside'])
export const eventBookingStatusEnum = pgEnum("event_booking_status_enum", ['PendingPayment', 'Confirmed', 'CancelledByUser', 'CancelledByHotel', 'Completed'])
export const facilityStatusEnum = pgEnum("facility_status_enum", ['available', 'maintenance', 'closed'])
export const housekeepingStatusEnum = pgEnum("housekeeping_status_enum", ['Pending', 'InProgress', 'Completed', 'Cancelled', 'IssueReported'])
export const requestStatusEnum = pgEnum("request_status_enum", ['Submitted', 'Scheduled', 'InProgress', 'Delayed', 'Completed', 'Cancelled', 'Failed'])
export const roomStatusEnum = pgEnum("room_status_enum", ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'])
export const diningRequestPaymentStatusEnum = pgEnum('dining_request_payment_status', ['Pending', 'Paid', 'Failed', 'Refunded', 'Waived']);


export const schemaMigrations = pgTable("schema_migrations", {
	version: varchar({ length: 128 }).primaryKey().notNull(),
});

export const language = pgTable("language", {
	languagecode: uuid().primaryKey().notNull(),
	code: varchar({ length: 20 }).notNull(),
	name: varchar({ length: 50 }),
	nativename: varchar({ length: 50 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_language_code").on(table.code),
]);

export const contacttype = pgTable("contacttype", {
	contacttypeid: uuid().primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_contacttype_type").on(table.type),
]);

export const region = pgTable("region", {
	regioncode: uuid().primaryKey().notNull(),
	regionname: varchar({ length: 60 }),
});

export const currency = pgTable("currency", {
	currencyid: uuid().primaryKey().notNull(),
	code: varchar({ length: 3 }).notNull(),
	symbol: varchar({ length: 5 }),
	name: varchar({ length: 50 }).notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_currency_code").on(table.code),
]);

export const name = pgTable("name", {
	nameid: uuid().primaryKey().notNull(),
	firstname: varchar({ length: 50 }),
	middlename: varchar({ length: 50 }),
	lastname: varchar({ length: 50 }),
	title: varchar({ length: 20 }),
	suffix: varchar({ length: 20 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const role = pgTable("role", {
	roleid: uuid().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_role_name").on(table.name),
]);

export const permission = pgTable("permission", {
	permissionid: uuid().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_permission_name").on(table.name),
]);

export const dietaryrestriction = pgTable("dietaryrestriction", {
	code: varchar({ length: 10 }).primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_dietaryrestriction_name").on(table.name),
]);

export const messagetype = pgTable("messagetype", {
	typeid: uuid().primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_messagetype_type").on(table.type),
]);

export const country = pgTable("country", {
	countrycode: uuid().primaryKey().notNull(),
	countryname: varchar({ length: 60 }),
	regioncode: uuid().notNull(),
}, (table) => [
	index("idx_country_regioncode").using("btree", table.regioncode.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.regioncode],
			foreignColumns: [region.regioncode],
			name: "fk_country_regioncode"
		}).onDelete("restrict"),
]);

export const state = pgTable("state", {
	statecode: uuid().primaryKey().notNull(),
	statename: varchar({ length: 60 }),
	countrycode: uuid().notNull(),
}, (table) => [
	index("idx_state_countrycode").using("btree", table.countrycode.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.countrycode],
			foreignColumns: [country.countrycode],
			name: "fk_state_countrycode"
		}).onDelete("restrict"),
]);

export const address = pgTable("address", {
	addressid: uuid().primaryKey().notNull(),
	line1: varchar({ length: 100 }),
	line2: varchar({ length: 100 }),
	postalcode: varchar({ length: 20 }),
	cityname: varchar({ length: 100 }),
	statecode: uuid().notNull(),
}, (table) => [
	index("idx_address_statecode").using("btree", table.statecode.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.statecode],
			foreignColumns: [state.statecode],
			name: "fk_address_statecode"
		}).onDelete("restrict"),
]);

export const feedbacktype = pgTable("feedbacktype", {
	typeid: uuid().primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("uq_feedbacktype_type").on(table.type),
]);

export const hotel = pgTable("hotel", {
	hotelid: uuid().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	addressid: uuid(),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
	website: varchar({ length: 255 }),
	mapfile: varchar({ length: 150 }),
	logo: varchar({ length: 150 }),
	timezone: varchar({ length: 50 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.addressid],
			foreignColumns: [address.addressid],
			name: "fk_hotel_addressid"
		}).onDelete("set null"),
	check("chk_hotel_email", sql`(email)::text ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'::text`),
]);

export const price = pgTable("price", {
	priceid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currencyid: uuid().notNull(),
	pricetype: varchar({ length: 50 }),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_price_currencyid").using("btree", table.currencyid.asc().nullsLast().op("uuid_ops")),
	index("idx_price_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.currencyid],
			foreignColumns: [currency.currencyid],
			name: "fk_price_currencyid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_price_hotelid"
		}).onDelete("cascade"),
	check("chk_price_amount", sql`amount >= (0)::numeric`),
]);

export const restaurant = pgTable("restaurant", {
	restaurantid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	addressid: uuid(),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
	capacity: integer(),
	link: varchar({ length: 150 }),
	menucount: integer(),
	headerphoto: varchar({ length: 150 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_restaurant_addressid").using("btree", table.addressid.asc().nullsLast().op("uuid_ops")),
	index("idx_restaurant_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.addressid],
			foreignColumns: [address.addressid],
			name: "fk_restaurant_addressid"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_restaurant_hotelid"
		}).onDelete("cascade"),
	check("chk_restaurant_capacity", sql`capacity >= 0`),
	check("chk_restaurant_email", sql`(email)::text ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'::text`),
]);

export const building = pgTable("building", {
	buildingid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	addressid: uuid(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_building_addressid").using("btree", table.addressid.asc().nullsLast().op("uuid_ops")),
	index("idx_building_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.addressid],
			foreignColumns: [address.addressid],
			name: "fk_building_addressid"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_building_hotelid"
		}).onDelete("cascade"),
	unique("uq_building_hotel_name").on(table.hotelid, table.name),
]);

export const room = pgTable("room", {
	roomid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	buildingid: uuid().notNull(),
	roomnumber: varchar({ length: 20 }).notNull(),
	floor: varchar({ length: 20 }),
	type: varchar({ length: 50 }),
	status: roomStatusEnum().default('available'),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_room_buildingid").using("btree", table.buildingid.asc().nullsLast().op("uuid_ops")),
	index("idx_room_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_room_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.buildingid],
			foreignColumns: [building.buildingid],
			name: "fk_room_buildingid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_room_hotelid"
		}).onDelete("cascade"),
	unique("uq_room_hotel_building_number").on(table.hotelid, table.buildingid, table.roomnumber),
]);

export const employee = pgTable("employee", {
	employeeid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	userid: varchar({ length: 255 }).notNull(),
	nameid: uuid().notNull(),
	roleid: uuid().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_employee_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_employee_nameid").using("btree", table.nameid.asc().nullsLast().op("uuid_ops")),
	index("idx_employee_roleid").using("btree", table.roleid.asc().nullsLast().op("uuid_ops")),
	index("idx_employee_userid").using("btree", table.userid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_employee_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.nameid],
			foreignColumns: [name.nameid],
			name: "fk_employee_nameid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.roleid],
			foreignColumns: [role.roleid],
			name: "fk_employee_roleid"
		}).onDelete("restrict"),
	unique("uq_employee_userid").on(table.userid),
]);

export const housekeepingtype = pgTable("housekeepingtype", {
	housekeepingtypeid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	urgency: integer().default(3),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_housekeepingtype_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_housekeepingtype_hotelid"
		}).onDelete("cascade"),
	unique("uq_housekeepingtype_hotel_type").on(table.hotelid, table.type),
	check("chk_housekeepingtype_urgency", sql`(urgency >= 1) AND (urgency <= 5)`),
]);

export const scheduleinterval = pgTable("scheduleinterval", {
	intervalid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	starttime: time().notNull(),
	endtime: time().notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_scheduleinterval_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_scheduleinterval_hotelid"
		}).onDelete("cascade"),
	check("chk_scheduleinterval_times", sql`starttime < endtime`),
]);

export const menuitemmodifier = pgTable("menuitemmodifier", {
	menumodifierid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	price: uuid(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_menuitemmodifier_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_menuitemmodifier_price").using("btree", table.price.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_menuitemmodifier_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.price],
			foreignColumns: [price.priceid],
			name: "fk_menuitemmodifier_price"
		}).onDelete("set null"),
	unique("uq_menuitemmodifier_hotel_name").on(table.hotelid, table.name),
]);

export const facility = pgTable("facility", {
	facilityid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	type: varchar({ length: 50 }).notNull(),
	status: facilityStatusEnum().default('available').notNull(),
	location: varchar({ length: 100 }),
	headerphoto: varchar({ length: 150 }),
	opentime: time(),
	middleopentime: time(),
	middleclosetime: time(),
	closetime: time(),
	link: varchar({ length: 150 }),
	capacity: integer(),
	additionalinfo: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_facility_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_facility_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_facility_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_facility_hotelid"
		}).onDelete("cascade"),
	unique("uq_facility_hotel_name").on(table.hotelid, table.name),
	check("chk_facility_capacity", sql`(capacity IS NULL) OR (capacity >= 0)`),
	check("chk_facility_times", sql`((opentime IS NULL) AND (closetime IS NULL)) OR ((opentime IS NOT NULL) AND (closetime IS NOT NULL) AND (opentime < closetime))`),
]);

export const guest = pgTable("guest", {
	guestid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	userid: varchar({ length: 255 }).notNull(),
	nameid: uuid().notNull(),
	dob: date(),
	profilecreated: date(),
	profilelastmodified: date(),
	languageid: uuid().notNull(),
	gender: varchar({ length: 15 }),
	rewardsinfo: jsonb(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_guest_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_guest_languageid").using("btree", table.languageid.asc().nullsLast().op("uuid_ops")),
	index("idx_guest_nameid").using("btree", table.nameid.asc().nullsLast().op("uuid_ops")),
	index("idx_guest_rewardsinfo").using("gin", table.rewardsinfo.asc().nullsLast().op("jsonb_ops")),
	index("idx_guest_userid").using("btree", table.userid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_guest_hotelid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.languageid],
			foreignColumns: [language.languagecode],
			name: "fk_guest_languageid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.nameid],
			foreignColumns: [name.nameid],
			name: "fk_guest_nameid"
		}).onDelete("restrict"),
	unique("uq_guest_userid").on(table.userid),
]);

export const guestaddress = pgTable("guestaddress", {
	guestaddressid: uuid().defaultRandom().primaryKey().notNull(),
	guestid: uuid().notNull(),
	addressid: uuid().notNull(),
	addresstypeid: uuid().notNull(),
	isprimary: boolean().default(false),
	notes: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_guestaddress_addressid").using("btree", table.addressid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestaddress_addresstypeid").using("btree", table.addresstypeid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestaddress_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("uq_guestaddress_guest_primary_true").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")).where(sql`(isprimary = true)`),
	foreignKey({
			columns: [table.addressid],
			foreignColumns: [address.addressid],
			name: "fk_guestaddress_address"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.addresstypeid],
			foreignColumns: [addresstype.addresstypeid],
			name: "fk_guestaddress_addresstype"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_guestaddress_guest"
		}).onDelete("cascade"),
]);

export const addresstype = pgTable("addresstype", {
	addresstypeid: uuid().defaultRandom().primaryKey().notNull(),
	typename: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_addresstype_typename").using("btree", table.typename.asc().nullsLast().op("text_ops")),
	unique("uq_addresstype_typename").on(table.typename),
]);

export const servicetype = pgTable("servicetype", {
	servicetypeid: uuid().primaryKey().notNull(),
	title: varchar({ length: 50 }),
	description: text(),
	frequency: varchar({ length: 20 }),
	price: uuid().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_servicetype_price").using("btree", table.price.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.price],
			foreignColumns: [price.priceid],
			name: "fk_servicetype_price"
		}).onDelete("restrict"),
]);

export const inventoryitem = pgTable("inventoryitem", {
	itemid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	type: varchar({ length: 50 }),
	totalinventory: integer(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_inventoryitem_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_inventoryitem_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_inventoryitem_hotelid"
		}).onDelete("cascade"),
	check("chk_inventoryitem_totalinventory", sql`totalinventory >= 0`),
]);

export const hotelevent = pgTable("hotelevent", {
	eventid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	eventname: varchar({ length: 100 }),
	imagefile: varchar({ length: 150 }),
	location: varchar({ length: 100 }),
	description: text(),
	link: varchar({ length: 150 }),
	frequency: varchar({ length: 20 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_hotelevent_eventname").using("btree", table.eventname.asc().nullsLast().op("text_ops")),
	index("idx_hotelevent_frequency").using("btree", table.frequency.asc().nullsLast().op("text_ops")),
	index("idx_hotelevent_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_hotelevent_hotelid"
		}).onDelete("cascade"),
]);

export const restaurantmenu = pgTable("restaurantmenu", {
	restaurantmenuid: uuid().primaryKey().notNull(),
	restaurantid: uuid().notNull(),
	menuname: varchar({ length: 50 }),
	description: text(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_restaurantmenu_restaurantid").using("btree", table.restaurantid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.restaurantid],
			foreignColumns: [restaurant.restaurantid],
			name: "fk_restaurantmenu_restaurantid"
		}).onDelete("cascade"),
]);

export const menuoperatingschedule = pgTable("menuoperatingschedule", {
	menuoperatingscheduleid: uuid().defaultRandom().primaryKey().notNull(),
	restaurantmenuid: uuid().notNull(),
	intervalid: uuid().notNull(),
	dayofweek: varchar({ length: 9 }).notNull(),
	scheduletype: varchar({ length: 50 }).default('Availability'),
	isactive: boolean().default(true),
	notes: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_menuoperatingschedule_dayofweek").using("btree", table.dayofweek.asc().nullsLast().op("text_ops")),
	index("idx_menuoperatingschedule_intervalid").using("btree", table.intervalid.asc().nullsLast().op("uuid_ops")),
	index("idx_menuoperatingschedule_menuid").using("btree", table.restaurantmenuid.asc().nullsLast().op("uuid_ops")),
	index("idx_menuoperatingschedule_scheduletype").using("btree", table.scheduletype.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.intervalid],
			foreignColumns: [scheduleinterval.intervalid],
			name: "fk_menuoperatingschedule_interval"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.restaurantmenuid],
			foreignColumns: [restaurantmenu.restaurantmenuid],
			name: "fk_menuoperatingschedule_menu"
		}).onDelete("cascade"),
	unique("uq_menuoperatingschedule_menu_day_interval_type").on(table.restaurantmenuid, table.intervalid, table.dayofweek, table.scheduletype),
	check("chk_menuoperatingschedule_day", sql`(dayofweek)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying, 'All'::character varying, 'Weekdays'::character varying, 'Weekends'::character varying])::text[])`),
]);

export const restaurantoperatingschedule = pgTable("restaurantoperatingschedule", {
	restaurantopscheduleid: uuid().defaultRandom().primaryKey().notNull(),
	restaurantid: uuid().notNull(),
	intervalid: uuid().notNull(),
	dayofweek: varchar({ length: 9 }).notNull(),
	scheduletype: varchar({ length: 50 }).default('OperatingHours'),
	isactive: boolean().default(true),
	notes: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_restaurantopschedule_dayofweek").using("btree", table.dayofweek.asc().nullsLast().op("text_ops")),
	index("idx_restaurantopschedule_intervalid").using("btree", table.intervalid.asc().nullsLast().op("uuid_ops")),
	index("idx_restaurantopschedule_restaurantid").using("btree", table.restaurantid.asc().nullsLast().op("uuid_ops")),
	index("idx_restaurantopschedule_scheduletype").using("btree", table.scheduletype.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.intervalid],
			foreignColumns: [scheduleinterval.intervalid],
			name: "fk_restaurantopschedule_interval"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.restaurantid],
			foreignColumns: [restaurant.restaurantid],
			name: "fk_restaurantopschedule_restaurant"
		}).onDelete("cascade"),
	unique("uq_restaurantopschedule_restaurant_day_interval_type").on(table.restaurantid, table.intervalid, table.dayofweek, table.scheduletype),
	check("chk_restaurantopschedule_day", sql`(dayofweek)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying, 'All'::character varying, 'Weekdays'::character varying, 'Weekends'::character varying])::text[])`),
]);

export const reservation = pgTable("reservation", {
	reservationid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	guestid: uuid().notNull(),
	estimatedcheckintime: timestamp({ withTimezone: true, mode: 'string' }),
	actualcheckintime: timestamp({ withTimezone: true, mode: 'string' }),
	estimatedcheckouttime: timestamp({ withTimezone: true, mode: 'string' }),
	actualcheckouttime: timestamp({ withTimezone: true, mode: 'string' }),
	numadults: integer(),
	numchildren: integer(),
	paymentmethod: varchar({ length: 50 }),
	bookingmethod: varchar({ length: 50 }),
	purposeofstay: varchar({ length: 50 }),
	discountpercentage: integer(),
	breakfastincluded: boolean(),
	cancellationtimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	cancellationdescription: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_reservation_checkin").using("btree", table.estimatedcheckintime.asc().nullsLast().op("timestamptz_ops")),
	index("idx_reservation_checkout").using("btree", table.estimatedcheckouttime.asc().nullsLast().op("timestamptz_ops")),
	index("idx_reservation_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_reservation_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_reservation_guestid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_reservation_hotelid"
		}).onDelete("restrict"),
	unique("uq_reservation").on(table.reservationid, table.hotelid, table.guestid),
	check("chk_reservation_discount", sql`(discountpercentage >= 0) AND (discountpercentage <= 100)`),
	check("chk_reservation_numadults", sql`numadults >= 0`),
	check("chk_reservation_numchildren", sql`numchildren >= 0`),
]);

export const menuitem = pgTable("menuitem", {
	menuitemid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	restaurantmenuid: uuid().notNull(),
	photo: varchar({ length: 150 }),
	description: text(),
	ingredients: text(),
	category: varchar({ length: 30 }),
	mastersection: text(),
	itemname: varchar({ length: 50 }),
	spicelevel: varchar({ length: 30 }),
	price: uuid().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	isspecial: boolean().default(false),
	specialstartdate: date(),
	specialenddate: date(),
}, (table) => [
	index("idx_menuitem_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_menuitem_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_menuitem_isspecial").using("btree", table.isspecial.asc().nullsLast().op("bool_ops")),
	index("idx_menuitem_price").using("btree", table.price.asc().nullsLast().op("uuid_ops")),
	index("idx_menuitem_restaurantmenuid").using("btree", table.restaurantmenuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_menuitem_hotelid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.price],
			foreignColumns: [price.priceid],
			name: "fk_menuitem_price"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.restaurantmenuid],
			foreignColumns: [restaurantmenu.restaurantmenuid],
			name: "fk_menuitem_restaurantmenuid"
		}).onDelete("restrict"),
	check("chk_menuitem_specialdates", sql`((specialstartdate IS NULL) AND (specialenddate IS NULL)) OR ((specialstartdate IS NOT NULL) AND (specialenddate IS NOT NULL) AND (specialstartdate <= specialenddate))`),
]);

export const emailaddress = pgTable("emailaddress", {
	emailid: uuid().primaryKey().notNull(),
	address: varchar({ length: 255 }),
	guestid: uuid().notNull(),
	contacttypeid: uuid().notNull(),
	isprimary: boolean().default(false),
	isverified: boolean().default(false),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_emailaddress_contacttypeid").using("btree", table.contacttypeid.asc().nullsLast().op("uuid_ops")),
	index("idx_emailaddress_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contacttypeid],
			foreignColumns: [contacttype.contacttypeid],
			name: "fk_emailaddress_contacttypeid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_emailaddress_guestid"
		}).onDelete("cascade"),
	check("chk_emailaddress_address", sql`(address)::text ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'::text`),
]);

export const phonenumber = pgTable("phonenumber", {
	numberid: uuid().primaryKey().notNull(),
	number: varchar({ length: 50 }),
	guestid: uuid().notNull(),
	contacttypeid: uuid().notNull(),
	isprimary: boolean().default(false),
	isverified: boolean().default(false),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_phonenumber_contacttypeid").using("btree", table.contacttypeid.asc().nullsLast().op("uuid_ops")),
	index("idx_phonenumber_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contacttypeid],
			foreignColumns: [contacttype.contacttypeid],
			name: "fk_phonenumber_contacttypeid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_phonenumber_guestid"
		}).onDelete("cascade"),
	check("chk_phonenumber_number", sql`(number)::text ~ '^[+]?[0-9\s\-\(\)]+$'::text`),
]);

export const importantdate = pgTable("importantdate", {
	importantdateid: uuid().primaryKey().notNull(),
	date: date(),
	description: text(),
	guestid: uuid().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_importantdate_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("idx_importantdate_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_importantdate_guestid"
		}).onDelete("cascade"),
]);

export const wakeupcall = pgTable("wakeupcall", {
	wakeupcallid: uuid().primaryKey().notNull(),
	guestid: uuid().notNull(),
	reservationid: uuid().notNull(),
	timestamp: timestamp({ withTimezone: true, mode: 'string' }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_wakeupcall_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_wakeupcall_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_wakeupcall_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_wakeupcall_guestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_wakeupcall_reservationid"
		}).onDelete("cascade"),
]);

export const specialproducts = pgTable("specialproducts", {
	productid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	priceid: uuid().notNull(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_specialproducts_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_specialproducts_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("idx_specialproducts_priceid").using("btree", table.priceid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_specialproducts_hotel"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.priceid],
			foreignColumns: [price.priceid],
			name: "fk_specialproducts_price"
		}).onDelete("restrict"),
	unique("uq_specialproducts_hotel_name").on(table.hotelid, table.name),
]);

export const eventtimeslot = pgTable("eventtimeslot", {
	eventtimeslotid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	eventid: uuid().notNull(),
	timestart: time(),
	timeend: time(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_eventtimeslot_eventid").using("btree", table.eventid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventtimeslot_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventid],
			foreignColumns: [hotelevent.eventid],
			name: "fk_eventtimeslot_eventid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_eventtimeslot_hotelid"
		}).onDelete("cascade"),
	check("chk_eventtimeslot_times", sql`((timestart IS NULL) AND (timeend IS NULL)) OR ((timestart IS NOT NULL) AND (timeend IS NOT NULL) AND (timestart < timeend))`),
]);

export const eventquestion = pgTable("eventquestion", {
	eventquestionid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	eventid: uuid().notNull(),
	question: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_eventquestion_eventid").using("btree", table.eventid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventquestion_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventid],
			foreignColumns: [hotelevent.eventid],
			name: "fk_eventquestion_eventid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_eventquestion_hotelid"
		}).onDelete("cascade"),
]);

export const eventbooking = pgTable("eventbooking", {
	eventbookingid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	guestid: uuid().notNull(),
	reservationid: uuid().notNull(),
	eventid: uuid().notNull(),
	eventtimeslotid: uuid(),
	date: date(),
	priceid: uuid().notNull(),
	quantity: integer(),
	numparticipants: integer(),
	ispaid: boolean().default(false),
	status: eventBookingStatusEnum().default('PendingPayment').notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_eventbooking_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("idx_eventbooking_eventid").using("btree", table.eventid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventbooking_eventtimeslot").using("btree", table.eventtimeslotid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventbooking_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventbooking_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventbooking_paid").using("btree", table.ispaid.asc().nullsLast().op("bool_ops")),
	index("idx_eventbooking_price").using("btree", table.priceid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventbooking_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_eventbooking_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.eventid],
			foreignColumns: [hotelevent.eventid],
			name: "fk_eventbooking_eventid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.eventtimeslotid],
			foreignColumns: [eventtimeslot.eventtimeslotid],
			name: "fk_eventbooking_eventtimeslot"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_eventbooking_guestid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_eventbooking_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.priceid],
			foreignColumns: [price.priceid],
			name: "fk_eventbooking_price"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_eventbooking_reservationid"
		}).onDelete("restrict"),
	check("chk_eventbooking_numparticipants", sql`(numparticipants > 0) OR (numparticipants IS NULL)`),
	check("chk_eventbooking_quantity", sql`(quantity > 0) OR (quantity IS NULL)`),
]);

export const eventparticipant = pgTable("eventparticipant", {
	participantid: uuid().primaryKey().notNull(),
	eventbookingid: uuid().notNull(),
	name: varchar({ length: 100 }),
	age: integer(),
	comment: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_eventparticipant_eventbookingid").using("btree", table.eventbookingid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventbookingid],
			foreignColumns: [eventbooking.eventbookingid],
			name: "fk_eventparticipant_eventbookingid"
		}).onDelete("cascade"),
	check("chk_eventparticipant_age", sql`age >= 0`),
]);

export const reservationcomment = pgTable("reservationcomment", {
	reservationcommentid: uuid().defaultRandom().primaryKey().notNull(),
	reservationid: uuid().notNull(),
	comment: text().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_reservationcomment_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_reservationcomment_reservationid"
		}).onDelete("cascade"),
]);

export const roomservicemenu = pgTable("roomservicemenu", {
	roomservicemenuid: uuid().defaultRandom().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	menuname: varchar({ length: 50 }).notNull(),
	description: text(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_roomservicemenu_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_roomservicemenu_hotel"
		}).onDelete("cascade"),
	unique("uq_roomservicemenu_hotel_name").on(table.hotelid, table.menuname),
]);

export const roomserviceitem = pgTable("roomserviceitem", {
	rsItemid: uuid("rs_itemid").defaultRandom().primaryKey().notNull(),
	roomservicemenuid: uuid().notNull(),
	itemname: varchar({ length: 100 }).notNull(),
	description: text(),
	ingredients: text(),
	category: varchar({ length: 50 }),
	photo: varchar({ length: 150 }),
	priceid: uuid().notNull(),
	isspecial: boolean().default(false),
	specialstartdate: date(),
	specialenddate: date(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_roomserviceitem_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_roomserviceitem_menuid").using("btree", table.roomservicemenuid.asc().nullsLast().op("uuid_ops")),
	index("idx_roomserviceitem_priceid").using("btree", table.priceid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.roomservicemenuid],
			foreignColumns: [roomservicemenu.roomservicemenuid],
			name: "fk_roomserviceitem_menu"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.priceid],
			foreignColumns: [price.priceid],
			name: "fk_roomserviceitem_price"
		}).onDelete("restrict"),
	check("chk_roomserviceitem_specialdates", sql`((specialstartdate IS NULL) AND (specialenddate IS NULL)) OR ((specialstartdate IS NOT NULL) AND (specialenddate IS NOT NULL) AND (specialstartdate <= specialenddate))`),
]);

export const roomservicemenuschedule = pgTable("roomservicemenuschedule", {
	rsMenuscheduleid: uuid("rs_menuscheduleid").defaultRandom().primaryKey().notNull(),
	roomservicemenuid: uuid().notNull(),
	intervalid: uuid().notNull(),
	dayofweek: varchar({ length: 9 }).notNull(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_rsmenuschedule_dayofweek").using("btree", table.dayofweek.asc().nullsLast().op("text_ops")),
	index("idx_rsmenuschedule_intervalid").using("btree", table.intervalid.asc().nullsLast().op("uuid_ops")),
	index("idx_rsmenuschedule_menuid").using("btree", table.roomservicemenuid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.intervalid],
			foreignColumns: [scheduleinterval.intervalid],
			name: "fk_rsmenuschedule_interval"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomservicemenuid],
			foreignColumns: [roomservicemenu.roomservicemenuid],
			name: "fk_rsmenuschedule_menu"
		}).onDelete("cascade"),
	unique("uq_rsmenuschedule_menu_day_interval").on(table.roomservicemenuid, table.intervalid, table.dayofweek),
	check("chk_rsmenuschedule_day", sql`(dayofweek)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying, 'All'::character varying, 'Weekdays'::character varying, 'Weekends'::character varying])::text[])`),
]);

export const request = pgTable("request", {
	requestid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	guestid: uuid().notNull(),
	reservationid: uuid().notNull(),
	name: varchar({ length: 100 }),
	requesttype: varchar({ length: 50 }).notNull(),
	department: varchar({ length: 100 }),
	status: requestStatusEnum().default('Submitted').notNull(),
	createdby: varchar({ length: 50 }).default('Guest'),
	assignedtoemployeeid: uuid(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	estimatedcompletiontime: integer(),
	scheduledtime: timestamp({ withTimezone: true, mode: 'string' }),
	completedat: timestamp({ withTimezone: true, mode: 'string' }),
	notes: text(),
}, (table) => [
	index("idx_request_assigned").using("btree", table.assignedtoemployeeid.asc().nullsLast().op("uuid_ops")),
	index("idx_request_completedat").using("btree", table.completedat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_request_createdat").using("btree", table.createdat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_request_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_request_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_request_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_request_scheduledtime").using("btree", table.scheduledtime.asc().nullsLast().op("timestamptz_ops")),
	index("idx_request_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_request_type").using("btree", table.requesttype.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.assignedtoemployeeid],
			foreignColumns: [employee.employeeid],
			name: "fk_request_employee_assigned"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_request_guestid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_request_hotelid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_request_reservationid"
		}).onDelete("restrict"),
]);

export const generalrequest = pgTable("generalrequest", {
	requestid: uuid().primaryKey().notNull(),
	requestcategory: varchar({ length: 50 }).notNull(),
	description: text(),
	roomid: uuid(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_generalrequest_category").using("btree", table.requestcategory.asc().nullsLast().op("text_ops")),
	index("idx_generalrequest_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.requestid],
			foreignColumns: [request.requestid],
			name: "fk_generalrequest_requestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_generalrequest_roomid"
		}).onDelete("set null"),
]);

export const diningrequest = pgTable("diningrequest", {
	requestid: uuid().primaryKey().notNull(),
	totalamount: numeric({ precision: 10, scale:  2 }),
	deliveryinstructions: text(),
	roomid: uuid().notNull(),
	restaurantid: uuid(),
	numguests: integer(),
	paymentmethod: varchar({ length: 50 }),
	paymentstatus: diningRequestPaymentStatusEnum('paymentstatus').default('Pending'),
	servicecontext: diningRequestContextEnum().default('InRestaurant'),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_diningrequest_paymentstatus").using("btree", table.paymentstatus.asc().nullsLast().op("text_ops")),
	index("idx_diningrequest_restaurantid").using("btree", table.restaurantid.asc().nullsLast().op("uuid_ops")),
	index("idx_diningrequest_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	index("idx_diningrequest_servicecontext").using("btree", table.servicecontext.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.requestid],
			foreignColumns: [request.requestid],
			name: "fk_diningrequest_requestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.restaurantid],
			foreignColumns: [restaurant.restaurantid],
			name: "fk_diningrequest_restaurantid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_diningrequest_roomid"
		}).onDelete("restrict"),
	check("chk_diningrequest_numguests", sql`numguests > 0`),
	check("chk_diningrequest_totalamount", sql`totalamount > (0)::numeric`),
]);

export const diningorderitem = pgTable("diningorderitem", {
	orderitemid: uuid().primaryKey().notNull(),
	requestid: uuid().notNull(),
	menuitemid: uuid(),
	rsItemid: uuid("rs_itemid"),
	quantity: integer().notNull(),
	specialinstructions: text(),
	priceid: uuid(),
	basepriceatorder: numeric({ precision: 10, scale:  2 }),
	calculatedpriceatorder: numeric({ precision: 10, scale:  2 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_diningorderitem_menuitemid").using("btree", table.menuitemid.asc().nullsLast().op("uuid_ops")).where(sql`(menuitemid IS NOT NULL)`),
	index("idx_diningorderitem_priceid").using("btree", table.priceid.asc().nullsLast().op("uuid_ops")).where(sql`(priceid IS NOT NULL)`),
	index("idx_diningorderitem_requestid").using("btree", table.requestid.asc().nullsLast().op("uuid_ops")),
	index("idx_diningorderitem_rsitemid").using("btree", table.rsItemid.asc().nullsLast().op("uuid_ops")).where(sql`(rs_itemid IS NOT NULL)`),
	foreignKey({
			columns: [table.menuitemid],
			foreignColumns: [menuitem.menuitemid],
			name: "fk_diningorderitem_menuitem"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.priceid],
			foreignColumns: [price.priceid],
			name: "fk_diningorderitem_price"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.requestid],
			foreignColumns: [diningrequest.requestid],
			name: "fk_diningorderitem_request"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.rsItemid],
			foreignColumns: [roomserviceitem.rsItemid],
			name: "fk_diningorderitem_rsitem"
		}).onDelete("set null"),
	check("chk_diningorderitem_item_source", sql`((menuitemid IS NOT NULL) AND (rs_itemid IS NULL)) OR ((menuitemid IS NULL) AND (rs_itemid IS NOT NULL))`),
	check("chk_diningorderitem_quantity", sql`quantity > 0`),
]);

export const reservationrequest = pgTable("reservationrequest", {
	requestid: uuid().primaryKey().notNull(),
	facilitytype: varchar({ length: 50 }).notNull(),
	facilityid: uuid().notNull(),
	reservationtime: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	partysize: integer(),
	specialrequests: text(),
	duration: integer(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_reservationrequest_facilityid").using("btree", table.facilityid.asc().nullsLast().op("uuid_ops")),
	index("idx_reservationrequest_facilitytype").using("btree", table.facilitytype.asc().nullsLast().op("text_ops")),
	index("idx_reservationrequest_reservationtime").using("btree", table.reservationtime.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.facilityid],
			foreignColumns: [facility.facilityid],
			name: "fk_reservationrequest_facilityid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.requestid],
			foreignColumns: [request.requestid],
			name: "fk_reservationrequest_requestid"
		}).onDelete("cascade"),
	check("chk_reservationrequest_duration", sql`duration > 0`),
	check("chk_reservationrequest_partysize", sql`partysize > 0`),
]);

export const charge = pgTable("charge", {
	chargeid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	reservationid: uuid().notNull(),
	guestid: uuid().notNull(),
	sourceDiningOrderItemId: uuid("source_dining_order_item_id"),
	sourceEventBookingId: uuid("source_event_booking_id"),
	sourceSpecialProductId: uuid("source_special_product_id"),
	description: text().notNull(),
	baseamount: numeric({ precision: 10, scale:  2 }).notNull(),
	taxamount: numeric({ precision: 10, scale:  2 }).default('0.00'),
	totalamount: numeric({ precision: 10, scale:  2 }).notNull(),
	currencycode: varchar({ length: 3 }).default('USD').notNull(),
	taxratepercentage: numeric({ precision: 5, scale:  2 }),
	ispaid: boolean().default(false),
	paidtimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	ischargedtoroom: boolean().default(true),
	istaxed: boolean().default(true),
	chargetimestamp: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	servicetimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	createdbyemployeeid: uuid(),
	notes: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_charge_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_charge_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_charge_ispaid").using("btree", table.ispaid.asc().nullsLast().op("bool_ops")),
	index("idx_charge_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_charge_source_doi").using("btree", table.sourceDiningOrderItemId.asc().nullsLast().op("uuid_ops")).where(sql`(source_dining_order_item_id IS NOT NULL)`),
	index("idx_charge_source_eb").using("btree", table.sourceEventBookingId.asc().nullsLast().op("uuid_ops")).where(sql`(source_event_booking_id IS NOT NULL)`),
	index("idx_charge_source_spp").using("btree", table.sourceSpecialProductId.asc().nullsLast().op("uuid_ops")).where(sql`(source_special_product_id IS NOT NULL)`),
	index("idx_charge_timestamp").using("btree", table.chargetimestamp.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.currencycode],
			foreignColumns: [currency.code],
			name: "fk_charge_currency_code"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.createdbyemployeeid],
			foreignColumns: [employee.employeeid],
			name: "fk_charge_employee"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_charge_guest"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_charge_hotel"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_charge_reservation"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.sourceDiningOrderItemId],
			foreignColumns: [diningorderitem.orderitemid],
			name: "fk_charge_source_doi"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sourceEventBookingId],
			foreignColumns: [eventbooking.eventbookingid],
			name: "fk_charge_source_eb"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.sourceSpecialProductId],
			foreignColumns: [specialproducts.productid],
			name: "fk_charge_source_spp"
		}).onDelete("set null"),
	check("chk_charge_amounts", sql`(totalamount = (baseamount + taxamount)) AND (baseamount >= (0)::numeric) AND (taxamount >= (0)::numeric)`),
	check("chk_charge_source_exclusive", sql`((
CASE
    WHEN (source_dining_order_item_id IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN (source_event_booking_id IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (source_special_product_id IS NOT NULL) THEN 1
    ELSE 0
END) = 1`),
]);

export const menuitemmodification = pgTable("menuitemmodification", {
	menuitemmodificationid: uuid().defaultRandom().primaryKey().notNull(),
	menuitemid: uuid().notNull(),
	menumodifierid: uuid().notNull(),
	isdefault: boolean().default(false),
	canberemoved: boolean().default(true),
	additionalprice: numeric({ precision: 10, scale:  2 }),
	sortorder: integer().default(0),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_menuitemmodification_menuitem").using("btree", table.menuitemid.asc().nullsLast().op("uuid_ops")),
	index("idx_menuitemmodification_modifier").using("btree", table.menumodifierid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.menuitemid],
			foreignColumns: [menuitem.menuitemid],
			name: "fk_menuitemmodification_menuitem"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.menumodifierid],
			foreignColumns: [menuitemmodifier.menumodifierid],
			name: "fk_menuitemmodification_modifier"
		}).onDelete("cascade"),
	unique("uq_menuitemmod_item_modifier").on(table.menuitemid, table.menumodifierid),
]);

export const modificationrestriction = pgTable("modificationrestriction", {
	restrictionid: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	appliestomenuitemid: uuid(),
	appliestomodifierid: uuid(),
	ruledefinition: jsonb(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_modrestriction_menuitem").using("btree", table.appliestomenuitemid.asc().nullsLast().op("uuid_ops")),
	index("idx_modrestriction_modifier").using("btree", table.appliestomodifierid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.appliestomenuitemid],
			foreignColumns: [menuitem.menuitemid],
			name: "fk_modrestriction_menuitem"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.appliestomodifierid],
			foreignColumns: [menuitemmodifier.menumodifierid],
			name: "fk_modrestriction_modifier"
		}).onDelete("cascade"),
]);

export const housekeeping = pgTable("housekeeping", {
	housekeepingid: uuid().defaultRandom().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	roomid: uuid().notNull(),
	housekeepingtypeid: uuid().notNull(),
	requestid: uuid(),
	assignedtoemployeeid: uuid(),
	scheduledtimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	startedtimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	completedtimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	status: housekeepingStatusEnum().default('Pending'),
	priority: integer().default(3),
	notes: text(),
	inspectorid: uuid(),
	inspectionnotes: text(),
	inspectiontimestamp: timestamp({ withTimezone: true, mode: 'string' }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_housekeeping_assignedto").using("btree", table.assignedtoemployeeid.asc().nullsLast().op("uuid_ops")),
	index("idx_housekeeping_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_housekeeping_requestid").using("btree", table.requestid.asc().nullsLast().op("uuid_ops")),
	index("idx_housekeeping_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	index("idx_housekeeping_scheduled_ts").using("btree", table.scheduledtimestamp.asc().nullsLast().op("timestamptz_ops")),
	index("idx_housekeeping_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_housekeeping_typeid").using("btree", table.housekeepingtypeid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assignedtoemployeeid],
			foreignColumns: [employee.employeeid],
			name: "fk_housekeeping_employee_assigned"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.inspectorid],
			foreignColumns: [employee.employeeid],
			name: "fk_housekeeping_employee_inspector"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_housekeeping_hotel"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.requestid],
			foreignColumns: [request.requestid],
			name: "fk_housekeeping_request"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_housekeeping_room"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.housekeepingtypeid],
			foreignColumns: [housekeepingtype.housekeepingtypeid],
			name: "fk_housekeeping_type"
		}).onDelete("restrict"),
	check("chk_housekeeping_priority", sql`(priority >= 1) AND (priority <= 5)`),
]);

export const temperatureschedule = pgTable("temperatureschedule", {
	tempscheduleid: uuid().defaultRandom().primaryKey().notNull(),
	guestid: uuid().notNull(),
	reservationid: uuid(),
	roomid: uuid(),
	scheduledtime: time().notNull(),
	temperature: numeric({ precision: 4, scale:  1 }).notNull(),
	unit: char({ length: 1 }).default('C').notNull(),
	dayofweek: varchar({ length: 20 }).notNull(),
	isactive: boolean().default(true),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_tempschedule_dayofweek").using("btree", table.dayofweek.asc().nullsLast().op("text_ops")),
	index("idx_tempschedule_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_tempschedule_isactive").using("btree", table.isactive.asc().nullsLast().op("bool_ops")),
	index("idx_tempschedule_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_tempschedule_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	index("idx_tempschedule_scheduledtime").using("btree", table.scheduledtime.asc().nullsLast().op("time_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_tempschedule_guest"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_tempschedule_reservation"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_tempschedule_room"
		}).onDelete("cascade"),
	check("chk_tempschedule_day", sql`((dayofweek)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying, 'AllWeekdays'::character varying, 'AllWeekends'::character varying, 'Everyday'::character varying])::text[])) OR ((dayofweek)::text ~~ 'SpecificDate:%'::text)`),
	check("chk_tempschedule_unit", sql`unit = ANY (ARRAY['C'::bpchar, 'F'::bpchar])`),
]);

export const housekeepingschedule = pgTable("housekeepingschedule", {
	guesthkscheduleid: uuid().defaultRandom().primaryKey().notNull(),
	guestid: uuid().notNull(),
	reservationid: uuid(),
	preferredtime: time(),
	frequency: varchar({ length: 50 }),
	housekeepingtypeid: uuid(),
	isactive: boolean().default(true),
	notes: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_guestschedule_frequency").using("btree", table.frequency.asc().nullsLast().op("text_ops")),
	index("idx_guestschedule_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestschedule_isactive").using("btree", table.isactive.asc().nullsLast().op("bool_ops")),
	index("idx_guestschedule_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_guestschedule_guest"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.housekeepingtypeid],
			foreignColumns: [housekeepingtype.housekeepingtypeid],
			name: "fk_guestschedule_hktype"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_guestschedule_reservation"
		}).onDelete("cascade"),
]);

export const donotdisturbschedule = pgTable("donotdisturbschedule", {
	dndscheduleid: uuid().defaultRandom().primaryKey().notNull(),
	guestid: uuid().notNull(),
	reservationid: uuid(),
	intervalid: uuid().notNull(),
	dayofweek: varchar({ length: 20 }).notNull(),
	isactive: boolean().default(true),
	notes: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_dndschedule_dayofweek").using("btree", table.dayofweek.asc().nullsLast().op("text_ops")),
	index("idx_dndschedule_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_dndschedule_intervalid").using("btree", table.intervalid.asc().nullsLast().op("uuid_ops")),
	index("idx_dndschedule_isactive").using("btree", table.isactive.asc().nullsLast().op("bool_ops")),
	index("idx_dndschedule_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_dndschedule_guest"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.intervalid],
			foreignColumns: [scheduleinterval.intervalid],
			name: "fk_dndschedule_interval"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_dndschedule_reservation"
		}).onDelete("cascade"),
	check("chk_dndschedule_day", sql`((dayofweek)::text = ANY ((ARRAY['Monday'::character varying, 'Tuesday'::character varying, 'Wednesday'::character varying, 'Thursday'::character varying, 'Friday'::character varying, 'Saturday'::character varying, 'Sunday'::character varying, 'AllWeekdays'::character varying, 'AllWeekends'::character varying, 'Everyday'::character varying])::text[])) OR ((dayofweek)::text ~~ 'SpecificDate:%'::text)`),
]);

export const announcement = pgTable("announcement", {
	announcementid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	createdby: uuid().notNull(),
	title: varchar({ length: 100 }).notNull(),
	content: text().notNull(),
	announcementtype: announcementTypeEnum().default('normal'),
	audience: varchar({ length: 50 }).default('All'),
	targetroleid: uuid(),
	expiresat: timestamp({ withTimezone: true, mode: 'string' }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_announcement_createdat").using("btree", table.createdat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_announcement_createdby").using("btree", table.createdby.asc().nullsLast().op("uuid_ops")),
	index("idx_announcement_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_announcement_type").using("btree", table.announcementtype.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.createdby],
			foreignColumns: [employee.employeeid],
			name: "fk_announcement_createdby"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_announcement_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.targetroleid],
			foreignColumns: [role.roleid],
			name: "fk_announcement_targetrole"
		}).onDelete("set null"),
]);

export const guestpreference = pgTable("guestpreference", {
	preferenceid: uuid().primaryKey().notNull(),
	guestid: uuid().notNull(),
	hotelid: uuid().notNull(),
	preferencetype: varchar({ length: 50 }).notNull(),
	preferencevalue: jsonb(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_guestpreference_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestpreference_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestpreference_jsonb").using("gin", table.preferencevalue.asc().nullsLast().op("jsonb_ops")),
	index("idx_guestpreference_type").using("btree", table.preferencetype.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_guestpreference_guestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_guestpreference_hotelid"
		}).onDelete("cascade"),
]);

export const notification = pgTable("notification", {
	notificationid: uuid().primaryKey().notNull(),
	guestid: uuid().notNull(),
	hotelid: uuid().notNull(),
	type: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 100 }).notNull(),
	message: text().notNull(),
	data: jsonb(),
	isread: boolean().default(false),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_notification_createdat").using("btree", table.createdat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_notification_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_notification_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_notification_isread").using("btree", table.isread.asc().nullsLast().op("bool_ops")),
	index("idx_notification_jsonb").using("gin", table.data.asc().nullsLast().op("jsonb_ops")),
	index("idx_notification_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_notification_guestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_notification_hotelid"
		}).onDelete("cascade"),
]);

export const feedbackcategory = pgTable("feedbackcategory", {
	categoryid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_feedbackcategory_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_feedbackcategory_hotelid"
		}).onDelete("cascade"),
]);

export const feedbackrating = pgTable("feedbackrating", {
	ratingid: uuid().primaryKey().notNull(),
	guestid: uuid().notNull(),
	hotelid: uuid().notNull(),
	categoryid: uuid().notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_feedbackrating_categoryid").using("btree", table.categoryid.asc().nullsLast().op("uuid_ops")),
	index("idx_feedbackrating_createdat").using("btree", table.createdat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_feedbackrating_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_feedbackrating_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_feedbackrating_rating").using("btree", table.rating.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.categoryid],
			foreignColumns: [feedbackcategory.categoryid],
			name: "fk_feedbackrating_categoryid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_feedbackrating_guestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_feedbackrating_hotelid"
		}).onDelete("cascade"),
	check("chk_rating_range", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const guestfeedback = pgTable("guestfeedback", {
	feedbackid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	guestid: uuid().notNull(),
	typeid: uuid().notNull(),
	message: text(),
	rating: integer(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_guestfeedback_createdat").using("btree", table.createdat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_guestfeedback_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestfeedback_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestfeedback_rating").using("btree", table.rating.asc().nullsLast().op("int4_ops")),
	index("idx_guestfeedback_typeid").using("btree", table.typeid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_guestfeedback_guestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_guestfeedback_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.typeid],
			foreignColumns: [feedbacktype.typeid],
			name: "fk_guestfeedback_typeid"
		}).onDelete("restrict"),
	check("chk_guestfeedback_rating", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const message = pgTable("message", {
	messageid: uuid().primaryKey().notNull(),
	hotelid: uuid().notNull(),
	typeid: uuid().notNull(),
	senderid: uuid().notNull(),
	receiverid: uuid().notNull(),
	subject: varchar({ length: 100 }),
	content: text().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_message_createdat").using("btree", table.createdat.asc().nullsLast().op("timestamptz_ops")),
	index("idx_message_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_message_receiverid").using("btree", table.receiverid.asc().nullsLast().op("uuid_ops")),
	index("idx_message_senderid").using("btree", table.senderid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_message_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.receiverid],
			foreignColumns: [guest.guestid],
			name: "fk_message_receiverid"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.senderid],
			foreignColumns: [employee.employeeid],
			name: "fk_message_senderid"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.typeid],
			foreignColumns: [messagetype.typeid],
			name: "fk_message_typeid"
		}).onDelete("restrict"),
]);

export const roomreservation = pgTable("roomreservation", {
	reservationid: uuid().notNull(),
	roomid: uuid().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_roomreservation_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_roomreservation_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_roomreservation_reservationid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_roomreservation_roomid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.reservationid, table.roomid], name: "pk_roomreservation"}),
]);

export const menudietaryrestriction = pgTable("menudietaryrestriction", {
	menuitemid: uuid().notNull(),
	restrictioncode: varchar({ length: 10 }).notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_menudietaryrestriction_menuitemid").using("btree", table.menuitemid.asc().nullsLast().op("uuid_ops")),
	index("idx_menudietaryrestriction_restrictioncode").using("btree", table.restrictioncode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.menuitemid],
			foreignColumns: [menuitem.menuitemid],
			name: "fk_menudietaryrestriction_menuitemid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.restrictioncode],
			foreignColumns: [dietaryrestriction.code],
			name: "fk_menudietaryrestriction_restrictioncode"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.menuitemid, table.restrictioncode], name: "pk_menudietaryrestriction"}),
]);

export const guestdietaryrestriction = pgTable("guestdietaryrestriction", {
	guestid: uuid().notNull(),
	restrictioncode: varchar({ length: 10 }).notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_guestdietaryrestriction_guestid").using("btree", table.guestid.asc().nullsLast().op("uuid_ops")),
	index("idx_guestdietaryrestriction_restrictioncode").using("btree", table.restrictioncode.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.guestid],
			foreignColumns: [guest.guestid],
			name: "fk_guestdietaryrestriction_guestid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.restrictioncode],
			foreignColumns: [dietaryrestriction.code],
			name: "fk_guestdietaryrestriction_restrictioncode"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.guestid, table.restrictioncode], name: "pk_guestdietaryrestriction"}),
]);

export const rolepermission = pgTable("rolepermission", {
	roleid: uuid().notNull(),
	permissionid: uuid().notNull(),
	hotelid: uuid().notNull(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_rolepermission_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_rolepermission_permissionid").using("btree", table.permissionid.asc().nullsLast().op("uuid_ops")),
	index("idx_rolepermission_roleid").using("btree", table.roleid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_rolepermission_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionid],
			foreignColumns: [permission.permissionid],
			name: "fk_rolepermission_permissionid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleid],
			foreignColumns: [role.roleid],
			name: "fk_rolepermission_roleid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.roleid, table.permissionid, table.hotelid], name: "pk_rolepermission"}),
]);

export const hotelemail = pgTable("hotelemail", {
	address: varchar({ length: 255 }).notNull(),
	hotelid: uuid().notNull(),
	purpose: varchar({ length: 50 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_hotelemail_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_hotelemail_purpose").using("btree", table.purpose.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_hotelemail_hotelid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.address, table.hotelid], name: "pk_hotelemail"}),
	check("chk_hotelemail_address", sql`(address)::text ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'::text`),
]);

export const hotelphone = pgTable("hotelphone", {
	number: varchar({ length: 50 }).notNull(),
	hotelid: uuid().notNull(),
	purpose: varchar({ length: 50 }),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_hotelphone_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_hotelphone_purpose").using("btree", table.purpose.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_hotelphone_hotelid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.number, table.hotelid], name: "pk_hotelphone"}),
	check("chk_hotelphone_number", sql`(number)::text ~ '^[+]?[0-9\\s\\-\\(\)]+$'::text`),
]);

export const bedroom = pgTable("bedroom", {
	bedtype: varchar({ length: 50 }).notNull(),
	roomid: uuid().notNull(),
	quantity: integer(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_bedroom_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_bedroom_roomid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.bedtype, table.roomid], name: "pk_bedroom"}),
	check("chk_bedroom_quantity", sql`quantity > 0`),
]);

export const eventquestionresponse = pgTable("eventquestionresponse", {
	eventquestionid: uuid().notNull(),
	eventbookingid: uuid().notNull(),
	response: text(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_eventquestionresponse_eventbookingid").using("btree", table.eventbookingid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.eventbookingid],
			foreignColumns: [eventbooking.eventbookingid],
			name: "fk_eventquestionresponse_eventbookingid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.eventquestionid],
			foreignColumns: [eventquestion.eventquestionid],
			name: "fk_eventquestionresponse_eventquestionid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.eventquestionid, table.eventbookingid], name: "pk_eventquestionresponse"}),
]);

export const servicepackage = pgTable("servicepackage", {
	servicetypeid: uuid().notNull(),
	hotelid: uuid().notNull(),
	reservationid: uuid().notNull(),
	itemid: uuid().notNull(),
	paid: boolean(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_servicepackage_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_servicepackage_itemid").using("btree", table.itemid.asc().nullsLast().op("uuid_ops")),
	index("idx_servicepackage_paid").using("btree", table.paid.asc().nullsLast().op("bool_ops")),
	index("idx_servicepackage_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_servicepackage_servicetypeid").using("btree", table.servicetypeid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_servicepackage_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.itemid],
			foreignColumns: [inventoryitem.itemid],
			name: "fk_servicepackage_itemid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_servicepackage_reservationid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.servicetypeid],
			foreignColumns: [servicetype.servicetypeid],
			name: "fk_servicepackage_servicetypeid"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.servicetypeid, table.reservationid], name: "pk_servicepackage"}),
]);

export const itemassignment = pgTable("itemassignment", {
	itemid: uuid().notNull(),
	hotelid: uuid().notNull(),
	roomid: uuid().notNull(),
	reservationid: uuid(),
	quantity: integer(),
	startdate: date(),
	enddate: date(),
	createdat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_itemassignment_dates").using("btree", table.startdate.asc().nullsLast().op("date_ops"), table.enddate.asc().nullsLast().op("date_ops")),
	index("idx_itemassignment_hotelid").using("btree", table.hotelid.asc().nullsLast().op("uuid_ops")),
	index("idx_itemassignment_itemid").using("btree", table.itemid.asc().nullsLast().op("uuid_ops")),
	index("idx_itemassignment_reservationid").using("btree", table.reservationid.asc().nullsLast().op("uuid_ops")),
	index("idx_itemassignment_roomid").using("btree", table.roomid.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.hotelid],
			foreignColumns: [hotel.hotelid],
			name: "fk_itemassignment_hotelid"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.itemid],
			foreignColumns: [inventoryitem.itemid],
			name: "fk_itemassignment_itemid"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.reservationid],
			foreignColumns: [reservation.reservationid],
			name: "fk_itemassignment_reservationid"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.roomid],
			foreignColumns: [room.roomid],
			name: "fk_itemassignment_roomid"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.itemid, table.roomid], name: "pk_itemassignment"}),
	check("chk_itemassignment_dates", sql`((startdate IS NULL) AND (enddate IS NULL)) OR ((startdate IS NOT NULL) AND (enddate IS NOT NULL) AND (startdate <= enddate))`),
	check("chk_itemassignment_quantity", sql`quantity > 0`),
]);
