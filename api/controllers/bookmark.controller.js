import Bookmark from '../models/bookmark.model.js';
import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

// Add a bookmark
export const addBookmark = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, 'You must be logged in to bookmark posts'));
    }

    const { postId } = req.body;
    if (!postId) {
      return next(errorHandler(400, 'Post ID is required'));
    }

    // Check if post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      userId: req.user.id,
      postId
    });

    if (existingBookmark) {
      return next(errorHandler(400, 'Post is already bookmarked'));
    }

    // Create new bookmark
    const newBookmark = new Bookmark({
      userId: req.user.id,
      postId
    });

    await newBookmark.save();
    res.status(201).json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    next(error);
  }
};

// Remove a bookmark
export const removeBookmark = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, 'You must be logged in to remove bookmarks'));
    }

    const { postId } = req.params;
    if (!postId) {
      return next(errorHandler(400, 'Post ID is required'));
    }

    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user.id,
      postId
    });

    if (!bookmark) {
      return next(errorHandler(404, 'Bookmark not found'));
    }

    res.status(200).json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Get all bookmarked posts for a user
export const getBookmarkedPosts = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(errorHandler(401, 'You must be logged in to view bookmarks'));
    }

    // Find all bookmarks for the current user
    const bookmarks = await Bookmark.find({ userId: req.user.id });

    if (bookmarks.length === 0) {
      return res.status(200).json([]);
    }

    // Extract post IDs from bookmarks
    const postIds = bookmarks.map(bookmark => bookmark.postId);

    // Fetch the complete post data for all bookmarked posts
    const bookmarkedPosts = await Post.find({ _id: { $in: postIds } });

    res.status(200).json(bookmarkedPosts);
  } catch (error) {
    next(error);
  }
};

// Check if a post is bookmarked by the current user
export const checkBookmarkStatus = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(200).json({ isBookmarked: false });
    }

    const { postId } = req.params;
    if (!postId) {
      return next(errorHandler(400, 'Post ID is required'));
    }

    const bookmark = await Bookmark.findOne({
      userId: req.user.id,
      postId
    });

    res.status(200).json({ isBookmarked: !!bookmark });
  } catch (error) {
    next(error);
  }
};