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

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
    // Initialize ZK-specific fields with defaults if not provided
    publishDate: req.body.publishDate || new Date(),
    reportSource: {
      name: req.body.reportSource?.name || '',
      url: req.body.reportSource?.url || ''
    },
    auditFirm: req.body.auditFirm || 'Independent Researcher',
    protocol: req.body.protocol || { name: '', type: 'OTHER' },
    tags: req.body.tags || [],
    frameworks: req.body.frameworks || [],
    reported_by: req.body.reported_by || [],
    scope: req.body.scope || [],
    severity: req.body.severity || 'medium',
    difficulty: req.body.difficulty || 'medium',
    date: req.body.date || new Date()
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
    const sortDirection = req.query.order === 'asc' ? 1 : -1;

    // Enhanced query builder with ZK-specific filters
    const query = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.auditFirm && { auditFirm: req.query.auditFirm }),
      ...(req.query.reportSource && { 'reportSource.name': req.query.reportSource }),
      ...(req.query.protocol && { 'protocol.name': req.query.protocol }),
      ...(req.query.protocolType && { 'protocol.type': req.query.protocolType }),
      ...(req.query.severity && { severity: req.query.severity }),
      ...(req.query.difficulty && { difficulty: req.query.difficulty }),
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

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.publishDate = {};
      if (req.query.startDate) {
        query.publishDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.publishDate.$lte = new Date(req.query.endDate);
      }
    }

    const posts = await Post.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
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

    // Add aggregated stats for ZK bugs
    const stats = await Post.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalHigh: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
          totalMedium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
          totalLow: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
          protocolCount: { $addToSet: '$protocol.name' },
        }
      }
    ]);

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
      stats: stats[0] || {
        totalHigh: 0,
        totalMedium: 0,
        totalLow: 0,
        protocolCount: []
      }
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
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          // Add ZK-specific field updates
          publishDate: req.body.publishDate,
          reportSource: {
            name: req.body.reportSource?.name || '',
            url: req.body.reportSource?.url || ''
          },
          auditFirm: req.body.auditFirm,
          protocol: req.body.protocol,
          tags: req.body.tags,
          frameworks: req.body.frameworks,
          reported_by: req.body.reported_by,
          scope: req.body.scope,
          severity: req.body.severity,
          difficulty: req.body.difficulty,
          finding_id: req.body.finding_id,
          target_file: req.body.target_file,
          impact: req.body.impact,
          recommendation: req.body.recommendation
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

export const getPostsByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      category: { $regex: new RegExp(categoryName, 'i') }
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({
      category: { $regex: new RegExp(categoryName, 'i') }
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
          protocolStats: {
            $push: {
              protocol: '$protocol.name',
              type: '$protocol.type'
            }
          },
          severityStats: {
            $push: '$severity'
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
          severities: {
            $setUnion: '$severityStats'
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