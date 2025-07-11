// api/scripts/import.js
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { importFromJSON } from '../utils/importData.js';

dotenv.config();

// Helper function to convert the complex content array to a string
// and extract the primary language used in code blocks
const processContent = (contentArray) => {
  if (!contentArray || !Array.isArray(contentArray)) return { content: '', primaryLanguage: '' };
  
  // Track languages used in code blocks
  const languageCounts = {};
  
  const content = contentArray.map(item => {
    if (item.type === 'text') {
      return `<p>${item.text.replace(/\n/g, '<br><br>')}</p>`;
    } else if (item.type === 'code') {
      // Count language occurrences
      if (item.language) {
        languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
      }
      
      // Create properly formatted code blocks with language class
      return `<pre><code class="language-${item.language || ''}">${
        // Escape HTML entities to prevent rendering issues
        item.code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      }</code></pre>${item.description ? `<p><em>${item.description}</em></p>` : ''}`;
    }
    return '';
  }).join('\n\n');
  
  // Determine the primary language (most frequently used)
  let primaryLanguage = '';
  if (Object.keys(languageCounts).length > 0) {
    // Sort languages by frequency (highest first)
    const sortedLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1]);
    
    primaryLanguage = sortedLanguages[0][0];
    console.log(`Detected primary language for content: ${primaryLanguage}`);
  }
  
  return { content, primaryLanguage };
};

const importData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO + '/test');
    console.log('Connected to MongoDB');

    // Read your JSON data file
    const dataPath = path.join(process.cwd(), 'data', 'zk-bugs.json');
    console.log(`Reading data from: ${dataPath}`);
    
    // Check if file exists
    try {
      await fs.access(dataPath);
    } catch (error) {
      console.error(`Error: File not found at ${dataPath}`);
      console.log('Please create a "data" folder in your project root and add your zk-bugs.json file there.');
      return;
    }
    
    // Read and parse the JSON data
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    console.log(`Successfully loaded JSON with ${jsonData.length} items`);

    // Process content field from array to markdown string and extract language
    const processedData = jsonData.map(item => {
      const { content, primaryLanguage } = processContent(item.content);
      
      return {
        ...item,
        content,
        // Use the language from the code blocks if not explicitly provided
        // Changed from 'language' to 'codeLanguage'
        codeLanguage: primaryLanguage || ''
      };
    });
    
    console.log(`Processed ${processedData.length} items for import`);

    // Your admin user ID - from environment variable
    const adminUserId = process.env.ADMIN_USER_ID; 
    console.log(`Using admin user ID: ${adminUserId}`);

    // Import the processed data
    const result = await importFromJSON(processedData, adminUserId);

    // Log results
    console.log(`Import completed: ${result.imported} items imported successfully`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`Errors encountered (${result.errors.length} items):`);
      result.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.title}: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the import
console.log('Starting import process...');
importData().then(() => {
  console.log('Import script completed');
});