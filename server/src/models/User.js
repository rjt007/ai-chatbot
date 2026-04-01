const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ALLOWED_EMAIL_DOMAIN = '@petasight.com';
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return email.endsWith(ALLOWED_EMAIL_DOMAIN);
        },
        message: `Only ${ALLOWED_EMAIL_DOMAIN} email addresses are permitted`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Do not return password by default in queries
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (Mongoose 9.x uses promise-based middleware)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare a candidate password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Return a safe user object (no password).
 * @returns {object}
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = { User, ALLOWED_EMAIL_DOMAIN };
