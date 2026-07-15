'use strict';

const Analysis = require('../models/Analysis');

const analysisRepository = {
  async findById(id, populateReport = false) {
    const query = Analysis.findById(id);
    if (populateReport) query.populate('reportId');
    return query.exec();
  },

  async findByIdAndUser(id, userId) {
    return Analysis.findOne({ _id: id, userId }).populate('reportId').exec();
  },

  async create(data) {
    return Analysis.create(data);
  },

  async updateById(id, updates) {
    return Analysis.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async softDelete(id, userId) {
    return Analysis.findOneAndUpdate(
      { _id: id, userId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();
  },

  async list({ userId, page = 1, limit = 10, search, status, diagnosis, modality, urgencyLevel, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (modality) filter.modality = modality;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
    if (diagnosis) filter.primaryDiagnosis = new RegExp(diagnosis, 'i');
    if (search) {
      filter.$or = [
        { primaryDiagnosis: new RegExp(search, 'i') },
        { patientId: new RegExp(search, 'i') },
        { studyId: new RegExp(search, 'i') },
        { imageName: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [analyses, total] = await Promise.all([
      Analysis.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('reportId', 'reportNumber criticalFindings urgencyLevel')
        .exec(),
      Analysis.countDocuments(filter).exec(),
    ]);

    return {
      analyses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getStats(userId) {
    const baseFilter = userId ? { userId } : {};

    const [total, thisWeek, byDiagnosis, byModality, criticalCount] = await Promise.all([
      Analysis.countDocuments(baseFilter).exec(),

      Analysis.countDocuments({
        ...baseFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).exec(),

      Analysis.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$primaryDiagnosis', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Analysis.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$modality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Analysis.countDocuments({
        ...baseFilter,
        urgencyLevel: { $in: ['urgent', 'critical'] },
      }).exec(),
    ]);

    return { total, thisWeek, byDiagnosis, byModality, criticalCount };
  },
};

module.exports = analysisRepository;
