import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  create, 
  deletepost, 
  getposts, 
  updatepost,
  getPostsByProtocol,
  getPostsByCategory,
  getPostStats,
  getPostBySlug
} from '../controllers/post.controller.js';

const router = express.Router();

// Existing routes
router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

// New routes for ZK bug directory
router.get('/by-audit-firm/:firmName', getposts);
router.get('/by-date-range', getposts);
router.get('/protocol/:protocolName', getPostsByProtocol);
router.get('/category/:categoryName', getPostsByCategory);
router.get('/stats', getPostStats);
router.get('/post/:slug', getPostBySlug);

// Export search parameters for frontend validation
router.get('/search-params', (req, res) => {
  res.json({
    protocolTypes: ['ZKEVM', 'ZK-ROLLUP', 'OTHER'],
    severityLevels: ['low', 'medium', 'high', 'critical'],
    difficultyLevels: ['low', 'medium', 'high'],
    categories: ['vulnerabilities', 'bugs', 'optimizations', 'uncategorized'],
  });
});

export default router;