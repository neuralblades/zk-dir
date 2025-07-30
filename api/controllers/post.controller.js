import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }

  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }

  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');

  // Validate severity is within enum values
  const validSeverities = ['N/A', 'informational', 'low', 'medium', 'high', 'critical'];
  const severity = req.body.severity && validSeverities.includes(req.body.severity.toLowerCase()) 
    ? req.body.severity.toLowerCase() 
    : 'N/A';

  // Validate difficulty is within enum values
  const validDifficulties = ['N/A', 'low', 'medium', 'high'];
  const difficulty = req.body.difficulty && validDifficulties.includes(req.body.difficulty.toLowerCase())
    ? req.body.difficulty.toLowerCase()
    : 'N/A';

  // Ensure protocol type is valid
  const validTypes = ['ZKEVM', 'ZKTRIE', 'L2GETH', 'OTHER'];
  const protocolType = req.body.protocol?.type && validTypes.includes(req.body.protocol.type)
    ? req.body.protocol.type
    : 'OTHER';

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
    // Initialize fields with defaults if not provided
    image: req.body.image || 'https://i.postimg.cc/rsrr3rH1/zk-logo.png',
    publishDate: req.body.publishDate || new Date(),
    reportSource: {
      name: req.body.reportSource?.name || '',
      url: req.body.reportSource?.url || ''
    },
    auditFirm: req.body.auditFirm || 'Independent Researcher',
    protocol: {
      name: req.body.protocol?.name || '',
      type: protocolType
    },
    tags: req.body.tags || [],
    frameworks: req.body.frameworks || [],
    reported_by: req.body.reported_by || [],
    scope: req.body.scope || [],
    severity: severity,
    difficulty: difficulty
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const page = parseInt(req.query.page) || 1;
    
    // Calculate skip based on page if provided, otherwise use startIndex
    const skip = req.query.page ? (page - 1) * limit : startIndex;
    
    const sortDirection = req.query.order === 'asc' ? 1 : -1;

    // Enhanced query builder with ZK-specific filters
    const query = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.auditFirm && { auditFirm: req.query.auditFirm }),
      ...(req.query.reportSource && { 'reportSource.name': req.query.reportSource }),
      ...(req.query.protocol && { 'protocol.name': req.query.protocol }),
      ...(req.query.protocolType && { 'protocol.type': req.query.protocolType }),
      ...(req.query.severity && { severity: req.query.severity.toLowerCase() }),
      ...(req.query.difficulty && { difficulty: req.query.difficulty.toLowerCase() }),
      ...(req.query.tags && { tags: { $in: req.query.tags.split(',') } }),
      ...(req.query.frameworks && { frameworks: { $in: req.query.frameworks.split(',') } }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
          { auditFirm: { $regex: req.query.searchTerm, $options: 'i' } },
          { 'reportSource.name': { $regex: req.query.searchTerm, $options: 'i' } },
          { impact: { $regex: req.query.searchTerm, $options: 'i' } },
          { recommendation: { $regex: req.query.searchTerm, $options: 'i' } },
          { 'scope.name': { $regex: req.query.searchTerm, $options: 'i' } }
        ],
      }),
    };

    // Handle different sort options
    let sortOptions = { updatedAt: sortDirection };
    
    if (req.query.sort === 'severity') {
      sortOptions = { severity: -1, updatedAt: -1 };
    } else if (req.query.sort === 'difficulty') {
      sortOptions = { difficulty: -1, updatedAt: -1 };
    } else if (req.query.sort === 'desc') {
      sortOptions = { createdAt: -1 };
    } else if (req.query.sort === 'asc') {
      sortOptions = { createdAt: 1 };
    }

    const posts = await Post.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      ...query,
      publishDate: { $gte: oneMonthAgo }
    });

    // Get unique protocols and severities for filters
    const protocols = await Post.distinct('protocol.name', query);
    const severities = await Post.distinct('severity', query);

    // Add aggregated stats for ZK bugs
    const stats = await Post.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCritical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          totalHigh: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
          totalMedium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
          totalLow: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
          totalInformational: { $sum: { $cond: [{ $eq: ['$severity', 'informational'] }, 1, 0] } },
          totalNA: { $sum: { $cond: [{ $eq: ['$severity', 'N/A'] }, 1, 0] } },
          protocolCount: { $addToSet: '$protocol.name' },
        }
      }
    ]);
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      stats: {
        protocols: protocols.filter(p => p),
        severities: severities.filter(s => s),
        ...(stats[0] || {
          totalCritical: 0,
          totalHigh: 0,
          totalMedium: 0,
          totalLow: 0,
          totalInformational: 0,
          totalNA: 0,
          protocolCount: []
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    const titleSuggestions = await Post.find({
      title: { $regex: q, $options: 'i' }
    })
    .select('title')
    .limit(3);

    const protocolSuggestions = await Post.distinct('protocol.name', {
      'protocol.name': { $regex: q, $options: 'i' }
    });

    const severitySuggestions = ['critical', 'high', 'medium', 'low', 'informational'].filter(
      severity => severity.toLowerCase().includes(q.toLowerCase())
    );

    const suggestions = [
      ...titleSuggestions.map(p => p.title),
      ...protocolSuggestions.slice(0, 2),
      ...severitySuggestions.slice(0, 2)
    ]
    .filter(Boolean)
    .slice(0, 8);

    res.status(200).json({ suggestions });

  } catch (error) {
    next(error);
  }
};

// Add an endpoint to get available codeLanguages
export const getLanguages = async (req, res, next) => {
  try {
    // Find all unique codeLanguages
    const languages = await Post.distinct('codeLanguage');
    
    // Filter out empty values and sort
    const validLanguages = languages
      .filter(lang => lang && lang.trim())
      .sort();
    
    res.status(200).json({
      languages: validLanguages
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeletePosts = async (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to delete these posts'));
  }

  // Validate request body
  if (!req.body.postIds || !Array.isArray(req.body.postIds) || req.body.postIds.length === 0) {
    return next(errorHandler(400, 'Please provide an array of post IDs to delete'));
  }

  try {
    // Find posts to verify user owns them (if required)
    if (req.query.verifyOwnership === 'true') {
      const posts = await Post.find({
        _id: { $in: req.body.postIds }
      });
      
      // Check if all posts belong to the user
      const unauthorizedPosts = posts.filter(post => post.userId !== req.user.id);
      if (unauthorizedPosts.length > 0) {
        return next(errorHandler(403, 'You are not allowed to delete some of these posts'));
      }
    }

    // Delete all posts in the array
    const result = await Post.deleteMany({
      _id: { $in: req.body.postIds }
    });

    // Return appropriate response
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No posts found to delete' });
    }

    res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} posts`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }

  try {
    // Validate severity is within enum values
    const validSeverities = ['N/A', 'informational', 'low', 'medium', 'high', 'critical'];
    const severity = req.body.severity && validSeverities.includes(req.body.severity.toLowerCase()) 
      ? req.body.severity.toLowerCase() 
      : 'N/A';

    // Validate difficulty is within enum values
    const validDifficulties = ['N/A', 'low', 'medium', 'high'];
    const difficulty = req.body.difficulty && validDifficulties.includes(req.body.difficulty.toLowerCase())
      ? req.body.difficulty.toLowerCase()
      : 'N/A';

    // Ensure protocol type is valid
    const validTypes = ['ZKEVM', 'ZKTRIE', 'L2GETH', 'OTHER'];
    const protocolType = req.body.protocol?.type && validTypes.includes(req.body.protocol.type)
      ? req.body.protocol.type
      : 'OTHER';

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          image: req.body.image || 'https://i.postimg.cc/rsrr3rH1/zk-logo.png',
          // Add ZK-specific field updates with validation
          publishDate: req.body.publishDate || new Date(),
          reportSource: {
            name: req.body.reportSource?.name || '',
            url: req.body.reportSource?.url || ''
          },
          auditFirm: req.body.auditFirm || 'Independent Researcher',
          protocol: {
            name: req.body.protocol?.name || '',
            type: protocolType
          },
          tags: req.body.tags || [],
          frameworks: req.body.frameworks || [],
          reported_by: req.body.reported_by || [],
          scope: req.body.scope || [],
          severity: severity,
          difficulty: difficulty,
          finding_id: req.body.finding_id || '',
          target_file: req.body.target_file || '',
          impact: req.body.impact || '',
          recommendation: req.body.recommendation || ''
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const getPostsByProtocol = async (req, res, next) => {
  try {
    const { protocolName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      'protocol.name': { $regex: new RegExp(protocolName, 'i') }
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      'protocol.name': { $regex: new RegExp(protocolName, 'i') }
    });

    res.status(200).json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getPostStats = async (req, res, next) => {
  try {
    const stats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          severityCounts: {
            $push: '$severity'
          },
          protocolStats: {
            $push: {
              protocol: '$protocol.name',
              type: '$protocol.type'
            }
          },
          tagsStats: {
            $push: '$tags'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalPosts: 1,
          protocols: {
            $setUnion: '$protocolStats.protocol'
          },
          protocolTypes: {
            $setUnion: '$protocolStats.type'
          },
          // Count each severity level
          severityCounts: {
            critical: { 
              $size: { 
                $filter: { 
                  input: '$severityCounts', 
                  as: 'severity', 
                  cond: { $eq: ['$$severity', 'critical'] } 
                } 
              } 
            },
            high: { 
              $size: { 
                $filter: { 
                  input: '$severityCounts', 
                  as: 'severity', 
                  cond: { $eq: ['$$severity', 'high'] } 
                } 
              } 
            },
            medium: { 
              $size: { 
                $filter: { 
                  input: '$severityCounts', 
                  as: 'severity', 
                  cond: { $eq: ['$$severity', 'medium'] } 
                } 
              } 
            },
            low: { 
              $size: { 
                $filter: { 
                  input: '$severityCounts', 
                  as: 'severity', 
                  cond: { $eq: ['$$severity', 'low'] } 
                } 
              } 
            },
            informational: { 
              $size: { 
                $filter: { 
                  input: '$severityCounts', 
                  as: 'severity', 
                  cond: { $eq: ['$$severity', 'informational'] } 
                } 
              } 
            },
            na: { 
              $size: { 
                $filter: { 
                  input: '$severityCounts', 
                  as: 'severity', 
                  cond: { $eq: ['$$severity', 'n/a'] } 
                } 
              } 
            }
          },
          severities: {
            $setUnion: '$severityCounts'
          },
          tags: {
            $setUnion: {
              $reduce: {
                input: '$tagsStats',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json(stats[0] || {
      totalPosts: 0,
      protocols: [],
      protocolTypes: [],
      severityCounts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 0,
        na: 0
      },
      severities: [],
      tags: []
    });
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Find related posts (same protocol or similar tags)
    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      $or: [
        { 'protocol.name': post.protocol.name },
        { tags: { $in: post.tags } }
      ]
    })
      .select('title slug createdAt severity')
      .limit(3);

    res.status(200).json({
      post,
      relatedPosts
    });
  } catch (error) {
    next(error);
  }
};