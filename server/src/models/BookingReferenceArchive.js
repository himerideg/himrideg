const mongoose = require("mongoose");

const bookingReferenceArchiveSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true
    },
    bookingNumber: {
      type: String,
      trim: true,
      default: "",
      index: true
    },
    originalCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    originalDriver: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    customerReferenceMissing: {
      type: Boolean,
      default: false,
      index: true
    },
    driverReferenceMissing: {
      type: Boolean,
      default: false,
      index: true
    },
    rideStatus: {
      type: String,
      trim: true,
      default: ""
    },
    paymentStatus: {
      type: String,
      trim: true,
      default: ""
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: ""
    },
    finalFare: {
      type: Number,
      default: null
    },
    travelDate: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    bookingCreatedAt: {
      type: Date,
      default: null
    },
    preservationVersion: {
      type: Number,
      default: 1
    },
    preservedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

bookingReferenceArchiveSchema.index({
  customerReferenceMissing: 1,
  driverReferenceMissing: 1,
  rideStatus: 1
});

module.exports =
  mongoose.models.BookingReferenceArchive ||
  mongoose.model("BookingReferenceArchive", bookingReferenceArchiveSchema);
