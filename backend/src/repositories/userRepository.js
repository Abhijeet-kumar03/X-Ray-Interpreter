'use strict';

const User = require('../models/User');

const userRepository = {
  async findById(id, selectPassword = false) {
    const query = User.findById(id);
    if (selectPassword) query.select('+password');
    return query.exec();
  },

  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (selectPassword) query.select('+password');
    return query.exec();
  },

  async findByResetToken(hashedToken) {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires').exec();
  },

  async findByVerificationToken(hashedToken) {
    return User.findOne({
      emailVerificationToken: hashedToken,
    }).select('+emailVerificationToken').exec();
  },

  async create(data) {
    return User.create(data);
  },

  async updateById(id, updates, options = {}) {
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      ...options,
    }).exec();
  },

  async countByRole(role) {
    return User.countDocuments({ role, isActive: true }).exec();
  },

  async listAll({ page = 1, limit = 20, role, isActive } = {}) {
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  },
};

module.exports = userRepository;
