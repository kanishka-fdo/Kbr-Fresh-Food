const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: String,
    line2: String,
    city: { type: String, default: 'Negombo' },
    lat: Number,
    lng: Number,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String },

    customerId: { type: String, unique: true, sparse: true },
    totalPaid: { type: Number, default: 0 },
    salesDue: { type: Number, default: 0 },
    salesReturnDue: { type: Number, default: 0 },
    customerStatus: { type: String, default: 'Active' },

    // Roles: customer, staff, admin, driver, wholesale
    role: {
      type: String,
      enum: ['customer', 'staff', 'admin', 'driver', 'wholesale'],
      default: 'customer',
    },

    // Wholesale-specific fields (e.g. Keells, Food City, hotels, restaurants)
    businessName: { type: String },
    businessRegNo: { type: String },
    wholesaleApproved: { type: Boolean, default: true },

    // Driver-specific fields
    vehicleNumber: { type: String },
    isAvailable: { type: Boolean, default: true },

    addresses: [addressSchema],

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

    // Email change OTP flow
    pendingEmail: { type: String },
    emailChangeOtp: { type: String },
    emailChangeOtpExpires: { type: Date },

    // Checkout payment OTP
    paymentOtp: { type: String },
    paymentOtpExpires: { type: Date },

    // Profile picture (base64 data URL or external URL)
    avatar: { type: String, default: '' },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
