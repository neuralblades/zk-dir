// migrate.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import { importFromJSON } from './api/utils/importData.js';

// Configure environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Function to parse and modify MongoDB connection string
const getConnectionWithDatabase = async (baseUri) => {
  // Extract parts of the connection string
  let uri = baseUri;
  let dbName = '';
  let queryParams = '';
  
  // Check if URI contains query parameters
  if (uri.includes('?')) {
    queryParams = uri.substring(uri.indexOf('?'));
    uri = uri.substring(0, uri.indexOf('?'));
  }
  
  // Extract existing database name if present
  const dbPathMatch = uri.match(/\/([^/]+)$/);
  if (dbPathMatch) {
    // Remove existing database name from the path
    uri = uri.replace(`/${dbPathMatch[1]}`, '');
    dbName = dbPathMatch[1];
  }
  
  // Ensure URI ends with a slash
  if (!uri.endsWith('/')) {
    uri += '/';
  }
  
  console.log('\nAvailable databases:');
  console.log('1. test (local development)');
  console.log('2. zk-bug (production)');
  
  const choice = await question('Which database do you want to use? (1/2): ');
  
  if (choice === '2') {
    dbName = 'zk-bug';
    console.log('🌐 Selected production database: zk-bug');
  } else {
    dbName = 'test';
    console.log('🧪 Selected local database: test');
  }
  
  // Construct final connection string
  return uri + dbName + queryParams;
};

// Main migration function
async function migrate() {
  try {
    console.log('🚀 Starting migration script');
    
    // Get MongoDB connection string
    let mongoURI = process.env.MONGO;
    if (!mongoURI) {
      mongoURI = await question('Please enter your MongoDB connection string: ');
    }
    
    // Choose database
    mongoURI = await getConnectionWithDatabase(mongoURI);
    
    // Get admin user ID
    let adminUserId = process.env.ADMIN_USER_ID;
    if (!adminUserId) {
      adminUserId = await question('Please enter the admin user ID: ');
    }
    
    // Get data file path
    const defaultPath = './data/data.json';
    const filePath = await question(`Enter the path to your data.json file (or press Enter for default "${defaultPath}"): `);
    const dataFilePath = filePath || defaultPath;
    const resolvedPath = path.resolve(process.cwd(), dataFilePath);
    
    console.log(`📂 Using data file: ${resolvedPath}`);
    
    // Check if file exists
    try {
      await fs.access(resolvedPath);
    } catch (error) {
      console.error(`❌ Error: File not found at ${resolvedPath}`);
      return;
    }
    
    // Connect to MongoDB
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(mongoURI);
    console.log(`✅ Connected to MongoDB database: ${mongoose.connection.db.databaseName}`);
    
    // Confirm database selection
    const confirmDb = await question(`Continue with database "${mongoose.connection.db.databaseName}"? (yes/no): `);
    if (confirmDb.toLowerCase() !== 'yes' && confirmDb.toLowerCase() !== 'y') {
      console.log('❌ Migration aborted by user');
      await mongoose.disconnect();
      return;
    }
    
    // Read JSON file
    console.log('📖 Reading JSON file...');
    const fileContent = await fs.readFile(resolvedPath, 'utf8');
    let jsonData;
    
    try {
      jsonData = JSON.parse(fileContent);
      console.log(`✅ Successfully loaded JSON with ${jsonData.length} items`);
    } catch (error) {
      console.error('❌ Error parsing JSON:', error.message);
      return;
    }
    
    // Confirm import
    const itemCount = Array.isArray(jsonData) ? jsonData.length : 0;
    if (itemCount === 0) {
      console.error('❌ No items found in JSON file or invalid format');
      return;
    }
    
    const confirmImport = await question(`Ready to import ${itemCount} items to database "${mongoose.connection.db.databaseName}". Proceed? (yes/no): `);
    if (confirmImport.toLowerCase() !== 'yes' && confirmImport.toLowerCase() !== 'y') {
      console.log('❌ Import aborted by user');
      return;
    }
    
    // Process content if needed
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
      }
      
      return { content, primaryLanguage };
    };
    
    // Process the data if needed
    console.log('🔄 Processing data...');
    const processedData = jsonData.map(item => {
      // Only process content if it's an array
      if (Array.isArray(item.content)) {
        const { content, primaryLanguage } = processContent(item.content);
        return {
          ...item,
          content,
          codeLanguage: primaryLanguage || item.codeLanguage || ''
        };
      }
      return item;
    });
    
    console.log(`✅ Processed ${processedData.length} items for import`);
    
    // Import the data
    console.log('📤 Importing data to MongoDB...');
    const result = await importFromJSON(processedData, adminUserId);
    
    // Log results
    console.log(`\n✅ Import completed:`);
    console.log(`   📊 ${result.imported} items imported successfully`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️ Errors encountered (${result.errors.length} items):`);
      result.errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.title}: ${err.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close MongoDB connection and readline interface
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
    rl.close();
  }
}

// Run the migration
migrate().catch(console.error);