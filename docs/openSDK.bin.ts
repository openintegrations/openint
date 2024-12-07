import { graphql } from "@octokit/graphql";
import { get } from 'https';

import { promises as fs } from 'fs';
import * as path from 'path';
const OWNER = "openintegrations";
const REPO = "openSDKs";
const BASE_PATH = "sdks";
const BRANCH = "main";


function extractAPIName(filename: string) {
  // Remove the trailing ".oas.json" from the filename
  const baseName = filename.replace(/\.oas\.json$/, '');

  // Split the remaining part on underscores
  const parts = baseName.split('_');

  // The first segment should be the main name (e.g., "airbyte")
  const mainName = parts[0];

  // If there's more than one part, the rest forms the API name (e.g., "config")
  const apiName = parts.length > 1 ? parts.slice(1).join('_') : mainName;

  return { mainName, apiName };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * For a given group and its endpoints, ensure directories and files exist.
 * Returns an object with { group, pages }.
 */
async function processGroup(provider: string, apiName: string, openapiUrl: string) {
  const pages: string[] = [];

  const baseDir = path.join('open-sdks', provider);
  if (apiName !== 'API') {
    await fs.mkdir(baseDir, { recursive: true });
  }

  const filePath = apiName === 'API' ? `${baseDir}.mdx` : path.join(baseDir, `${apiName}.mdx`);

  try {
    await fs.access(filePath);
  } catch {
    let content = `---\nopenapi: ${openapiUrl}\n---\n`;

    // Fetch and parse the OpenAPI spec
    const apiSpec = await fetchAndParseOpenAPISpec(openapiUrl);
    const markdownTable = generateMarkdownTable(apiSpec, provider);
    provider = provider.charAt(0).toUpperCase() + provider.slice(1);
    content += `
## Integrating with ${provider} OpenSDK 

Welcome to the ${provider} OpenSDK documentation. OpenSDKs provides a type-safe and standardized way to interact with various APIs, ensuring a consistent and efficient integration experience.

The ${provider} OpenSDK allows you to easily integrate with the ${provider} API, providing a robust set of tools to manage your API interactions with managed auth by OpenInt. 
`;

    // Append the markdown table to the content
    content += `\n### Available Methods:`
    content += `\n\n${markdownTable}`;

    await fs.writeFile(filePath, content, 'utf8');
  }

  pages.push(`open-sdks/${provider}${apiName === 'API' ? '' : '/' + apiName}`);

  return pages;
}

// Fetch and parse OpenAPI spec using https
async function fetchAndParseOpenAPISpec(url: string) {
  return new Promise<any>((resolve, reject) => {
    get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('Failed to parse JSON'));
          }
        } else {
          reject(new Error(`Failed to fetch OpenAPI spec: ${response.statusCode}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Generate markdown table from OpenAPI spec
function generateMarkdownTable(apiSpec: any, provider: string) {
  const paths = apiSpec.paths;
  let markdownTable = '| Method | Path | Description |\n|--------|------|-------------|\n';
  let example = null;

  for (const [path, methods] of Object.entries(paths)) {

    for (const [method, details] of Object.entries(methods as any)) {
      let description = details.summary || details.description || '';
      description = description.replace(/\n/g, ' ');
      markdownTable += `| **${method.toUpperCase()}** | ${path.replace(/\/\//g, '/')} | ${description}\n`;

      // Add code example only once per path
      if (!example) {
        example = generateMarkdownCodeExample({ method, path, description, provider, parameters: details.parameters });
      }
    }
  }

  if(example) {
    markdownTable += `\n\n## Code Example\n\n\`\`\`typescript\n${example}\n\`\`\`\n`;
  }

  return markdownTable;
}

export function generateMarkdownCodeExample({ method, path, description, provider, parameters}) {
  const base = `
    import {initSDK} from '@opensdks/runtime'
    import {${provider}SdkDef} from '@opensdks/sdk-${provider}'

    const ${provider} = initSDK(${provider}SdkDef, {
      auth: {
        // for provider-specific auth
        bearer: \`\${process.env['${provider.toUpperCase()}_TOKEN']}\`,
        // or for passthrough auth via OPENINT_API_KEY & end user resourceId
        openInt: {
          apiKey: \`\${process.env['OPENINT_API_KEY']}\`,
          resourceId: END_USER_RESOURCE_ID,
        }
      }${parameters ? `, params: { ... }` : ''}
    })

    ${description ? `// ${description}` : ''}
    const res = await ${provider}.${method.toUpperCase()}('${path}')`
  
  return base;
}

export async function processOpenSDKs(input: any) {
  console.log(input);

  const allGroups: (string | { group: string, pages: string[] })[] = [];

  for (const provider of Object.keys(input)) {
    const allPages: string[] = [];

    for (const apiName of Object.keys(input[provider])) {
      const endpoint = input[provider][apiName];
      const pages = await processGroup(provider, apiName, endpoint);
      allPages.push(...pages);
    }

    const groupEntry = allPages.length === 1 ? allPages[0] : { group: provider.charAt(0).toUpperCase() + provider.slice(1) + ' APIs', pages: allPages };
    allGroups.push(groupEntry);
  }

  // Write the single index.json file at the root of baseDir
  const indexFilePath = path.join('open-sdks', 'index.json');
  await fs.writeFile(indexFilePath, JSON.stringify(allGroups, null, 2), 'utf8');
}

// GraphQL client initialization; token can be provided if needed for authenticated calls
const graphqlWithAuth = graphql.defaults({
  headers: {
    Authorization: `Bearer ${process.env['GITHUB_TOKEN']}`
  }
});

// Query to get the entries of a given directory
async function getDirectoryEntries(path: string) {
  const query = `
    query($owner: String!, $repo: String!, $expr: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $expr) {
          ... on Tree {
            entries {
              name
              type
              object {
                ... on Blob {
                  commitUrl

                }
              }
            }
          }
        }
      }
    }
  `;

  const { repository } = await graphqlWithAuth(query, {
    owner: OWNER,
    repo: REPO,
    expr: `${BRANCH}:${path}`
  });

  return repository?.object?.entries ?? [];
};

(async () => {

  if(!process.env['GITHUB_TOKEN']) {
    throw new Error('GITHUB_TOKEN is not set');
  }
  // 1. Get entries in sdks/
  const rootEntries = await getDirectoryEntries(BASE_PATH);
  // 2. Filter directories that start with sdk-
  const sdkDirs = rootEntries.filter((entry: any) => entry.type === "tree" && entry.name.startsWith("sdk-"));

  const results: any = {};

  // 3. For each directory, get its entries and gather .oas.json files
  for (const dir of sdkDirs) {
    const sdkEntries = await getDirectoryEntries(`${BASE_PATH}/${dir.name}`);

    // 4. Filter for *.oas.json files
    for (const file of sdkEntries) {
      if (file.type === "blob" && file.name.endsWith(".oas.json")) {
        const { mainName, apiName } = extractAPIName(file.name);
        if(mainName && (mainName?.split('_').length > 1 || mainName?.split('-').length > 1 || mainName?.split('.').length > 1) || mainName?.toLocaleLowerCase()?.includes('openint')) {
          console.log('Skipping ', file.name, mainName, apiName);
          continue;
        }
        if (!results[mainName + '']) {
          results[mainName + ''] = {};
        }
        results[mainName + ''][mainName === apiName ? 'API' : apiName + ''] = `https://raw.githubusercontent.com/openintegrations/openSDKs/refs/heads/main/sdks/sdk-${mainName}/${file.name}`;
      }
    }
    delay(50);
  }

  await processOpenSDKs(results);

  // 5. Output the final JSON
  // writeFileSync("openSDKs.json", JSON.stringify(results, null, 2), "utf-8");
})();
