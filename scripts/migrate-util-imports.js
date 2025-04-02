const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Map of exports to their source files
const utilExportMap = {
  // Types
  MaybePromise: 'type-utils',
  NonEmptyArray: 'type-utils',
  Merge: 'type-utils',
  InjectionToken: 'di-utils',
  HTTPError: 'http/index',
  RequiredOnly: 'type-utils',
  IAxiosError: 'http/http-utils',
  NonDiscriminatedUnion: 'type-utils',
  
  // Functions and objects
  makeUlid: 'id-utils',
  createHTTPClient: 'http/index',
  stringifyQueryParams: 'url-utils',
  zFunction: 'zod-function-utils',
  objectKeys: 'object-utils',
  resolveDependency: 'di-utils',
  rxjs: 'observable-utils',
  Rx: 'observable-utils',
  objectFromArray: 'array-utils',
  DateTime: 'date-utils',
  z: 'zod-utils',
  zCast: 'zod-utils',
  
  // Additional mappings
  getDefaultProxyAgent: 'http/http-utils',
  memoize: 'function-utils',
  normalizeError: 'error-utils',
  Deferred: 'promise-utils',
  R: 'remeda',
  OAuth2Client: 'http/OAuth2Client',
  startCase: 'string-utils',
  snakeCase: 'string-utils',
  titleCase: 'string-utils',
  isPlainObject: 'object-utils',
  safeJSONParse: 'json-utils',
  urlFromImage: 'url-utils',
  zodToOas31Schema: 'schema/zodToOas31Schema',
  zodToJsonSchema: 'schema/zodToOas31Schema',
  toCompletion: 'promise-utils',
  invert: 'object-utils',
  produce: 'immutable-utils',
};

function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  const newLines = [];
  
  const imports = new Map();
  
  for (const line of lines) {
    // Skip lines that are already using direct imports
    if (line.includes('@openint/util/')) {
      newLines.push(line);
      continue;
    }
    
    // Check for barrel imports
    const match = line.match(/import\s+(?:{([^}]+)})?\s+from\s+'@openint\/util'/);
    if (match) {
      modified = true;
      if (match[1]) {
        const symbols = match[1].split(',').map(s => s.trim());
        for (const symbol of symbols) {
          // Handle type imports specifically
          const isTypeImport = symbol.startsWith('type ');
          const cleanSymbol = symbol.replace(/^(type\s+)?/, '').trim();
          const targetFile = utilExportMap[cleanSymbol];
          
          if (targetFile) {
            if (!imports.has(targetFile)) {
              imports.set(targetFile, new Set());
            }
            imports.get(targetFile).add(isTypeImport ? `type ${cleanSymbol}` : symbol);
          } else {
            console.warn(`Unknown symbol: ${cleanSymbol} in ${filePath}`);
          }
        }
      }
    } else {
      newLines.push(line);
    }
  }
  
  // Add new direct imports at the top of the file
  if (imports.size > 0) {
    const importLines = Array.from(imports.entries()).map(([file, symbols]) => {
      return `import {${Array.from(symbols).join(', ')}} from '@openint/util/${file}'`;
    });
    
    // Find the best place to insert imports (after other imports)
    const lastImportIndex = newLines.findIndex((line, i, arr) => {
      return !line.trim().startsWith('import') && arr[i-1]?.trim().startsWith('import');
    });
    
    if (lastImportIndex !== -1) {
      newLines.splice(lastImportIndex, 0, ...importLines);
    } else {
      newLines.unshift(...importLines);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Updated imports in ${filePath}`);
  }
}

// Find all TypeScript files
const tsFiles = execSync('find . -type f -name "*.ts" -not -path "**/node_modules/*" -not -path "**/.next/*"')
  .toString()
  .split('\n')
  .filter(Boolean);

for (const file of tsFiles) {
  try {
    processFile(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
}

console.log('Migration complete. Please review the changes and run tests.');
