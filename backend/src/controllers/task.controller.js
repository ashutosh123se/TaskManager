const prisma = require('../models/prisma');
const { encrypt, decrypt } = require('../utils/encryption');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const encryptedDescription = description ? encrypt(description) : null;

    const task = await prisma.task.create({
      data: {
        title,
        description: encryptedDescription,
        status: status || 'PENDING',
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...task,
        description: task.description ? decrypt(task.description) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for logged in user (with pagination, filter, search)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    // Decrypt descriptions before sending
    const formattedTasks = tasks.map(task => ({
      ...task,
      description: task.description ? decrypt(task.description) : null,
    }));

    res.status(200).json({
      success: true,
      count: formattedTasks.length,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      data: formattedTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }

    if (task.userId !== req.user.id) {
      const error = new Error('User not authorized to update this task');
      error.statusCode = 403;
      return next(error);
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (status) dataToUpdate.status = status;
    if (description !== undefined) {
      dataToUpdate.description = description ? encrypt(description) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      data: {
        ...updatedTask,
        description: updatedTask.description ? decrypt(updatedTask.description) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }

    if (task.userId !== req.user.id) {
      const error = new Error('User not authorized to delete this task');
      error.statusCode = 403;
      return next(error);
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Task removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
