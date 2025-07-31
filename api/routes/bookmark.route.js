import express from 'express';
import { verifyToken, optionalVerifyToken } from '../utils/verifyUser.js';
import {
  addBookmark,
  removeBookmark,
  getBookmarkedPosts,
  checkBookmarkStatus
} from '../controllers/bookmark.controller.js';

const router = express.Router();

// These routes require authentication
router.post('/add', verifyToken, addBookmark);
router.delete('/remove/:postId', verifyToken, removeBookmark);
router.get('/posts', verifyToken, getBookmarkedPosts);

// This route works for both logged in and guest users
router.get('/status/:postId', optionalVerifyToken, checkBookmarkStatus);

export default router;