import { relations } from "drizzle-orm/relations";
import { region, country, state, address, hotel, currency, price, restaurant, building, room, employee, name, role, housekeepingtype, scheduleinterval, menuitemmodifier, facility, guest, language, guestaddress, addresstype, servicetype, inventoryitem, hotelevent, restaurantmenu, menuoperatingschedule, restaurantoperatingschedule, reservation, menuitem, contacttype, emailaddress, phonenumber, importantdate, wakeupcall, specialproducts, eventtimeslot, eventquestion, eventbooking, eventparticipant, reservationcomment, roomservicemenu, roomserviceitem, roomservicemenuschedule, request, generalrequest, diningrequest, diningorderitem, reservationrequest, charge, menuitemmodification, modificationrestriction, housekeeping, temperatureschedule, housekeepingschedule, donotdisturbschedule, announcement, guestpreference, notification, feedbackcategory, feedbackrating, guestfeedback, feedbacktype, message, messagetype, roomreservation, menudietaryrestriction, dietaryrestriction, guestdietaryrestriction, rolepermission, permission, hotelemail, hotelphone, bedroom, eventquestionresponse, servicepackage, itemassignment } from "./schema";

export const countryRelations = relations(country, ({one, many}) => ({
	region: one(region, {
		fields: [country.regioncode],
		references: [region.regioncode]
	}),
	states: many(state),
}));

export const regionRelations = relations(region, ({many}) => ({
	countries: many(country),
}));

export const stateRelations = relations(state, ({one, many}) => ({
	country: one(country, {
		fields: [state.countrycode],
		references: [country.countrycode]
	}),
	addresses: many(address),
}));

export const addressRelations = relations(address, ({one, many}) => ({
	state: one(state, {
		fields: [address.statecode],
		references: [state.statecode]
	}),
	hotels: many(hotel),
	restaurants: many(restaurant),
	buildings: many(building),
	guestaddresses: many(guestaddress),
}));

export const hotelRelations = relations(hotel, ({one, many}) => ({
	address: one(address, {
		fields: [hotel.addressid],
		references: [address.addressid]
	}),
	prices: many(price),
	restaurants: many(restaurant),
	buildings: many(building),
	rooms: many(room),
	employees: many(employee),
	housekeepingtypes: many(housekeepingtype),
	scheduleintervals: many(scheduleinterval),
	menuitemmodifiers: many(menuitemmodifier),
	facilities: many(facility),
	guests: many(guest),
	inventoryitems: many(inventoryitem),
	hotelevents: many(hotelevent),
	reservations: many(reservation),
	menuitems: many(menuitem),
	specialproducts: many(specialproducts),
	eventtimeslots: many(eventtimeslot),
	eventquestions: many(eventquestion),
	eventbookings: many(eventbooking),
	roomservicemenus: many(roomservicemenu),
	requests: many(request),
	charges: many(charge),
	housekeepings: many(housekeeping),
	announcements: many(announcement),
	guestpreferences: many(guestpreference),
	notifications: many(notification),
	feedbackcategories: many(feedbackcategory),
	feedbackratings: many(feedbackrating),
	guestfeedbacks: many(guestfeedback),
	messages: many(message),
	rolepermissions: many(rolepermission),
	hotelemails: many(hotelemail),
	hotelphones: many(hotelphone),
	servicepackages: many(servicepackage),
	itemassignments: many(itemassignment),
}));

export const priceRelations = relations(price, ({one, many}) => ({
	currency: one(currency, {
		fields: [price.currencyid],
		references: [currency.currencyid]
	}),
	hotel: one(hotel, {
		fields: [price.hotelid],
		references: [hotel.hotelid]
	}),
	menuitemmodifiers: many(menuitemmodifier),
	servicetypes: many(servicetype),
	menuitems: many(menuitem),
	specialproducts: many(specialproducts),
	eventbookings: many(eventbooking),
	roomserviceitems: many(roomserviceitem),
	diningorderitems: many(diningorderitem),
}));

export const currencyRelations = relations(currency, ({many}) => ({
	prices: many(price),
	charges: many(charge),
}));

export const restaurantRelations = relations(restaurant, ({one, many}) => ({
	address: one(address, {
		fields: [restaurant.addressid],
		references: [address.addressid]
	}),
	hotel: one(hotel, {
		fields: [restaurant.hotelid],
		references: [hotel.hotelid]
	}),
	restaurantmenus: many(restaurantmenu),
	restaurantoperatingschedules: many(restaurantoperatingschedule),
	diningrequests: many(diningrequest),
}));

export const buildingRelations = relations(building, ({one, many}) => ({
	address: one(address, {
		fields: [building.addressid],
		references: [address.addressid]
	}),
	hotel: one(hotel, {
		fields: [building.hotelid],
		references: [hotel.hotelid]
	}),
	rooms: many(room),
}));

export const roomRelations = relations(room, ({one, many}) => ({
	building: one(building, {
		fields: [room.buildingid],
		references: [building.buildingid]
	}),
	hotel: one(hotel, {
		fields: [room.hotelid],
		references: [hotel.hotelid]
	}),
	generalrequests: many(generalrequest),
	diningrequests: many(diningrequest),
	housekeepings: many(housekeeping),
	temperatureschedules: many(temperatureschedule),
	roomreservations: many(roomreservation),
	bedrooms: many(bedroom),
	itemassignments: many(itemassignment),
}));

export const employeeRelations = relations(employee, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [employee.hotelid],
		references: [hotel.hotelid]
	}),
	name: one(name, {
		fields: [employee.nameid],
		references: [name.nameid]
	}),
	role: one(role, {
		fields: [employee.roleid],
		references: [role.roleid]
	}),
	requests: many(request),
	charges: many(charge),
	housekeepings_assignedtoemployeeid: many(housekeeping, {
		relationName: "housekeeping_assignedtoemployeeid_employee_employeeid"
	}),
	housekeepings_inspectorid: many(housekeeping, {
		relationName: "housekeeping_inspectorid_employee_employeeid"
	}),
	announcements: many(announcement),
	messages: many(message),
}));

export const nameRelations = relations(name, ({many}) => ({
	employees: many(employee),
	guests: many(guest),
}));

export const roleRelations = relations(role, ({many}) => ({
	employees: many(employee),
	announcements: many(announcement),
	rolepermissions: many(rolepermission),
}));

export const housekeepingtypeRelations = relations(housekeepingtype, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [housekeepingtype.hotelid],
		references: [hotel.hotelid]
	}),
	housekeepings: many(housekeeping),
	housekeepingschedules: many(housekeepingschedule),
}));

export const scheduleintervalRelations = relations(scheduleinterval, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [scheduleinterval.hotelid],
		references: [hotel.hotelid]
	}),
	menuoperatingschedules: many(menuoperatingschedule),
	restaurantoperatingschedules: many(restaurantoperatingschedule),
	roomservicemenuschedules: many(roomservicemenuschedule),
	donotdisturbschedules: many(donotdisturbschedule),
}));

export const menuitemmodifierRelations = relations(menuitemmodifier, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [menuitemmodifier.hotelid],
		references: [hotel.hotelid]
	}),
	price: one(price, {
		fields: [menuitemmodifier.price],
		references: [price.priceid]
	}),
	menuitemmodifications: many(menuitemmodification),
	modificationrestrictions: many(modificationrestriction),
}));

export const facilityRelations = relations(facility, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [facility.hotelid],
		references: [hotel.hotelid]
	}),
	reservationrequests: many(reservationrequest),
}));

export const guestRelations = relations(guest, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [guest.hotelid],
		references: [hotel.hotelid]
	}),
	language: one(language, {
		fields: [guest.languageid],
		references: [language.languagecode]
	}),
	name: one(name, {
		fields: [guest.nameid],
		references: [name.nameid]
	}),
	guestaddresses: many(guestaddress),
	reservations: many(reservation),
	emailaddresses: many(emailaddress),
	phonenumbers: many(phonenumber),
	importantdates: many(importantdate),
	wakeupcalls: many(wakeupcall),
	eventbookings: many(eventbooking),
	requests: many(request),
	charges: many(charge),
	temperatureschedules: many(temperatureschedule),
	housekeepingschedules: many(housekeepingschedule),
	donotdisturbschedules: many(donotdisturbschedule),
	guestpreferences: many(guestpreference),
	notifications: many(notification),
	feedbackratings: many(feedbackrating),
	guestfeedbacks: many(guestfeedback),
	messages: many(message),
	guestdietaryrestrictions: many(guestdietaryrestriction),
}));

export const languageRelations = relations(language, ({many}) => ({
	guests: many(guest),
}));

export const guestaddressRelations = relations(guestaddress, ({one}) => ({
	address: one(address, {
		fields: [guestaddress.addressid],
		references: [address.addressid]
	}),
	addresstype: one(addresstype, {
		fields: [guestaddress.addresstypeid],
		references: [addresstype.addresstypeid]
	}),
	guest: one(guest, {
		fields: [guestaddress.guestid],
		references: [guest.guestid]
	}),
}));

export const addresstypeRelations = relations(addresstype, ({many}) => ({
	guestaddresses: many(guestaddress),
}));

export const servicetypeRelations = relations(servicetype, ({one, many}) => ({
	price: one(price, {
		fields: [servicetype.price],
		references: [price.priceid]
	}),
	servicepackages: many(servicepackage),
}));

export const inventoryitemRelations = relations(inventoryitem, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [inventoryitem.hotelid],
		references: [hotel.hotelid]
	}),
	servicepackages: many(servicepackage),
	itemassignments: many(itemassignment),
}));

export const hoteleventRelations = relations(hotelevent, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [hotelevent.hotelid],
		references: [hotel.hotelid]
	}),
	eventtimeslots: many(eventtimeslot),
	eventquestions: many(eventquestion),
	eventbookings: many(eventbooking),
}));

export const restaurantmenuRelations = relations(restaurantmenu, ({one, many}) => ({
	restaurant: one(restaurant, {
		fields: [restaurantmenu.restaurantid],
		references: [restaurant.restaurantid]
	}),
	menuoperatingschedules: many(menuoperatingschedule),
	menuitems: many(menuitem),
}));

export const menuoperatingscheduleRelations = relations(menuoperatingschedule, ({one}) => ({
	scheduleinterval: one(scheduleinterval, {
		fields: [menuoperatingschedule.intervalid],
		references: [scheduleinterval.intervalid]
	}),
	restaurantmenu: one(restaurantmenu, {
		fields: [menuoperatingschedule.restaurantmenuid],
		references: [restaurantmenu.restaurantmenuid]
	}),
}));

export const restaurantoperatingscheduleRelations = relations(restaurantoperatingschedule, ({one}) => ({
	scheduleinterval: one(scheduleinterval, {
		fields: [restaurantoperatingschedule.intervalid],
		references: [scheduleinterval.intervalid]
	}),
	restaurant: one(restaurant, {
		fields: [restaurantoperatingschedule.restaurantid],
		references: [restaurant.restaurantid]
	}),
}));

export const reservationRelations = relations(reservation, ({one, many}) => ({
	guest: one(guest, {
		fields: [reservation.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [reservation.hotelid],
		references: [hotel.hotelid]
	}),
	wakeupcalls: many(wakeupcall),
	eventbookings: many(eventbooking),
	reservationcomments: many(reservationcomment),
	requests: many(request),
	charges: many(charge),
	temperatureschedules: many(temperatureschedule),
	housekeepingschedules: many(housekeepingschedule),
	donotdisturbschedules: many(donotdisturbschedule),
	roomreservations: many(roomreservation),
	servicepackages: many(servicepackage),
	itemassignments: many(itemassignment),
}));

export const menuitemRelations = relations(menuitem, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [menuitem.hotelid],
		references: [hotel.hotelid]
	}),
	price: one(price, {
		fields: [menuitem.price],
		references: [price.priceid]
	}),
	restaurantmenu: one(restaurantmenu, {
		fields: [menuitem.restaurantmenuid],
		references: [restaurantmenu.restaurantmenuid]
	}),
	diningorderitems: many(diningorderitem),
	menuitemmodifications: many(menuitemmodification),
	modificationrestrictions: many(modificationrestriction),
	menudietaryrestrictions: many(menudietaryrestriction),
}));

export const emailaddressRelations = relations(emailaddress, ({one}) => ({
	contacttype: one(contacttype, {
		fields: [emailaddress.contacttypeid],
		references: [contacttype.contacttypeid]
	}),
	guest: one(guest, {
		fields: [emailaddress.guestid],
		references: [guest.guestid]
	}),
}));

export const contacttypeRelations = relations(contacttype, ({many}) => ({
	emailaddresses: many(emailaddress),
	phonenumbers: many(phonenumber),
}));

export const phonenumberRelations = relations(phonenumber, ({one}) => ({
	contacttype: one(contacttype, {
		fields: [phonenumber.contacttypeid],
		references: [contacttype.contacttypeid]
	}),
	guest: one(guest, {
		fields: [phonenumber.guestid],
		references: [guest.guestid]
	}),
}));

export const importantdateRelations = relations(importantdate, ({one}) => ({
	guest: one(guest, {
		fields: [importantdate.guestid],
		references: [guest.guestid]
	}),
}));

export const wakeupcallRelations = relations(wakeupcall, ({one}) => ({
	guest: one(guest, {
		fields: [wakeupcall.guestid],
		references: [guest.guestid]
	}),
	reservation: one(reservation, {
		fields: [wakeupcall.reservationid],
		references: [reservation.reservationid]
	}),
}));

export const specialproductsRelations = relations(specialproducts, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [specialproducts.hotelid],
		references: [hotel.hotelid]
	}),
	price: one(price, {
		fields: [specialproducts.priceid],
		references: [price.priceid]
	}),
	charges: many(charge),
}));

export const eventtimeslotRelations = relations(eventtimeslot, ({one, many}) => ({
	hotelevent: one(hotelevent, {
		fields: [eventtimeslot.eventid],
		references: [hotelevent.eventid]
	}),
	hotel: one(hotel, {
		fields: [eventtimeslot.hotelid],
		references: [hotel.hotelid]
	}),
	eventbookings: many(eventbooking),
}));

export const eventquestionRelations = relations(eventquestion, ({one, many}) => ({
	hotelevent: one(hotelevent, {
		fields: [eventquestion.eventid],
		references: [hotelevent.eventid]
	}),
	hotel: one(hotel, {
		fields: [eventquestion.hotelid],
		references: [hotel.hotelid]
	}),
	eventquestionresponses: many(eventquestionresponse),
}));

export const eventbookingRelations = relations(eventbooking, ({one, many}) => ({
	hotelevent: one(hotelevent, {
		fields: [eventbooking.eventid],
		references: [hotelevent.eventid]
	}),
	eventtimeslot: one(eventtimeslot, {
		fields: [eventbooking.eventtimeslotid],
		references: [eventtimeslot.eventtimeslotid]
	}),
	guest: one(guest, {
		fields: [eventbooking.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [eventbooking.hotelid],
		references: [hotel.hotelid]
	}),
	price: one(price, {
		fields: [eventbooking.priceid],
		references: [price.priceid]
	}),
	reservation: one(reservation, {
		fields: [eventbooking.reservationid],
		references: [reservation.reservationid]
	}),
	eventparticipants: many(eventparticipant),
	charges: many(charge),
	eventquestionresponses: many(eventquestionresponse),
}));

export const eventparticipantRelations = relations(eventparticipant, ({one}) => ({
	eventbooking: one(eventbooking, {
		fields: [eventparticipant.eventbookingid],
		references: [eventbooking.eventbookingid]
	}),
}));

export const reservationcommentRelations = relations(reservationcomment, ({one}) => ({
	reservation: one(reservation, {
		fields: [reservationcomment.reservationid],
		references: [reservation.reservationid]
	}),
}));

export const roomservicemenuRelations = relations(roomservicemenu, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [roomservicemenu.hotelid],
		references: [hotel.hotelid]
	}),
	roomserviceitems: many(roomserviceitem),
	roomservicemenuschedules: many(roomservicemenuschedule),
}));

export const roomserviceitemRelations = relations(roomserviceitem, ({one, many}) => ({
	roomservicemenu: one(roomservicemenu, {
		fields: [roomserviceitem.roomservicemenuid],
		references: [roomservicemenu.roomservicemenuid]
	}),
	price: one(price, {
		fields: [roomserviceitem.priceid],
		references: [price.priceid]
	}),
	diningorderitems: many(diningorderitem),
}));

export const roomservicemenuscheduleRelations = relations(roomservicemenuschedule, ({one}) => ({
	scheduleinterval: one(scheduleinterval, {
		fields: [roomservicemenuschedule.intervalid],
		references: [scheduleinterval.intervalid]
	}),
	roomservicemenu: one(roomservicemenu, {
		fields: [roomservicemenuschedule.roomservicemenuid],
		references: [roomservicemenu.roomservicemenuid]
	}),
}));

export const requestRelations = relations(request, ({one, many}) => ({
	employee: one(employee, {
		fields: [request.assignedtoemployeeid],
		references: [employee.employeeid]
	}),
	guest: one(guest, {
		fields: [request.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [request.hotelid],
		references: [hotel.hotelid]
	}),
	reservation: one(reservation, {
		fields: [request.reservationid],
		references: [reservation.reservationid]
	}),
	generalrequests: many(generalrequest),
	diningrequests: many(diningrequest),
	reservationrequests: many(reservationrequest),
	housekeepings: many(housekeeping),
}));

export const generalrequestRelations = relations(generalrequest, ({one}) => ({
	request: one(request, {
		fields: [generalrequest.requestid],
		references: [request.requestid]
	}),
	room: one(room, {
		fields: [generalrequest.roomid],
		references: [room.roomid]
	}),
}));

export const diningrequestRelations = relations(diningrequest, ({one, many}) => ({
	request: one(request, {
		fields: [diningrequest.requestid],
		references: [request.requestid]
	}),
	restaurant: one(restaurant, {
		fields: [diningrequest.restaurantid],
		references: [restaurant.restaurantid]
	}),
	room: one(room, {
		fields: [diningrequest.roomid],
		references: [room.roomid]
	}),
	diningorderitems: many(diningorderitem),
}));

export const diningorderitemRelations = relations(diningorderitem, ({one, many}) => ({
	menuitem: one(menuitem, {
		fields: [diningorderitem.menuitemid],
		references: [menuitem.menuitemid]
	}),
	price: one(price, {
		fields: [diningorderitem.priceid],
		references: [price.priceid]
	}),
	diningrequest: one(diningrequest, {
		fields: [diningorderitem.requestid],
		references: [diningrequest.requestid]
	}),
	roomserviceitem: one(roomserviceitem, {
		fields: [diningorderitem.rsItemid],
		references: [roomserviceitem.rsItemid]
	}),
	charges: many(charge),
}));

export const reservationrequestRelations = relations(reservationrequest, ({one}) => ({
	facility: one(facility, {
		fields: [reservationrequest.facilityid],
		references: [facility.facilityid]
	}),
	request: one(request, {
		fields: [reservationrequest.requestid],
		references: [request.requestid]
	}),
}));

export const chargeRelations = relations(charge, ({one}) => ({
	currency: one(currency, {
		fields: [charge.currencycode],
		references: [currency.code]
	}),
	employee: one(employee, {
		fields: [charge.createdbyemployeeid],
		references: [employee.employeeid]
	}),
	guest: one(guest, {
		fields: [charge.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [charge.hotelid],
		references: [hotel.hotelid]
	}),
	reservation: one(reservation, {
		fields: [charge.reservationid],
		references: [reservation.reservationid]
	}),
	diningorderitem: one(diningorderitem, {
		fields: [charge.sourceDiningOrderItemId],
		references: [diningorderitem.orderitemid]
	}),
	eventbooking: one(eventbooking, {
		fields: [charge.sourceEventBookingId],
		references: [eventbooking.eventbookingid]
	}),
	specialproduct: one(specialproducts, {
		fields: [charge.sourceSpecialProductId],
		references: [specialproducts.productid]
	}),
}));

export const menuitemmodificationRelations = relations(menuitemmodification, ({one}) => ({
	menuitem: one(menuitem, {
		fields: [menuitemmodification.menuitemid],
		references: [menuitem.menuitemid]
	}),
	menuitemmodifier: one(menuitemmodifier, {
		fields: [menuitemmodification.menumodifierid],
		references: [menuitemmodifier.menumodifierid]
	}),
}));

export const modificationrestrictionRelations = relations(modificationrestriction, ({one}) => ({
	menuitem: one(menuitem, {
		fields: [modificationrestriction.appliestomenuitemid],
		references: [menuitem.menuitemid]
	}),
	menuitemmodifier: one(menuitemmodifier, {
		fields: [modificationrestriction.appliestomodifierid],
		references: [menuitemmodifier.menumodifierid]
	}),
}));

export const housekeepingRelations = relations(housekeeping, ({one}) => ({
	employee_assignedtoemployeeid: one(employee, {
		fields: [housekeeping.assignedtoemployeeid],
		references: [employee.employeeid],
		relationName: "housekeeping_assignedtoemployeeid_employee_employeeid"
	}),
	employee_inspectorid: one(employee, {
		fields: [housekeeping.inspectorid],
		references: [employee.employeeid],
		relationName: "housekeeping_inspectorid_employee_employeeid"
	}),
	hotel: one(hotel, {
		fields: [housekeeping.hotelid],
		references: [hotel.hotelid]
	}),
	request: one(request, {
		fields: [housekeeping.requestid],
		references: [request.requestid]
	}),
	room: one(room, {
		fields: [housekeeping.roomid],
		references: [room.roomid]
	}),
	housekeepingtype: one(housekeepingtype, {
		fields: [housekeeping.housekeepingtypeid],
		references: [housekeepingtype.housekeepingtypeid]
	}),
}));

export const temperaturescheduleRelations = relations(temperatureschedule, ({one}) => ({
	guest: one(guest, {
		fields: [temperatureschedule.guestid],
		references: [guest.guestid]
	}),
	reservation: one(reservation, {
		fields: [temperatureschedule.reservationid],
		references: [reservation.reservationid]
	}),
	room: one(room, {
		fields: [temperatureschedule.roomid],
		references: [room.roomid]
	}),
}));

export const housekeepingscheduleRelations = relations(housekeepingschedule, ({one}) => ({
	guest: one(guest, {
		fields: [housekeepingschedule.guestid],
		references: [guest.guestid]
	}),
	housekeepingtype: one(housekeepingtype, {
		fields: [housekeepingschedule.housekeepingtypeid],
		references: [housekeepingtype.housekeepingtypeid]
	}),
	reservation: one(reservation, {
		fields: [housekeepingschedule.reservationid],
		references: [reservation.reservationid]
	}),
}));

export const donotdisturbscheduleRelations = relations(donotdisturbschedule, ({one}) => ({
	guest: one(guest, {
		fields: [donotdisturbschedule.guestid],
		references: [guest.guestid]
	}),
	scheduleinterval: one(scheduleinterval, {
		fields: [donotdisturbschedule.intervalid],
		references: [scheduleinterval.intervalid]
	}),
	reservation: one(reservation, {
		fields: [donotdisturbschedule.reservationid],
		references: [reservation.reservationid]
	}),
}));

export const announcementRelations = relations(announcement, ({one}) => ({
	employee: one(employee, {
		fields: [announcement.createdby],
		references: [employee.employeeid]
	}),
	hotel: one(hotel, {
		fields: [announcement.hotelid],
		references: [hotel.hotelid]
	}),
	role: one(role, {
		fields: [announcement.targetroleid],
		references: [role.roleid]
	}),
}));

export const guestpreferenceRelations = relations(guestpreference, ({one}) => ({
	guest: one(guest, {
		fields: [guestpreference.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [guestpreference.hotelid],
		references: [hotel.hotelid]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	guest: one(guest, {
		fields: [notification.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [notification.hotelid],
		references: [hotel.hotelid]
	}),
}));

export const feedbackcategoryRelations = relations(feedbackcategory, ({one, many}) => ({
	hotel: one(hotel, {
		fields: [feedbackcategory.hotelid],
		references: [hotel.hotelid]
	}),
	feedbackratings: many(feedbackrating),
}));

export const feedbackratingRelations = relations(feedbackrating, ({one}) => ({
	feedbackcategory: one(feedbackcategory, {
		fields: [feedbackrating.categoryid],
		references: [feedbackcategory.categoryid]
	}),
	guest: one(guest, {
		fields: [feedbackrating.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [feedbackrating.hotelid],
		references: [hotel.hotelid]
	}),
}));

export const guestfeedbackRelations = relations(guestfeedback, ({one}) => ({
	guest: one(guest, {
		fields: [guestfeedback.guestid],
		references: [guest.guestid]
	}),
	hotel: one(hotel, {
		fields: [guestfeedback.hotelid],
		references: [hotel.hotelid]
	}),
	feedbacktype: one(feedbacktype, {
		fields: [guestfeedback.typeid],
		references: [feedbacktype.typeid]
	}),
}));

export const feedbacktypeRelations = relations(feedbacktype, ({many}) => ({
	guestfeedbacks: many(guestfeedback),
}));

export const messageRelations = relations(message, ({one}) => ({
	hotel: one(hotel, {
		fields: [message.hotelid],
		references: [hotel.hotelid]
	}),
	guest: one(guest, {
		fields: [message.receiverid],
		references: [guest.guestid]
	}),
	employee: one(employee, {
		fields: [message.senderid],
		references: [employee.employeeid]
	}),
	messagetype: one(messagetype, {
		fields: [message.typeid],
		references: [messagetype.typeid]
	}),
}));

export const messagetypeRelations = relations(messagetype, ({many}) => ({
	messages: many(message),
}));

export const roomreservationRelations = relations(roomreservation, ({one}) => ({
	reservation: one(reservation, {
		fields: [roomreservation.reservationid],
		references: [reservation.reservationid]
	}),
	room: one(room, {
		fields: [roomreservation.roomid],
		references: [room.roomid]
	}),
}));

export const menudietaryrestrictionRelations = relations(menudietaryrestriction, ({one}) => ({
	menuitem: one(menuitem, {
		fields: [menudietaryrestriction.menuitemid],
		references: [menuitem.menuitemid]
	}),
	dietaryrestriction: one(dietaryrestriction, {
		fields: [menudietaryrestriction.restrictioncode],
		references: [dietaryrestriction.code]
	}),
}));

export const dietaryrestrictionRelations = relations(dietaryrestriction, ({many}) => ({
	menudietaryrestrictions: many(menudietaryrestriction),
	guestdietaryrestrictions: many(guestdietaryrestriction),
}));

export const guestdietaryrestrictionRelations = relations(guestdietaryrestriction, ({one}) => ({
	guest: one(guest, {
		fields: [guestdietaryrestriction.guestid],
		references: [guest.guestid]
	}),
	dietaryrestriction: one(dietaryrestriction, {
		fields: [guestdietaryrestriction.restrictioncode],
		references: [dietaryrestriction.code]
	}),
}));

export const rolepermissionRelations = relations(rolepermission, ({one}) => ({
	hotel: one(hotel, {
		fields: [rolepermission.hotelid],
		references: [hotel.hotelid]
	}),
	permission: one(permission, {
		fields: [rolepermission.permissionid],
		references: [permission.permissionid]
	}),
	role: one(role, {
		fields: [rolepermission.roleid],
		references: [role.roleid]
	}),
}));

export const permissionRelations = relations(permission, ({many}) => ({
	rolepermissions: many(rolepermission),
}));

export const hotelemailRelations = relations(hotelemail, ({one}) => ({
	hotel: one(hotel, {
		fields: [hotelemail.hotelid],
		references: [hotel.hotelid]
	}),
}));

export const hotelphoneRelations = relations(hotelphone, ({one}) => ({
	hotel: one(hotel, {
		fields: [hotelphone.hotelid],
		references: [hotel.hotelid]
	}),
}));

export const bedroomRelations = relations(bedroom, ({one}) => ({
	room: one(room, {
		fields: [bedroom.roomid],
		references: [room.roomid]
	}),
}));

export const eventquestionresponseRelations = relations(eventquestionresponse, ({one}) => ({
	eventbooking: one(eventbooking, {
		fields: [eventquestionresponse.eventbookingid],
		references: [eventbooking.eventbookingid]
	}),
	eventquestion: one(eventquestion, {
		fields: [eventquestionresponse.eventquestionid],
		references: [eventquestion.eventquestionid]
	}),
}));

export const servicepackageRelations = relations(servicepackage, ({one}) => ({
	hotel: one(hotel, {
		fields: [servicepackage.hotelid],
		references: [hotel.hotelid]
	}),
	inventoryitem: one(inventoryitem, {
		fields: [servicepackage.itemid],
		references: [inventoryitem.itemid]
	}),
	reservation: one(reservation, {
		fields: [servicepackage.reservationid],
		references: [reservation.reservationid]
	}),
	servicetype: one(servicetype, {
		fields: [servicepackage.servicetypeid],
		references: [servicetype.servicetypeid]
	}),
}));

export const itemassignmentRelations = relations(itemassignment, ({one}) => ({
	hotel: one(hotel, {
		fields: [itemassignment.hotelid],
		references: [hotel.hotelid]
	}),
	inventoryitem: one(inventoryitem, {
		fields: [itemassignment.itemid],
		references: [inventoryitem.itemid]
	}),
	reservation: one(reservation, {
		fields: [itemassignment.reservationid],
		references: [reservation.reservationid]
	}),
	room: one(room, {
		fields: [itemassignment.roomid],
		references: [room.roomid]
	}),
}));