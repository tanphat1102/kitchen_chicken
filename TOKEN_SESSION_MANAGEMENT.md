# Token Session Management Improvements

## Issues Fixed

### 1. **Token Expiry Not Updated After Refresh**
**Problem**: When tokens were refreshed, the `tokenExpiresAt` value wasn't being updated, causing the app to think tokens were still expired even after successful refresh.

**Solution**: 
- Updated all refresh functions to set `tokenExpiresAt` with default 1-hour expiry
- Added logging to show new expiry time after refresh

**Files Changed**:
- `src/config/axios.ts` - Added expiry update in `refreshAccessToken()`
- `src/services/api.ts` - Added expiry update in `refreshAccessToken()`
- `src/services/authService.ts` - Simplified token update in `refreshAuthToken()`

### 2. **Auto-Refresh Timer Issues**
**Problem**: Auto-refresh timer wasn't properly cleared and restarted, leading to multiple timers running simultaneously.

**Solution**:
- Modified `setupAutoRefresh()` to clear existing timer before creating new one
- Reload tokens from storage before each check to ensure latest data
- Added logging to track timer lifecycle

**Code**:
```typescript
private setupAutoRefresh(): void {
  // Clear any existing timer
  this.clearAutoRefresh();
  
  const checkAndRefresh = () => {
    // Reload tokens from storage to ensure we have latest
    this.loadTokensFromStorage();
    
    if (this.isTokenExpiringSoon() && this.refreshToken) {
      console.log('⏰ Auto-refresh triggered');
      this.refreshAuthToken().catch(err => {
        console.error('Auto-refresh failed:', err);
      });
    }
  };

  // Check every minute
  this.refreshTimer = setInterval(checkAndRefresh, 60 * 1000);
  console.log('✅ Auto-refresh timer started (check every 60s)');
}
```

### 3. **Token State Synchronization**
**Problem**: In-memory tokens in `authService` weren't being updated after refresh from axios interceptors, causing state mismatch.

**Solution**:
- Update both localStorage AND in-memory properties in `refreshAuthToken()`
- Reload tokens from storage in auto-refresh check
- Added detailed logging to track token state

**Code**:
```typescript
// Update in-memory tokens
this.accessToken = result.data.accessToken;
this.refreshToken = result.data.refreshToken;
```

### 4. **Better Debugging**
**Problem**: Hard to debug token issues without visibility into token state.

**Solution**:
- Created `TokenDebugger` utility class
- Available in browser console as `window.TokenDebugger`
- Provides commands to:
  - Check token status: `TokenDebugger.logTokenStatus()`
  - Monitor tokens: `TokenDebugger.startMonitoring(10)` 
  - Simulate expiry: `TokenDebugger.simulateTokenExpiry(4)`
  - Clear tokens: `TokenDebugger.clearAllTokens()`

**Features**:
```typescript
// Check current token status
TokenDebugger.logTokenStatus();

// Output:
// 🔍 Token Status Debug
//   Current Time: 11/10/2025, 10:30:45 AM
//   Has Access Token: true (eyJhbGciOiJIUzI1NiIs...)
//   Has Refresh Token: true (v2.local.OXVvMEJBS...)
//   Has User Info: true
//   Token Expires At: 11/10/2025, 11:30:45 AM
//   Time Until Expiry: { minutes: 60, seconds: 3600, milliseconds: 3600000 }
//   ✅ Token is valid
//   User Info: { email: 'user@example.com', displayName: 'John Doe', provider: 'google' }
```

## How Refresh Token Works Now

### Flow Diagram
```
User Login
    ↓
Backend Returns Tokens (accessToken, refreshToken)
    ↓
Save to localStorage with tokenExpiresAt (now + 1 hour)
    ↓
Auto-Refresh Timer Started (check every 60s)
    ↓
[Every 60s] Check if token expiring soon (< 5 min)
    ↓
    YES → Call /api/auth/refresh
           ↓
           Success → Update tokens + expiry
                  → Continue
           ↓
           Failed → Clear tokens
                 → Dispatch auth:unauthorized event
    ↓
    NO → Continue
    ↓
[On API Request] Check token expiry
    ↓
    Expiring Soon? → Proactive refresh before request
    ↓
    401 Response? → Trigger refresh in interceptor
                 → Retry request with new token
                 → Queue parallel requests
```

### Refresh Triggers

1. **Auto-Refresh (Proactive)**
   - Runs every 60 seconds
   - Refreshes if < 5 minutes until expiry
   - Prevents 401 errors

2. **Visibility Change**
   - When user returns to tab
   - Checks token immediately
   - Refreshes if expiring soon

3. **Before API Request**
   - In `authService.makeAuthenticatedRequest()`
   - Checks before making request
   - Proactive refresh if needed

4. **On 401 Error (Reactive)**
   - In axios interceptor
   - Triggers when token actually expired
   - Queues simultaneous requests
   - Retries after successful refresh

## Configuration

### Token Expiry Settings

Default expiry: **1 hour (3600 seconds)**

Location: All refresh functions use default if backend doesn't provide:
```typescript
const expiresIn = data.expiresIn || 3600; // 1 hour default
```

### Auto-Refresh Timing

- **Check Interval**: Every 60 seconds
- **Refresh Threshold**: 5 minutes before expiry

To change:
```typescript
// In authService.ts
this.refreshTimer = setInterval(checkAndRefresh, 60 * 1000); // Change 60 to desired seconds

// In isTokenExpiringSoon()
const fiveMinutes = 5 * 60 * 1000; // Change 5 to desired minutes
```

## Testing

### Manual Testing

1. **Login and Wait for Auto-Refresh**
   ```javascript
   // 1. Login normally
   // 2. Open console and check token
   TokenDebugger.logTokenStatus();
   
   // 3. Simulate token expiring in 4 minutes
   TokenDebugger.simulateTokenExpiry(4);
   
   // 4. Wait 1 minute and check console for auto-refresh
   // Should see: "⏰ Auto-refresh triggered"
   ```

2. **Test Visibility Detection**
   ```javascript
   // 1. Login
   // 2. Simulate expiry soon
   TokenDebugger.simulateTokenExpiry(3);
   
   // 3. Switch to another tab for 10 seconds
   // 4. Come back to app tab
   // Should see: "👁️ Tab visible again, checking token..."
   ```

3. **Test 401 Handling**
   ```javascript
   // 1. Login
   // 2. Clear access token only (keep refresh token)
   localStorage.removeItem('accessToken');
   
   // 3. Make an API request (e.g., view cart)
   // Should auto-refresh and retry
   ```

4. **Monitor Token Continuously**
   ```javascript
   // Start monitoring (check every 10 seconds)
   const timerId = TokenDebugger.startMonitoring(10);
   
   // Stop monitoring
   TokenDebugger.stopMonitoring(timerId);
   ```

### Expected Console Logs

**On Login:**
```
🚀 Starting google login...
🔥 Opening Firebase popup...
✅ Firebase popup completed
🔑 Getting Firebase ID token...
✅ Firebase ID token obtained
🌐 Authenticating with backend...
✅ Backend authentication success
💾 Saving authentication data to localStorage...
✅ Tokens and user info saved to localStorage
✅ Auto-refresh timer started (check every 60s)
```

**On Auto-Refresh:**
```
⏰ Auto-refresh triggered
🔄 Refreshing access token...
✅ Token refreshed successfully { newExpiry: '...', expiresIn: '3600s (60 minutes)' }
```

**On 401 Error:**
```
🔄 Refreshing access token...
✅ Token refreshed successfully
[Retrying original request with new token]
```

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `accessToken` | string | JWT access token for API requests |
| `refreshToken` | string | Token used to get new access token |
| `tokenExpiresAt` | number | Timestamp (ms) when token expires |
| `userInfo` | JSON | User profile data from Firebase |
| `loginTimestamp` | number | Timestamp when user logged in |

## Troubleshooting

### Issue: Token keeps expiring
**Solution**: 
- Check if backend is returning tokens correctly
- Verify `tokenExpiresAt` is being set
- Use `TokenDebugger.logTokenStatus()` to check expiry time

### Issue: Auto-refresh not working
**Solution**:
- Check console for timer logs
- Verify refresh token exists in localStorage
- Check if auto-refresh timer is running: look for "Auto-refresh timer started"

### Issue: 401 errors not handled
**Solution**:
- Verify axios interceptors are configured
- Check if refresh token is valid
- Look for error logs in console

### Issue: Multiple refreshes happening
**Solution**:
- Check if request queue is working (look for "Queue" logs)
- Verify only one refresh is happening at a time
- Make sure `isRefreshing` flag is working

## Future Improvements

1. **Configurable Refresh Timing**
   - Make refresh threshold configurable
   - Allow different timings per environment

2. **Better Error Recovery**
   - Exponential backoff for failed refreshes
   - Retry mechanism with limits

3. **Token Analytics**
   - Track refresh frequency
   - Monitor token usage patterns
   - Alert on abnormal refresh rates

4. **Security Enhancements**
   - Token rotation on every refresh
   - Detect token theft (multiple IPs)
   - Automatic logout on suspicious activity
