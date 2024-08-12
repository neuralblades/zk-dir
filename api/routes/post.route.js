import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost, bookmarkPost, unbookmarkPost, getBookmarkedPosts, } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create)
router.get('/getposts', getposts)
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost)
router.put('/updatepost/:postId/:userId', verifyToken, updatepost)
router.post('/:postId/bookmark', verifyToken, bookmarkPost);
router.post('/:postId/unbookmark', verifyToken, unbookmarkPost);
router.get('/bookmarked', verifyToken, getBookmarkedPosts);


export default router;