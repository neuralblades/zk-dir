import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,  // Changed from array to string to handle ReactQuill HTML content
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: 'https://www.commoninja.com/_next/image?url=https%3A%2F%2Fwebsite-assets.commoninja.com%2Fdistribution%2F1723095127473_Cover_for_infographic_article_email_marketing_stats.png&w=1200&q=75',
    },
    category: {
      type: String,
      default: 'uncategorized',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    // New Fields
    publishDate: {
      type: Date,
      required: true,
    },
    reportSource: {
      name: String,
      url: String
    },
    auditFirm: {
      type: String,
      default: 'Independent Researcher'
    },
    // ZK Bug specific fields
    protocol: {
      name: String,
      type: {
        type: String,
        enum: ['ZKEVM', 'ZK-ROLLUP', 'OTHER'],
        default: 'OTHER'
      }
    },
    source: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    difficulty: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    tags: [String],
    frameworks: [String],
    reported_by: [String],
    scope: [{
      name: String,
      repository: String,
      commit_hash: String,
      description: String
    }],
    finding_id: String,
    target_file: String,
    impact: String,
    recommendation: String
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;