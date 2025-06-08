#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class NPMPackageInfoServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'npm-package-info-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'npm_view_package',
            description: 'Get detailed information about an NPM package using npm view command',
            inputSchema: {
              type: 'object',
              properties: {
                packageName: {
                  type: 'string',
                  description: 'The name of the NPM package to query (e.g., "react", "@types/node")',
                },
                field: {
                  type: 'string',
                  description: 'Optional specific field to retrieve (e.g., "version", "description", "dependencies")',
                  optional: true,
                },
              },
              required: ['packageName'],
            },
          } as Tool,
          {
            name: 'npm_search_packages',
            description: 'Search for NPM packages by keyword or name',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for NPM packages',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 10)',
                  optional: true,
                  default: 10,
                },
              },
              required: ['query'],
            },
          } as Tool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'npm_view_package') {
          return await this.handleNpmView(args);
        } else if (name === 'npm_search_packages') {
          return await this.handleNpmSearch(args);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async handleNpmView(args: any) {
    const { packageName, field } = args;

    if (!packageName || typeof packageName !== 'string') {
      throw new Error('Package name is required and must be a string');
    }

    try {
      const command = field 
        ? `npm view "${packageName}" ${field} --json`
        : `npm view "${packageName}" --json`;
      
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stdout) {
        throw new Error(`Package not found or error occurred: ${stderr}`);
      }

      let result;
      try {
        result = JSON.parse(stdout);
      } catch {
        // If it's not JSON, return as plain text
        result = stdout.trim();
      }

      const formattedOutput = typeof result === 'object' 
        ? JSON.stringify(result, null, 2)
        : result;

      return {
        content: [
          {
            type: 'text',
            text: `NPM Package Information for "${packageName}"${field ? ` (${field})` : ''}:\n\n${formattedOutput}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        throw new Error(`Package "${packageName}" not found in NPM registry`);
      }
      
      throw new Error(`Failed to fetch package information: ${errorMessage}`);
    }
  }

  private async handleNpmSearch(args: any) {
    const { query, limit = 10 } = args;

    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string');
    }

    try {
      const command = `npm search "${query}" --json --searchlimit=${limit}`;
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stdout) {
        throw new Error(`Search failed: ${stderr}`);
      }

      let results;
      try {
        results = JSON.parse(stdout);
      } catch {
        throw new Error('Failed to parse search results');
      }

      if (!Array.isArray(results) || results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No packages found for query: "${query}"`,
            },
          ],
        };
      }

      const formattedResults = results.map((pkg, index) => 
        `${index + 1}. **${pkg.name}** (${pkg.version})\n   ${pkg.description || 'No description available'}\n   Author: ${pkg.author?.name || 'Unknown'}\n   Modified: ${pkg.date ? new Date(pkg.date).toLocaleDateString() : 'Unknown'}`
      ).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `NPM Search Results for "${query}" (${results.length} packages):\n\n${formattedResults}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to search packages: ${errorMessage}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('NPM Package Info MCP server running on stdio');
  }
}

const server = new NPMPackageInfoServer();
server.run().catch(console.error);
