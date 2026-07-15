'use strict';

const userRepository = require('../repositories/userRepository');
const analysisRepository = require('../repositories/analysisRepository');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ── GET /api/admin/users ───────────────────────────────────────────────────
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, isActive } = req.query;
  const result = await userRepository.listAll({
    page: parseInt(page || 1, 10),
    limit: parseInt(limit || 20, 10),
    role,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  });

  res.json({
    success: true,
    data: result.users,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    }
  });
});

// ── PUT /api/admin/users/:id/status ────────────────────────────────────────
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (isActive === undefined) {
    throw AppError.badRequest('isActive field is required.');
  }

  // Prevent admin from deactivating self
  if (req.user._id.toString() === req.params.id) {
    throw AppError.badRequest('You cannot deactivate your own account.');
  }

  const user = await userRepository.updateById(req.params.id, { isActive });
  if (!user) {
    throw AppError.notFound('User not found.');
  }

  res.json({
    success: true,
    message: `User status updated to ${isActive ? 'active' : 'inactive'}.`,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// ── PUT /api/admin/users/:id/role ──────────────────────────────────────────
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) {
    throw AppError.badRequest('role field is required.');
  }

  const { ALL_ROLES } = require('../constants/roles');
  if (!ALL_ROLES.includes(role)) {
    throw AppError.badRequest(`Invalid role. Supported: ${ALL_ROLES.join(', ')}`);
  }

  // Prevent admin from changing self role
  if (req.user._id.toString() === req.params.id) {
    throw AppError.badRequest('You cannot change your own role.');
  }

  const user = await userRepository.updateById(req.params.id, { role });
  if (!user) {
    throw AppError.notFound('User not found.');
  }

  res.json({
    success: true,
    message: `User role updated to ${role}.`,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// ── GET /api/admin/analyses ────────────────────────────────────────────────
const listAllAnalyses = asyncHandler(async (req, res) => {
  // Lists all analyses across all users
  const { page, limit, search, status, modality } = req.query;
  const result = await analysisRepository.list({
    page: parseInt(page || 1, 10),
    limit: parseInt(limit || 20, 10),
    search,
    status,
    modality,
  });

  res.json({
    success: true,
    data: result.analyses,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    }
  });
});

// ── GET /api/admin/audit-logs ──────────────────────────────────────────────
const listAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, userId } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (userId) filter.userId = userId;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('userId', 'name email role')
      .exec(),
    AuditLog.countDocuments(filter).exec(),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    }
  });
});

module.exports = {
  listUsers,
  updateUserStatus,
  updateUserRole,
  listAllAnalyses,
  listAuditLogs,
};
