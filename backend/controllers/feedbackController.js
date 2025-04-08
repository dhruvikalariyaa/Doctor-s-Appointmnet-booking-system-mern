import Feedback from '../models/feedbackModel.js';

export const createFeedback = async (req, res) => {
    try {
      const { text } = req.body; // Change 'feedback' to 'text' if your input field is named 'text'
      const newFeedback = new Feedback({ text }); // Make sure the model expects 'text'
      await newFeedback.save();
      res.status(201).json({ success: true, message: 'Feedback saved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to save feedback' });
    }
  };
  

export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve feedback' });
  }
};
