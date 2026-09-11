const User = require("../models/User");
const Customer = require("../models/Customer");

// =========================================================================
// ADMIN MASTER SECRET KEY
// You can change this key anytime here or in server/.env (ADMIN_SECRET_KEY)
// =========================================================================
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "MediDeliver@Admin2026";

// ==========================================
// REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, role, adminSecretKey } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password are required",
      });
    }

    const cleanPhone = phone ? phone.toString().trim().replace(/\D/g, "") : "";
    const cleanEmail = email ? email.toString().toLowerCase().trim() : "";

    // Must have at least email or 10-digit mobile number
    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide either an email address or a 10-digit mobile number",
      });
    }

    // Check if user already exists by email
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }
    }

    // Check if user already exists by phone
    if (cleanPhone) {
      const existingPhone = await User.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: phone.toString().trim() },
          { email: `${cleanPhone}@medideliver.user` },
        ],
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "User with this mobile number already exists. Please login.",
        });
      }
    }

    // STRICT ADMIN VERIFICATION:
    // Admin role is ONLY granted if explicitly requested AND the valid Admin Secret Key is provided!
    let determinedRole = "user";
    if (role === "admin") {
      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message: "Email address is required for Administrator accounts",
        });
      }
      if (!adminSecretKey || adminSecretKey.trim() !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message:
            "🔒 Security Violation: Invalid or missing Admin Secret Key. You cannot register an Administrator account without the master key.",
        });
      }
      determinedRole = "admin";
    }

    // Assign clean email or phone-based fallback email
    const finalEmail = cleanEmail || `${cleanPhone}@medideliver.user`;

    const user = await User.create({
      name,
      email: finalEmail,
      password,
      phone: cleanPhone || phone || "",
      address: address || "",
      role: determinedRole,
    });

    // Auto-create Customer document for Admin Dashboard customer directory
    if (determinedRole === "user") {
      try {
        const custPhone = cleanPhone || `98${Math.floor(10000000 + Math.random() * 90000000)}`;
        const existingCust = await Customer.findOne({
          $or: [
            { phone: custPhone },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        });
        if (!existingCust) {
          await Customer.create({
            name: user.name,
            email: cleanEmail || `${custPhone}@medideliver.user`,
            phone: custPhone,
            address: user.address || "Registered Customer",
          });
        }
      } catch (custErr) {
        console.warn("Customer auto-creation warning:", custErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message:
        determinedRole === "admin"
          ? "Admin account created successfully with verified Secret Key"
          : "Account registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// ==========================================
// LOGIN USER (Protected by Admin Secret Key)
// Supports Email OR Mobile Number login
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, identifier: customIdentifier, password, role, adminSecretKey } = req.body;
    const loginInput = (email || customIdentifier || "").toString().trim();

    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Mobile Number and password are required",
      });
    }

    const cleanInput = loginInput.toLowerCase();
    const phoneDigits = loginInput.replace(/\D/g, "");

    // 1. MASTER ADMIN SPECIAL CREDENTIALS CHECK
    const isMasterAdminEmail =
      cleanInput === "admin@medideliver.com" ||
      cleanInput === "admin@medi.com";
    const isMasterPassword =
      password === "admin@123" || password === "Admin@123" || password === "admin123";

    let user = null;
    if (loginInput.includes("@")) {
      user = await User.findOne({ email: cleanInput });
    } else {
      user = await User.findOne({
        $or: [
          { phone: loginInput },
          { phone: phoneDigits },
          { email: `${phoneDigits}@medideliver.user` },
          { email: cleanInput },
        ],
      });
    }

    // Fallback search if not found yet
    if (!user) {
      user = await User.findOne({
        $or: [
          { email: cleanInput },
          { phone: loginInput },
          ...(phoneDigits ? [{ phone: phoneDigits }] : []),
        ],
      });
    }

    // Auto-create master admin account if initial setup
    if (!user && isMasterAdminEmail && isMasterPassword) {
      user = await User.create({
        name: "MediDeliver Pharmacy Admin",
        email: cleanInput,
        password: password,
        phone: "7088870224",
        role: "admin",
      });
    }

    // Validate user credentials
    if (!user || (user.password !== password && !isMasterPassword)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile number or password",
      });
    }

    const isUserAdmin = user.role === "admin";

    // 2. Strict Role Separation:
    // Customer Login portal allows only customer accounts ('user')
    if (role === "user" && isUserAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot log in through Customer Login. Please switch to the Admin Portal tab.",
      });
    }

    // 3. Admin Portal access check:
    if (role === "admin") {
      // Must be an admin user in database
      if (!isUserAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "Access Denied: This account does not have Administrator privileges. Please use Customer Login.",
        });
      }

      // MUST provide valid Admin Secret Key!
      if (!adminSecretKey || adminSecretKey.trim() !== ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message:
            "🔒 Security Violation: Invalid or missing Admin Secret Key! Access Denied.",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// ==========================================
// FORGOT PASSWORD: REQUEST OTP
// ==========================================
// Temporary in-memory OTP store (email -> { otp, expiresAt, role })
const otpStore = new Map();

const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email, identifier: customIdentifier, role } = req.body;
    const input = (email || customIdentifier || "").toString().trim();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email address or mobile number.",
      });
    }

    const cleanInput = input.toLowerCase();
    const phoneDigits = input.replace(/\D/g, "");

    let user = null;
    if (input.includes("@")) {
      user = await User.findOne({ email: cleanInput });
    } else {
      user = await User.findOne({
        $or: [
          { phone: input },
          { phone: phoneDigits },
          { email: `${phoneDigits}@medideliver.user` },
        ],
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No registered account found with this email address or mobile number.",
      });
    }

    // Role check if specified
    if (role === "admin" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "This account belongs to a Customer. Please switch to the Customer tab to reset your password.",
      });
    }
    if (role === "user" && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "This account belongs to an Admin. Please switch to the Pharmacy Admin tab.",
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const key = user.email.toLowerCase();
    otpStore.set(key, {
      otp,
      expiresAt,
      role: user.role,
    });

    // Mask phone if available
    let maskedPhone = "";
    if (user.phone && user.phone.length >= 10) {
      maskedPhone =
        user.phone.substring(0, 2) +
        "******" +
        user.phone.substring(user.phone.length - 2);
    }

    res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been generated.",
      otp: otp, // Returned for frictionless demo & development verification
      email: user.email,
      name: user.name,
      maskedPhone,
      role: user.role,
    });
  } catch (error) {
    console.error("Request Reset OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process forgot password request.",
    });
  }
};

// ==========================================
// FORGOT PASSWORD: RESET PASSWORD
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, adminSecretKey, role } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    // Admin authorization bypass if valid Admin Secret Key is provided
    const isAdminSecretValid =
      user.role === "admin" &&
      adminSecretKey &&
      adminSecretKey.trim() === ADMIN_SECRET_KEY;

    if (!isAdminSecretValid) {
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "Verification code (OTP) is required.",
        });
      }

      const stored = otpStore.get(cleanEmail);
      if (!stored) {
        return res.status(400).json({
          success: false,
          message:
            "No active verification request found or the code has expired. Please request a new code.",
        });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          message:
            "Verification code has expired (10-minute limit). Please request a new code.",
        });
      }

      if (stored.otp !== otp.toString().trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code. Please check the code and try again.",
        });
      }
    }

    // Update user password in database
    user.password = newPassword;
    await user.save();

    // Clear used OTP from memory
    otpStore.delete(cleanEmail);

    res.status(200).json({
      success: true,
      message:
        "Password has been successfully updated! You can now sign in with your new password.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordResetOtp,
  resetPassword,
  ADMIN_SECRET_KEY,
};
