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

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already in use');
  }

  // Check if username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username already taken');
  }

  // Create user
  const user = await User.create({
    fullName,
    username,
    email,
    password, // will be hashed automatically by User model
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
  const { email, password } = req.body;

  // Check all fields are provided
  if (!email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Find user by email
  const user = await User.findOne({ email });

  // Check user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      availability: user.availability,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
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