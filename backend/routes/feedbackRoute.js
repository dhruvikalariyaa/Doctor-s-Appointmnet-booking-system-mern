import express from 'express';
import { createFeedback, getFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback); // Route for creating feedback
router.get('/', getFeedback); // Route for fetching feedback

export default router;
