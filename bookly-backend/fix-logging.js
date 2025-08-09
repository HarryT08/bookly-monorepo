#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript files with logging errors
const findFiles = () => {
  try {
    const result = execSync('find src -name "*.ts" -type f', { encoding: 'utf8' });
    return result.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
};

// Fix logging patterns in a file
const fixLoggingInFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: this.logger.error('message', error, LoggingHelper.logParams({...}))
    // Should become: this.logger.error('message', { error: error.message, stack: error.stack, ...LoggingHelper.logParams({...}) })
    const pattern1 = /this\.logger\.error\(\s*'([^']+)',\s*error,\s*LoggingHelper\.logParams\(([^)]+)\)\s*\)/g;
    content = content.replace(pattern1, (match, message, params) => {
      modified = true;
      return `this.logger.error('${message}', { 
        error: error.message, 
        stack: error.stack, 
        ...LoggingHelper.logParams(${params}) 
      })`;
    });

    // Pattern 2: this.logger.error('message', error, LoggingHelper.logParams({ ... }));
    const pattern2 = /this\.logger\.error\(\s*'([^']+)',\s*error,\s*LoggingHelper\.logParams\(\s*\{([^}]+)\}\s*\)\s*\)/g;
    content = content.replace(pattern2, (match, message, params) => {
      modified = true;
      return `this.logger.error('${message}', { 
        error: error.message, 
        stack: error.stack, 
        ...LoggingHelper.logParams({${params}}) 
      })`;
    });

    // Pattern 3: Simple cases with just LoggingHelper.logParams
    const pattern3 = /this\.logger\.error\(\s*'([^']+)',\s*error,\s*LoggingHelper\.logParams\(\s*\{\s*([^}]*)\s*\}\s*\)\s*\)/g;
    content = content.replace(pattern3, (match, message, params) => {
      modified = true;
      const cleanParams = params.trim();
      if (cleanParams) {
        return `this.logger.error('${message}', { 
          error: error.message, 
          stack: error.stack, 
          ${cleanParams}
        })`;
      } else {
        return `this.logger.error('${message}', { 
          error: error.message, 
          stack: error.stack
        })`;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed logging in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
const main = () => {
  console.log('Starting logging fix...');
  
  const files = findFiles();
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixLoggingInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`Fixed logging in ${fixedCount} files`);
};

main();
