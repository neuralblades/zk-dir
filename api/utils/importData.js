// api/utils/importData.js
import mongoose from 'mongoose';
import Post from '../models/post.model.js';
import fs from 'fs/promises';
import path from 'path';

// Function to generate a URL-friendly slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Function to import data from JSON
const importFromJSON = async (jsonData, userId) => {
  try {
    const importedData = [];
    const errors = [];

    for (const item of jsonData) {
      try {
        // Validate and normalize severity - case sensitive matching for enum values
        let severity = (item.severity?.toLowerCase() || 'n/a');
        // Map to the correct case as defined in your schema
        if (severity === 'n/a') severity = 'N/A';
        if (severity === 'informational') severity = 'informational';
        if (severity === 'low') severity = 'low';
        if (severity === 'medium') severity = 'medium';
        if (severity === 'high') severity = 'high';
        if (severity === 'critical') severity = 'critical';
        
        // Validate and normalize difficulty - case sensitive matching for enum values
        let difficulty = (item.difficulty?.toLowerCase() || 'n/a');
        // Map to the correct case as defined in your schema
        if (difficulty === 'n/a') difficulty = 'N/A';
        if (difficulty === 'low') difficulty = 'low';
        if (difficulty === 'medium') difficulty = 'medium';
        if (difficulty === 'high') difficulty = 'high';

        // Process content (if it's an array of objects)
        let contentString = item.content;
        if (Array.isArray(item.content)) {
          contentString = processContent(item.content);
        }

        // Create the post object with required fields
        const postData = {
          userId: userId, // Admin user ID
          title: item.title,
          content: contentString, 
          slug: generateSlug(item.title),
          protocol: {
            name: item.protocol?.name || item.protocol || '',
            type: (item.protocol?.type || item.protocol_type || 'OTHER').toUpperCase()
          },
          source: item.source || '',
          severity: severity,
          difficulty: difficulty,
          tags: item.tags || [],
          frameworks: item.frameworks || [],
          reported_by: item.reported_by || [],
          codeLanguage: item.codeLanguage || '',
          
          // Format scope field according to the schema
          scope: Array.isArray(item.scope) 
            ? item.scope.map(s => ({
                name: s.name || '',
                repository: s.repository || '',
                commit_hash: s.commit_hash || '',
                description: s.description || ''
              })) 
            : [],
          
          finding_id: item.finding_id || '',
          target_file: item.target_file || '',
          impact: item.impact || '',
          recommendation: item.recommendation || '',
          
          // Convert publishDate string to Date object
          publishDate: new Date(item.publishDate || item.date || new Date()),
          
          // Add reportSource if available
          reportSource: item.reportSource || {
            name: item.source || item.auditFirm || 'Independent Researcher',
            url: item.report_url || ''
          },
          
          // Add auditFirm if available
          auditFirm: item.auditFirm || item.source || 'Independent Researcher'
        };

        // Save to database
        const post = new Post(postData);
        await post.save();
        importedData.push(post);

      } catch (error) {
        console.error(`Error importing "${item.title}":`, error);
        errors.push({
          title: item.title,
          error: error.message
        });
      }
    }

    return {
      success: true,
      imported: importedData.length,
      errors: errors,
      data: importedData
    };

  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
// Import route handler
export const handleImport = async (req, res) => {
  try {
    const { data, userId } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Expected array of posts.'
      });
    }

    const result = await importFromJSON(data, userId);
    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk delete function (useful for cleanup)
export const handleBulkDelete = async (req, res) => {
  try {
    const { userId } = req.body;
    const result = await Post.deleteMany({ userId });
    
    res.json({
      success: true,
      deleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export the importFromJSON function
export { importFromJSON };