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
      default: 'https://i.postimg.cc/rsrr3rH1/zk-logo.png',
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

    codeLanguage: {
      type: String,
      default: ''
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
      enum: ['N/A', 'informational', 'low', 'medium', 'high', 'critical'],
      default: 'N/A'
    },
    difficulty: {
      type: String,
      enum: ['N/A', 'low', 'medium', 'high'],
      default: 'N/A'
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