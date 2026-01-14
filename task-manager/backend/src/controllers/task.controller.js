const Task = require("../models/Task");

function buildQuery(req) {
  const q = {};
  // Week 3 filters/search (optional but easy)
  if (req.query.status) q.status = req.query.status;

  if (req.query.search) {
    const s = req.query.search.trim();
    q.$or = [
      { title: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } }
    ];
  }

  // Optional auth-based scoping
  if (req.user?.id) q.userId = req.user.id;

  return q;
}

exports.createTask = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user?.id) payload.userId = req.user.id;

    const task = await Task.create(payload);
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const q = buildQuery(req);
    const tasks = await Task.find(q).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (e) {
    next(e);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const q = { _id: req.params.id };
    if (req.user?.id) q.userId = req.user.id;

    const task = await Task.findOne(q);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (e) {
    next(e);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const q = { _id: req.params.id };
    if (req.user?.id) q.userId = req.user.id;

    const updated = await Task.findOneAndUpdate(q, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ message: "Task not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const q = { _id: req.params.id };
    if (req.user?.id) q.userId = req.user.id;

    const deleted = await Task.findOneAndDelete(q);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (e) {
    next(e);
  }
};
