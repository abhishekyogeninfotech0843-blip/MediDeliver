const Customer = require("../models/Customer");
const User = require("../models/User");

// Add Customer
const addCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Customer By ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    let customer = await Customer.findById(id);
    let user = null;

    if (customer) {
      if (name) customer.name = name;
      if (email) customer.email = email.toLowerCase().trim();
      if (phone) customer.phone = phone;
      if (address) customer.address = address;
      await customer.save();

      // Sync User record if customer has email
      if (customer.email) {
        await User.updateOne(
          { email: customer.email },
          { $set: { name: customer.name, phone: customer.phone, address: customer.address } }
        );
      }
    } else {
      user = await User.findById(id);
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase().trim();
        if (phone) user.phone = phone;
        if (address) user.address = address;
        await user.save();

        customer = {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          createdAt: user.createdAt,
        };

        // Sync Customer doc if exists
        await Customer.updateOne(
          { email: user.email },
          { $set: { name: user.name, phone: user.phone, address: user.address } }
        );
      }
    }

    if (!customer && !user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: customer || user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    let deletedCust = await Customer.findByIdAndDelete(id);
    let deletedUser = await User.findByIdAndDelete(id);

    if (deletedCust?.email) {
      await User.deleteOne({ email: deletedCust.email.toLowerCase().trim() });
    }
    if (deletedUser?.email) {
      await Customer.deleteOne({ email: deletedUser.email.toLowerCase().trim() });
    }

    if (!deletedCust && !deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export Controllers
module.exports = {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
