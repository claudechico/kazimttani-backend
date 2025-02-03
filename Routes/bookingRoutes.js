const express = require("express");
const router = express.Router();

const bookingsOperation = require("../Model/Booking");

// GET all bookings for a customer
router.get("/customer-bookings/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Validate customer_id
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const bookings = await bookingsOperation.getCustomerBookings(customer_id);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
});

// GET a single booking by ID
router.get("/bookingId/:booking_id", async (req, res) => {
  try {
    const { booking_id } = req.params;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await bookingsOperation.getBookingById(booking_id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
});

// GET bookings by provider ID with optional status filtering
router.get("/booking/:provider_id", async (req, res) => {
  try {
    const { provider_id } = req.params;
    const { status } = req.query; // Get status from query parameters (if any)

    // Fetch both count and bookings
    const { totalBookings, bookings } = await bookingsOperation.getBookingsByProviderId(provider_id, status);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: "No bookings found for this provider" });
    }

    res.json({
      success: true,
      totalBookings, // Include the count
      bookings, // Return multiple bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings", error: error.message });
  }
});

// GET bookings by customer ID with optional status filtering
router.get("/customer_booking/:customer_id", async (req, res) => {
  try {
    const { customer_id } = req.params;
    const { status } = req.query; // Get status from query parameters (if any)

    // Fetch both count and bookings
    const { totalBookings, bookings } = await bookingsOperation.getBookingsByCustomerId(customer_id, status);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: "No bookings found for this customer" });
    }

    res.json({
      success: true,
      totalBookings, // Include the count
      bookings, // Return multiple bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings", error: error.message });
  }
});

// POST create a new booking
router.post("/create-booking", async (req, res) => {
  try {
    const { customer_id, service_id, booking_time, booking_date } = req.body;

    // Validate required fields
    if (!customer_id || !service_id || !booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        message: "Customer ID, service ID, booking date, and booking time are required",
      });
    }

    const bookingData = {
      customer_id,
      service_id,
      booking_time,
      booking_date,
    };

    const result = await bookingsOperation.createBooking(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
});

// PUT update booking status
router.put("/update-booking-status/:booking_id", async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const { status, customer_id } = req.body;

    // Basic validation
    if (!status || !customer_id) {
      return res.status(400).json({ message: "Status and Customer ID are required" });
    }

    await bookingsOperation.updateBookingStatus(bookingId, status, customer_id);
    res.json({
      success: true,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error: error.message });
  }
});

// PUT cancel booking
router.put("/booking-cancel/:booking_id", async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const bookingData = req.body;

    // Step 1: Check if booking exists and belongs to the customer
    const booking = await bookingsOperation.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Only pending bookings can be canceled." });
    }

    if (booking.customer_id != bookingData.customer_id) {
      return res.status(403).json({ success: false, message: "Unauthorized: Customer ID does not match" });
    }

    // Step 2: Perform the cancellation
    const result = await bookingsOperation.updateBookingCancel(bookingId, bookingData);

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } else {
      res.status(404).json({ message: "Booking not found or already updated" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
});

// PUT update booking details
router.put("/update-booking/:booking_id", async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const bookingData = req.body;

    // Basic validation
    if (!bookingData.customer_id || !bookingData.booking_date || !bookingData.booking_time) {
      return res.status(400).json({ message: "Customer ID, booking date, and booking time are required" });
    }

    await bookingsOperation.updateBooking(bookingId, bookingData);
    res.json({
      success: true,
      message: "Booking updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
});

// DELETE booking
router.delete("/delete-booking/:booking_id", async (req, res) => {
  try {
    const bookingId = req.params.booking_id;
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    await bookingsOperation.deleteBooking(bookingId, customer_id);
    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking", error: error.message });
  }
});

module.exports = router;