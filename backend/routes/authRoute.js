import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';

const authRoute = express.Router();

authRoute.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await userModel.findOne({ email });
      if (!user) {
          console.log('User does not exist');
          return res.status(400).json({ success: false, message: 'User does not exist' });
      }

      const secret = process.env.JWT_SECRET + user.password;
      const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '1h' });

      const resetUrl = `http://localhost:5173/reset-password/${user._id}/${token}`;

      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Password Reset Request',
          text: `Please click on the following link to reset your password: ${resetUrl}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log('Error sending email:', error);
              return res.status(500).json({ success: false, message: 'Error sending email' });
          }
          console.log('Password reset email sent:', info.response);
          res.status(200).json({ success: true, message: 'Password reset email sent' });
      });
  } catch (error) {
      console.error('Internal server error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});


authRoute.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        // 🔐 Verify JWT token
        const secret = process.env.JWT_SECRET + user.password;
        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                return res.status(400).json({ success: false, message: 'Invalid or expired token' });
            }

            // 🔒 Hash new password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ success: true, message: 'Password reset successful' });
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
export default authRoute;
