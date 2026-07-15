'use strict';

const Report = require('../models/Report');

const reportRepository = {
  async findById(id, populateAnalysis = false) {
    const query = Report.findById(id);
    if (populateAnalysis) {
      query.populate({
        path: 'analysisId',
        select: 'primaryDiagnosis overallConfidence findings model imageUrl imageName patientId studyId processingTime technicalQuality projectionType differentialDiagnoses modality urgencyLevel createdAt',
      });
    }
    return query.exec();
  },

  async create(data) {
    return Report.create(data);
  },

  async updateById(id, updates) {
    return Report.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async deleteById(id) {
    return Report.findByIdAndDelete(id).exec();
  },

  async incrementViewCount(id) {
    return Report.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
  },

  async incrementDownloadCount(id) {
    return Report.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }).exec();
  },

  async list({ userId, page = 1, limit = 10, search, criticalOnly, sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (criticalOnly) filter.criticalFindings = true;
    if (search) {
      filter.$or = [
        { reportNumber: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'analysisId',
          select: 'primaryDiagnosis overallConfidence imageUrl imageName patientId studyId model modality createdAt',
        })
        .exec(),
      Report.countDocuments(filter).exec(),
    ]);

    return { reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};

module.exports = reportRepository;
