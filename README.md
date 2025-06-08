# NPM Package Info MCP Server

A Model Context Protocol (MCP) server that provides tools for querying NPM package information using the `npm view` and `npm search` commands.

## Features

- **Package Information**: Get detailed information about any NPM package
- **Package Search**: Search for NPM packages by keyword
- **Flexible Queries**: Query specific fields from package metadata
- **Error Handling**: Robust error handling with informative messages

## Tools

### npm_view_package

Get detailed information about an NPM package using the `npm view` command.

**Parameters:**
- `packageName` (string, required): The name of the NPM package to query (e.g., "react", "@types/node")
- `field` (string, optional): Specific field to retrieve (e.g., "version", "description", "dependencies")

**Examples:**
- Get all package information: `packageName: "react"`
- Get specific field: `packageName: "react"`, `field: "version"`
- Get dependencies: `packageName: "express"`, `field: "dependencies"`

### npm_search_packages

Search for NPM packages by keyword or name.

**Parameters:**
- `query` (string, required): Search query for NPM packages
- `limit` (number, optional): Maximum number of results to return (default: 10)

**Examples:**
- Search for React packages: `query: "react component"`
- Limited search: `query: "typescript"`, `limit: 5`

## Installation

### Global Installation

```bash
npm install -g mcp-server-npm-package-info
```

### Local Installation

```bash
npm install mcp-server-npm-package-info
```

## Usage

### Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "npm-package-info": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-npm-package-info"
      ]
    }
  }
}
```

### Cline (VS Code Extension)

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "npm-package-info": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-npm-package-info"
      ]
    }
  }
}
```

### Other MCP Clients

For any MCP-compatible client, use the following configuration:

```json
{
  "command": "npx",
  "args": ["-y", "mcp-server-npm-package-info"]
}
```

## Requirements

- **Node.js**: Version 18 or higher
- **NPM**: Installed and accessible in PATH
- **Internet Connection**: Required for NPM registry queries

## Example Queries

Once configured, you can ask your MCP client:

- "What's the latest version of React?"
- "Show me information about the Express package"
- "Search for TypeScript testing libraries"
- "What are the dependencies of lodash?"
- "Find packages related to machine learning"

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/DavidBurgos7/server-npm-find-package-info.git
cd server-npm-find-package-info

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Testing

You can test the server using the MCP inspector or by integrating it with your preferred MCP client.

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Error Handling

The server includes comprehensive error handling for common scenarios:

- **Package not found**: Returns a clear message when a package doesn't exist
- **Network errors**: Handles connection issues gracefully
- **Invalid parameters**: Validates input parameters and provides helpful error messages
- **Command failures**: Catches and reports NPM command execution errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Repository

[https://github.com/DavidBurgos7/server-npm-find-package-info](https://github.com/DavidBurgos7/server-npm-find-package-info)

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/DavidBurgos7/server-npm-find-package-info/issues) on GitHub.
