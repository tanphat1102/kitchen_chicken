# 🔄 Refresh Token Improvements

## Tổng quan

Cải thiện cơ chế refresh token để đảm bảo session người dùng luôn được duy trì một cách mượt mà và an toàn.

## ✨ Cải tiến chính

### 1. **Automatic Token Refresh** ⏰
- Auto-refresh token trước khi hết hạn (5 phút trước expiry)
- Background refresh mỗi 1 phút để kiểm tra token
- Không cần user can thiệp

### 2. **Request Queue Management** 📋
- Queue tất cả requests khi đang refresh token
- Tránh multiple refresh requests cùng lúc
- Retry failed requests sau khi refresh thành công

### 3. **Visibility Change Detection** 👁️
- Auto-refresh khi user quay lại tab/window
- Đảm bảo token luôn fresh khi user active
- Listen `document.visibilitychange` event

### 4. **Proactive Refresh** 🚀
- Refresh token TRƯỚC khi gửi request nếu sắp hết hạn
- Giảm thiểu 401 errors
- Better UX - không bị interrupt

### 5. **Enhanced Error Handling** 🛡️
- Clear auth data khi refresh token invalid
- Dispatch `auth:unauthorized` event để show login
- Graceful fallback và user notification

## 📁 Files Modified

### 1. `src/config/axios.ts`
```typescript
// Request queue để chờ token refresh
let failedQueue = [];
let isRefreshing = false;

// Auto refresh và retry logic
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Queue requests và refresh token
      // Retry sau khi có token mới
    }
  }
);
```

### 2. `src/services/api.ts`
```typescript
// Tương tự axios.ts nhưng cho instance khác
// Đảm bảo consistency across all API calls
```

### 3. `src/services/authService.ts`
```typescript
class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.setupAutoRefresh(); // Auto-refresh every minute
    
    // Listen visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isTokenExpiringSoon()) {
        this.refreshAuthToken();
      }
    });
  }
  
  // Proactive refresh nếu token sắp hết hạn
  private isTokenExpiringSoon(): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= (expiresAt - fiveMinutes);
  }
}
```

## 🔄 Flow Diagram

```
User Login
    ↓
Save tokens + expiresAt
    ↓
Start auto-refresh timer (every 1 min)
    ↓
Listen visibility changes
    ↓
┌─────────────────────────────────┐
│  Background Check (every 1 min) │
│  ↓                               │
│  Token expiring soon? (< 5 min) │
│  ↓                               │
│  Yes → Refresh proactively      │
│  No → Continue                  │
└─────────────────────────────────┘
    ↓
User makes API request
    ↓
Token expiring soon?
    ↓
Yes → Refresh before request
    ↓
Send request with fresh token
    ↓
401 Error?
    ↓
Queue request → Refresh token → Retry
    ↓
Success!
```

## 🎯 Benefits

### For Users:
- ✅ Seamless experience - không bị logout bất ngờ
- ✅ Không cần re-login thường xuyên
- ✅ Session được maintain khi switch tabs

### For Developers:
- ✅ Reduced 401 errors
- ✅ Better error handling và logging
- ✅ Consistent behavior across all API calls
- ✅ Easier to debug authentication issues

### For Security:
- ✅ Shorter access token lifetime → Reduced attack surface
- ✅ Automatic cleanup on invalid refresh token
- ✅ Proper event dispatching for unauthorized state

## 📊 Token Lifecycle

```
Token Created (expiresIn: 3600s = 1 hour)
    ↓
55 minutes elapsed
    ↓
isTokenExpiringSoon() = true
    ↓
Auto-refresh triggered
    ↓
New token received (new 1 hour lifetime)
    ↓
Old token discarded
    ↓
Cycle repeats
```

## 🧪 Testing

### Manual Test:
1. Login → Check localStorage có tokens
2. Đợi 55 phút → Xem auto-refresh logs
3. Switch tab away → Switch back → Check refresh
4. Clear refreshToken → Make request → Should show login

### Console Logs to Watch:
```
✅ Valid tokens loaded from localStorage
⏰ Token expiring soon, refreshing proactively...
🔄 Refreshing access token...
✅ Token refreshed successfully
👁️ Tab visible again, checking token...
```

## ⚙️ Configuration

### Adjust refresh timing:
```typescript
// authService.ts
private isTokenExpiringSoon(): boolean {
  const fiveMinutes = 5 * 60 * 1000; // Change this
  return Date.now() >= (expiresAt - fiveMinutes);
}

// Change auto-refresh interval
setInterval(checkAndRefresh, 60 * 1000); // 1 minute
```

## 🚨 Important Notes

1. **Browser Support**: Requires `document.visibilitychange` API
2. **Network**: Auto-refresh may fail on poor connection - will retry on 401
3. **Storage**: Uses localStorage - won't work in incognito/private mode with strict settings
4. **Backend**: Backend must support `/api/auth/refresh` endpoint

## 🔜 Future Improvements

- [ ] Add retry logic với exponential backoff
- [ ] Implement token rotation (refresh token cũng được renew)
- [ ] Add metrics để track refresh success rate
- [ ] Support multiple tabs sync (BroadcastChannel API)
- [ ] Add offline queue cho requests khi network down

## 📚 References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OAuth 2.0 Refresh Token](https://oauth.net/2/grant-types/refresh-token/)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
