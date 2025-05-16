# API IP Restriction Fix

## Problem Overview

The API test function in the admin settings was failing with the error:

```
การเชื่อมต่อล้มเหลว
Failed to connect to API: Unexpected token '<', "<!doctype "... is not valid JSON
```

And when the raw API response is examined, we also saw this error:
```
"errors": {
    "Ip": "This IP is not allowed to call the API, check the list of allowed IPs in the dashboard."
}
```

## Root Causes

After investigating the API documentation and implementation, we identified multiple issues:

1. **Header Restrictions**: API-Football only allows specific headers and rejects requests with additional headers.
   - According to their documentation: "The API is configured to work only with GET requests and allows only the headers listed below: `x-rapidapi-host`, `x-rapidapi-key`, `x-apisports-key`"
   - NextJS/Fetch automatically adds several headers that may cause API requests to be rejected

2. **IP Whitelist Requirement**: The API requires server IP addresses to be explicitly whitelisted in the API dashboard.
   - The server's IP address must be added to the allowed IPs list in the API provider's dashboard
   - Previously, the code didn't identify or display this server IP information

3. **Inconsistent API Usage**: Different parts of the codebase were using different header formats.
   - Some code used RapidAPI format, others used direct API format
   - This inconsistency led to occasional successful requests but frequent failures

## Solutions Implemented

We made the following changes to address these issues:

1. **IP Detection and Reporting**
   - Added server IP detection via `api.ipify.org` in the API test function
   - Enhanced error reporting to show the exact IP address that needs whitelisting
   - Clear instructions are now provided to the user when an IP restriction error occurs

2. **Header Standardization**
   - Updated all API proxy routes to use only the allowed headers
   - Added both `x-rapidapi-key` and `x-apisports-key` formats for compatibility
   - Removed any unnecessary headers that could trigger CORS or validation issues

3. **Cache and Fetch Options**
   - Modified fetch options to reduce automatic header generation
   - Ensured consistent caching behavior across all API requests

## How to Use

When you click the "ทดสอบการเชื่อมต่อ" (Test Connection) button in Admin Settings:

1. The system will now show your server's IP address if there's an IP restriction error
2. You need to add this IP address to your allowed IPs list in the API-Football dashboard
3. Once added, try testing the connection again

## Access the API Dashboard

1. Log in to your API-Football account
2. Navigate to the dashboard
3. Find the IP whitelist section
4. Add the server IP address shown in the error message
5. Save your changes

## Additional Notes

- If you're using RapidAPI as a proxy, make sure your RapidAPI account is properly configured
- Different environments (development, staging, production) may have different IP addresses
- When deploying to a new environment, you may need to whitelist the new server's IP
