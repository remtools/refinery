import Joi from 'joi';

export const epicSchema = Joi.object({
  key: Joi.string().required().pattern(/^[A-Z0-9-]+$/),
  title: Joi.string().required().min(1).max(200),
  description: Joi.string().required().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked').default('Draft'),
  created_by: Joi.string().required()
});

export const updateEpicSchema = epicSchema.keys({
  updated_by: Joi.string().required()
});

export const storySchema = Joi.object({
  epic_id: Joi.string().uuid().required(),
  actor: Joi.string().required().min(1).max(100),
  action: Joi.string().required().min(1),
  outcome: Joi.string().required().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked').default('Draft'),
  created_by: Joi.string().required()
});

export const updateStorySchema = storySchema.keys({
  updated_by: Joi.string().required()
});

export const acceptanceCriterionSchema = Joi.object({
  story_id: Joi.string().uuid().required(),
  given: Joi.string().required().min(1),
  when: Joi.string().required().min(1),
  then: Joi.string().required().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked').default('Draft'),
  valid: Joi.boolean().default(true),
  risk: Joi.string().valid('Low', 'Medium', 'High').required(),
  comments: Joi.string().allow('').default(''),
  created_by: Joi.string().required()
});

export const updateAcceptanceCriterionSchema = acceptanceCriterionSchema.keys({
  updated_by: Joi.string().required()
});

export const testCaseSchema = Joi.object({
  acceptance_criterion_id: Joi.string().uuid().required(),
  preconditions: Joi.string().required().min(1),
  steps: Joi.string().required().min(1),
  expected_result: Joi.string().required().min(1),
  priority: Joi.string().valid('Low', 'Medium', 'High').required(),
  test_status: Joi.string().valid('Not Run', 'Pass', 'Fail', 'Blocked').default('Not Run'),
  created_by: Joi.string().required()
});

export const updateTestCaseSchema = testCaseSchema.keys({
  updated_by: Joi.string().required()
});