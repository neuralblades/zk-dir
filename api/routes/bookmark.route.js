import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  addBookmark,
  removeBookmark,
  getBookmarkedPosts,
  checkBookmarkStatus
} from '../controllers/bookmark.controller.js';

const router = express.Router();

router.post('/add', verifyToken, addBookmark);
router.delete('/remove/:postId', verifyToken, removeBookmark);
router.get('/posts', verifyToken, getBookmarkedPosts);
router.get('/status/:postId', verifyToken, checkBookmarkStatus);

export default router;