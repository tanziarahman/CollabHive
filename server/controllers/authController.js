import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';


export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Check all fields are provided
  if (!fullName || !username || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Convert to lowercase for consistency
  const lowercaseUsername = username.toLowerCase();
  const lowercaseEmail = email.toLowerCase();

  // Check if email already exists
  const emailExists = await User.findOne({ email: lowercaseEmail });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already in use');
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username: lowercaseUsername });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username already taken');
  }

  // Check password length (additional validation)
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Create user (password will be hashed by schema pre-save middleware)
  const user = await User.create({
    fullName,
    username: lowercaseUsername,
    email: lowercaseEmail,
    password, // No need to hash here, schema will handle it
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


export const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check fields are provided
  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  // Find user by username (convert to lowercase)
  const user = await User.findOne({ username: username.toLowerCase() });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
});


export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});