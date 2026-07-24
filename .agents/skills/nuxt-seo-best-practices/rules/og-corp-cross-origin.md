---
title: Serve OG Images with CORP cross-origin
impact: CRITICAL
impactDescription: Prevents every social share card from silently failing when a security-headers layer is added
tags: og-image, corp, cross-origin, security-headers, social-sharing, csp
---

## Serve OG Images with CORP cross-origin

`Cross-Origin-Resource-Policy: same-origin` on an OG image response makes every social platform's card crawler (Slack, Discord, Twitter/X, LinkedIn, Facebook) unable to load the image — the share card renders without it. The failure is invisible in normal browsing (same-origin pages load the image fine) and typically ships inside a site-wide security-headers hardening pass. The debugger symptom is `og:image Failed to load image (may be corrupt or blocked by CORS)` while the image itself is a perfectly valid 200 PNG.

**Incorrect (global security middleware stamps every route):**

```typescript
// ❌ WRONG — server/middleware/security-headers.ts
// CORP same-origin lands on /og/** too; social crawlers get blocked
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': CSP_DEFAULT,
    'X-Frame-Options': 'SAMEORIGIN',
    // ...rest of the A+ header set
  });
});
```

**Correct (public cross-origin assets get their own branch):**

```typescript
// ✅ CORRECT — server/utils/security-headers.ts
// OG images + any image third parties embed (static map images, badges)
// must be fetchable cross-origin. Everything else keeps same-origin.
export function isCrossOriginAsset(path: string): boolean {
  return path.startsWith('/og/');
}

export function buildSecurityHeaders(path: string): Record<string, string> {
  if (isCrossOriginAsset(path)) {
    return {
      ...SECURITY_HEADERS,
      'Cross-Origin-Resource-Policy': 'cross-origin',
      // No CSP / X-Frame-Options — framing directives are meaningless on
      // a raw image and only invite the middleware bug below.
    };
  }
  return {
    ...SECURITY_HEADERS,
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': CSP_DEFAULT,
  };
}
```

**Companion trap — CSP nonce substitution must be guarded.** If the middleware substitutes a per-request nonce into the CSP, the asset branch above returns headers WITHOUT a CSP — a non-null assertion turns that into a 500 on every OG image:

```typescript
// ❌ WRONG — 500s every /og request once the asset branch omits CSP
headers['Content-Security-Policy'] = headers[
  'Content-Security-Policy'
]!.replaceAll('{{nonce}}', nonce);

// ✅ CORRECT — substitute only when a CSP is present
const csp = headers['Content-Security-Policy'];
if (csp) {
  headers['Content-Security-Policy'] = csp.replaceAll('{{nonce}}', nonce);
}
```

**Verification (do all three — meta parsing alone misses this bug):**

1. `curl -sSI https://your.app/og/page.png | grep -i cross-origin-resource-policy` → must print `cross-origin`.
2. Run the page through a social-share debugger that actually FETCHES the image (e.g. nuxtseo.com/tools/social-share-debugger) — a meta-tag parser reports `og:image Found` even while the image is CORP-blocked.
3. Regression-check an HTML route still returns your strict CORP (`same-origin`) so the security posture is unchanged.

Pin all three in a unit test on the header builder — the "re-tighten CORP everywhere" cleanup is exactly the regression a future hardening sweep will attempt.

Reference: [MDN Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Resource-Policy)
