const router = require("express").Router();
const ctrl = require("../controllers/task.controller");
const { validate } = require("../middleware/validate");
const { createTaskSchema, updateTaskSchema } = require("../validators/task.validators");

// Optional auth (Week 3). If you don’t want auth, remove requireAuth usage.
const { requireAuth, optionalAuth } = require("../middleware/auth");

// If auth is optional, tasks work for both modes.
// Use optionalAuth so JWT users get scoped tasks automatically.
router.get("/", optionalAuth, ctrl.getTasks);
router.get("/:id", optionalAuth, ctrl.getTaskById);
router.post("/", optionalAuth, validate(createTaskSchema), ctrl.createTask);
router.put("/:id", optionalAuth, validate(updateTaskSchema), ctrl.updateTask);
router.delete("/:id", optionalAuth, ctrl.deleteTask);

module.exports = router;
