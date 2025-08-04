const Joi = require('joi')
const { validationResult } = require('express-validator')

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      })
    }
    next()
  }
}

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
      code: 'VALIDATION_ERROR',
      details: errors.array()
    })
  }
  next()
}

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(4).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    username: Joi.string().alphanum().min(3).max(30)
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(4).required()
  }),

  message: Joi.object({
    content: Joi.string().min(1).max(2000).required()
  }),

  dealTerms: Joi.object({
    terms: Joi.object().required(),
    dealReached: Joi.boolean().required()
  }),

  exportRequest: Joi.object({
    format: Joi.string().valid('json', 'txt', 'summary').default('json'),
    include_assessment: Joi.boolean().default(true),
    include_timestamps: Joi.boolean().default(true),
    include_metadata: Joi.boolean().default(false)
  })
}

// Additional validation middleware for progress and conversation routes
const validateProgressQuery = (req, res, next) => {
  const { timeframe, skillDimension } = req.query;
  
  // Validate timeframe format (e.g., 7d, 30d, 90d, 1y)
  if (timeframe && !/^\d+[dwmy]$/.test(timeframe)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid timeframe format. Use format like 7d, 30d, 90d, 1y',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate skill dimension
  const validSkills = ['claiming_value', 'creating_value', 'relationship', 'overall', 'all'];
  if (skillDimension && !validSkills.includes(skillDimension)) {
    return res.status(400).json({
      success: false,
      error: `Invalid skill dimension. Must be one of: ${validSkills.join(', ')}`,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Check user permission - users can only access their own data unless admin
  const { userId } = req.params;
  if (userId !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only view your own progress.',
      code: 'ACCESS_DENIED'
    });
  }
  
  next();
};

const validateAchievementParams = (req, res, next) => {
  const { achievementId } = req.params;
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(achievementId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid achievement ID format',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validateConversationQuery = (req, res, next) => {
  const { 
    page, limit, sortBy, sortOrder, dealReached,
    dateFrom, dateTo 
  } = req.query;
  
  // Validate pagination
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate sort parameters
  const validSortFields = [
    'conversation_date', 'duration', 'overall_score', 
    'scenario_name', 'character_name'
  ];
  if (sortBy && !validSortFields.includes(sortBy)) {
    return res.status(400).json({
      success: false,
      error: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`,
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Sort order must be asc or desc',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate deal reached filter
  if (dealReached && !['true', 'false', 'all'].includes(dealReached)) {
    return res.status(400).json({
      success: false,
      error: 'dealReached must be true, false, or all',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate date filters
  if (dateFrom && isNaN(Date.parse(dateFrom))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid dateFrom format. Use ISO date string.',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (dateTo && isNaN(Date.parse(dateTo))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid dateTo format. Use ISO date string.',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate date range
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    return res.status(400).json({
      success: false,
      error: 'dateFrom must be before or equal to dateTo',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validateConversationId = (req, res, next) => {
  const { id } = req.params;
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid conversation ID format',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validateExportRequest = (req, res, next) => {
  const { error } = schemas.exportRequest.validate(req.body, { allowUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

module.exports = {
  validate,
  handleValidationErrors,
  schemas,
  validateProgressQuery,
  validateAchievementParams,
  validateConversationQuery,
  validateConversationId,
  validateExportRequest
}
