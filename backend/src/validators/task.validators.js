const Joi = require("joi");

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  description: Joi.string().allow("").max(2000).optional(),
  status: Joi.string().valid("Pending", "In Progress", "Completed").optional(),
  dueDate: Joi.date().iso().required()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(120).optional(),
  description: Joi.string().allow("").max(2000).optional(),
  status: Joi.string().valid("Pending", "In Progress", "Completed").optional(),
  dueDate: Joi.date().iso().optional()
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };
