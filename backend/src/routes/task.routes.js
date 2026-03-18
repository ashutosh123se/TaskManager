const express = require('express');
const { z } = require('zod');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

const getTasksSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    search: z.string().optional(),
  }),
});

const taskIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID format'),
  }),
});

router.route('/')
  .post(protect, validate(createTaskSchema), createTask)
  .get(protect, validate(getTasksSchema), getTasks);

router.route('/:id')
  .put(protect, validate(updateTaskSchema), updateTask)
  .delete(protect, validate(taskIdSchema), deleteTask);

module.exports = router;
