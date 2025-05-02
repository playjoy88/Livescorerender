# LiveScore API Test Console

A comprehensive testing interface for the API-SPORTS Football API used in the LiveScore application.

## Features

- Tests common API endpoints (Status, Live Matches, Leagues)
- Provides custom endpoint testing with parameter support
- Displays formatted JSON responses
- Shows real-time API rate limit information
- Offers API troubleshooting guidance

## Usage Instructions

### Production Environment

This API test page is designed to be used in the production environment where the `/api/proxy` server-side endpoint is available. It requires the server-side proxy to function correctly.

1. Deploy this page to the same server as your LiveScore application
2. Access it through the server URL (not as a local file)
3. Use the provided buttons to test different API endpoints
4. View the formatted JSON responses

### Important Notes

- This test page uses the server-side proxy to make secure API requests with the API key
- CORS policy prevents the page from working correctly when opened as a local file
- For security reasons, the API key is kept on the server and not exposed to the client

## Testing Different Endpoints

1. **Status API**: Tests the API connection and account status
2. **Live Matches**: Retrieves currently live football matches
3. **Leagues**: Gets information about available leagues
4. **Custom Endpoint**: Allows testing any API endpoint with custom parameters

## Troubleshooting

If you encounter issues:

- Verify your API key is correctly set in server environment variables
- Check for rate-limiting issues (daily and per-minute limits)
- Ensure the host domain is authorized with API-Sports
- Review network requests in browser developer tools for more details
