/**
 * Token Debugger Utility
 * Helps debug token refresh issues by providing detailed logging
 */

export class TokenDebugger {
  static logTokenStatus(): void {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    const userInfo = localStorage.getItem("userInfo");

    const now = Date.now();
    const expiresAtMs = expiresAt ? parseInt(expiresAt) : null;
    const timeToExpiry = expiresAtMs ? expiresAtMs - now : null;
    const minutesUntilExpiry = timeToExpiry
      ? Math.floor(timeToExpiry / 1000 / 60)
      : null;
    const secondsUntilExpiry = timeToExpiry
      ? Math.floor(timeToExpiry / 1000)
      : null;

    console.group("🔍 Token Status Debug");
    console.log("Current Time:", new Date().toLocaleString());
    console.log(
      "Has Access Token:",
      !!accessToken,
      accessToken ? `(${accessToken.substring(0, 20)}...)` : "",
    );
    console.log(
      "Has Refresh Token:",
      !!refreshToken,
      refreshToken ? `(${refreshToken.substring(0, 20)}...)` : "",
    );
    console.log("Has User Info:", !!userInfo);

    if (expiresAtMs) {
      console.log("Token Expires At:", new Date(expiresAtMs).toLocaleString());
      console.log("Time Until Expiry:", {
        minutes: minutesUntilExpiry,
        seconds: secondsUntilExpiry,
        milliseconds: timeToExpiry,
      });

      if (timeToExpiry !== null && timeToExpiry <= 0) {
        console.warn("⚠️ Token is EXPIRED");
      } else if (timeToExpiry !== null && timeToExpiry <= 5 * 60 * 1000) {
        console.warn("⚠️ Token expiring SOON (< 5 minutes)");
      } else {
        console.log("✅ Token is valid");
      }
    } else {
      console.warn("⚠️ No expiry time found");
    }

    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log("User Info:", {
          email: user.email,
          displayName: user.displayName,
          provider: user.provider,
        });
      } catch (e) {
        console.error("Failed to parse user info:", e);
      }
    }

    console.groupEnd();
  }

  static startMonitoring(intervalSeconds: number = 10): NodeJS.Timeout {
    console.log(`🔍 Starting token monitoring (every ${intervalSeconds}s)...`);
    return setInterval(() => {
      TokenDebugger.logTokenStatus();
    }, intervalSeconds * 1000);
  }

  static stopMonitoring(timerId: NodeJS.Timeout): void {
    clearInterval(timerId);
    console.log("🔍 Token monitoring stopped");
  }

  static simulateTokenExpiry(minutesFromNow: number = 4): void {
    const newExpiryTime = Date.now() + minutesFromNow * 60 * 1000;
    localStorage.setItem("tokenExpiresAt", newExpiryTime.toString());
    console.log(
      `⚠️ Token expiry simulated to ${minutesFromNow} minutes from now`,
    );
    console.log("New expiry:", new Date(newExpiryTime).toLocaleString());
    TokenDebugger.logTokenStatus();
  }

  static clearAllTokens(): void {
    const keys = [
      "accessToken",
      "refreshToken",
      "tokenExpiresAt",
      "userInfo",
      "loginTimestamp",
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    console.log("🧹 All tokens cleared");
    TokenDebugger.logTokenStatus();
  }
}

// Make available in browser console for debugging
if (typeof window !== "undefined") {
  (window as any).TokenDebugger = TokenDebugger;
  console.log(
    "🔧 TokenDebugger available in console. Try: TokenDebugger.logTokenStatus()",
  );
}
