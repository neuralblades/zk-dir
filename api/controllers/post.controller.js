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
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
    
    const postsWithBookmarkInfo = await Promise.all(posts.map(async (post) => {
      const isBookmarked = req.user ? post.bookmarks.includes(req.user.id) : false;
      return {
        ...post.toObject(),
        isBookmarked,
        bookmarkCount: post.bookmarks.length,
      };
    }));

    res.status(200).json({
      posts: postsWithBookmarkInfo,
      totalPosts,
      lastMonthPosts,
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
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const bookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }
    
    if (post.bookmarks.includes(req.user.id)) {
      return next(errorHandler(400, 'You have already bookmarked this post'));
    }
    
    post.bookmarks.push(req.user.id);
    await post.save();
    
    res.status(200).json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    next(error);
  }
};

export const unbookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }
    
    if (!post.bookmarks.includes(req.user.id)) {
      return next(errorHandler(400, 'You have not bookmarked this post'));
    }
    
    post.bookmarks = post.bookmarks.filter(
      (bookmark) => bookmark.toString() !== req.user.id
    );
    await post.save();
    
    res.status(200).json({ message: 'Post unbookmarked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getBookmarkedPosts = async (req, res, next) => {
  try {
    const bookmarkedPosts = await Post.find({ bookmarks: req.user.id })
      .sort({ updatedAt: -1 });
    
    res.status(200).json(bookmarkedPosts);
  } catch (error) {
    next(error);
  }
};
