import Joi from 'joi';

export const projectSchema = Joi.object({
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().required().min(1),
  status: Joi.string().valid('Active', 'Archived', 'Planned').default('Planned'),
  created_by: Joi.string().required(),
  updated_by: Joi.string().optional()
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  description: Joi.string().min(1),
  status: Joi.string().valid('Active', 'Archived', 'Planned'),
  updated_by: Joi.string().required()
});

export const epicSchema = Joi.object({
  project_id: Joi.string().uuid().allow('').optional(),
  key: Joi.string().pattern(/^[A-Z0-9-]+$/).optional().allow(''),
  title: Joi.string().required().min(1).max(200),
  description: Joi.string().required().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked').default('Draft'),
  created_by: Joi.string().required(),
  updated_by: Joi.string().optional()
});

export const updateEpicSchema = Joi.object({
  project_id: Joi.string().uuid().allow('').optional(),
  key: Joi.string().pattern(/^[A-Z0-9-]+$/),
  title: Joi.string().min(1).max(200),
  description: Joi.string().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked'),
  updated_by: Joi.string().required()
});

export const storySchema = Joi.object({
  epic_id: Joi.string().uuid().required(),
  actor_id: Joi.string().uuid().required(),
  action: Joi.string().required().min(1),
  outcome: Joi.string().required().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked').default('Draft'),
  created_by: Joi.string().required(),
  updated_by: Joi.string().optional()
});

export const updateStorySchema = Joi.object({
  epic_id: Joi.string().uuid(),
  actor_id: Joi.string().uuid(),
  action: Joi.string().min(1),
  outcome: Joi.string().min(1),
  status: Joi.string().valid('Draft', 'Approved', 'Locked'),
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
  created_by: Joi.string().required(),
  updated_by: Joi.string().optional()
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
  created_by: Joi.string().required(),
  updated_by: Joi.string().optional()
});

export const updateTestCaseSchema = testCaseSchema.keys({
  updated_by: Joi.string().required()
});

export const actorSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  name: Joi.string().required().min(1).max(100),
  role: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  created_by: Joi.string().required(),
  updated_by: Joi.string().optional()
});

export const updateActorSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  role: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  updated_by: Joi.string().required()
});