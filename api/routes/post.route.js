import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  create, 
  bulkDeletePosts,
  deletepost, 
  getposts, 
  updatepost,
  getPostsByProtocol,
  getPostStats,
  getPostBySlug,
  getLanguages,
  getSearchSuggestions
} from '../controllers/post.controller.js';

const router = express.Router();

// Existing routes
router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.delete('/bulk', verifyToken, bulkDeletePosts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);

// New routes for ZK bug directory
router.get('/languages', getLanguages);
router.get('/by-audit-firm/:firmName', getposts);
router.get('/by-date-range', getposts);
router.get('/protocol/:protocolName', getPostsByProtocol);
router.get('/stats', getPostStats);
router.get('/post/:slug', getPostBySlug);
router.get('/search-suggestions', getSearchSuggestions);

// Export search parameters for frontend validation
router.get('/search-params', (req, res) => {
  res.json({
    protocolTypes: ['ZKEVM', 'ZKTRIE', 'L2GETH', 'OTHER'],
    severityLevels: ['N/A', 'informational', 'low', 'medium', 'high', 'critical'],
    difficultyLevels: ['N/A', 'low', 'medium', 'high'],
  });
});

export default router;