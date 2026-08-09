const crypto = require("crypto");
const Booking = require("../models/Booking");

function generateBookingNumber() {
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `HRG-${Date.now()}-${random}`;
}

async function createBooking(data) {
  const booking = await Booking.create({
    bookingNumber: generateBookingNumber(),
    ...data
  });

  return booking;
}

async function getBookingById(id) {
  return Booking.findById(id)
    .populate("customer", "name phone")
    .populate("driver", "name phone");
}

async function getCustomerBookings(customerId) {
  return Booking.find({
    customer: customerId
  })
    .sort({
      createdAt: -1
    })
    .populate("driver", "name phone");
}

module.exports = {
  createBooking,
  getBookingById,
  getCustomerBookings,
  generateBookingNumber
};