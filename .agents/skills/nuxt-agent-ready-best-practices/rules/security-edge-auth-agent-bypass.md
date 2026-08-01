---
title: Edge Auth Must Bypass Agent API Paths — Bearer Clients Cannot Solve a Login Page
impact: CRITICAL
impactDescription: Interactive edge auth (Cloudflare Access, SSO) in front of an agent API silently serves HTML login pages to agents instead of JSON — every MCP/CLI client breaks with a non-obvious failure
tags: security, auth, cloudflare-access, mcp, bearer, edge, sso, monitoring
---

## Edge Auth Must Bypass Agent API Paths — Bearer Clients Cannot Solve a Login Page

Putting an agent-facing surface behind interactive edge auth — Cloudflare Access, Okta/SSO proxies, IAP — is a sound instinct for a dashboard. Applied to the **API path**, it silently breaks every agent.

The mismatch is structural:

| Client            | Authenticates with                   | Can complete an interactive login? |
| ----------------- | ------------------------------------ | ---------------------------------- |
| Browser (human)   | Session cookie after an IdP redirect | Yes                                |
| MCP adapter / CLI | `Authorization: Bearer <token>`      | **No**                             |

An agent sends a bearer token and expects JSON. Edge auth ignores the token, issues a **302 to an IdP**, and the agent receives **HTML** where it expected a payload. Failures surface far from the cause: JSON parse errors, "unexpected token `<`", or an MCP server that starts fine and returns nothing useful.

**Incorrect (one Access policy covering the whole hostname):**

```jsonc
// ❌ WRONG — a single self-hosted Access app on agent.example.com.
// The dashboard is protected (good) and the API is protected (fatal):
// every MCP/CLI request is answered with a login page.
{
  "name": "Agent Platform",
  "domain": "agent.example.com",
  "type": "self_hosted",
  "policies": [
    { "decision": "allow", "include": [{ "email_domain": "example.com" }] },
  ],
}
```

```bash
# What the agent actually receives
$ curl -H "Authorization: Bearer cnry_live_..." https://agent.example.com/api/v1/projects
HTTP/2 302
location: https://your-team.cloudflareaccess.com/cdn-cgi/access/login/...
# -> the MCP client parses HTML as JSON and fails with a misleading error
```

**Correct (path-scoped bypass for the API, Access for the UI):**

```jsonc
// ✅ CORRECT — Access apps are matched most-specific-path-first.
// 1. ACME bypass so TLS issuance can complete (see caveat below)
{ "domain": "agent.example.com/.well-known/acme-challenge",
  "policies": [{ "decision": "bypass", "include": [{ "everyone": {} }] }] },

// 2. API bypass — the app's own bearer auth is the gate here
{ "domain": "agent.example.com/api/v1",
  "policies": [{ "decision": "bypass", "include": [{ "everyone": {} }] }] },

// 3. Dashboard — interactive auth for humans
{ "domain": "agent.example.com", "allowed_idps": ["<google-workspace-idp>"],
  "policies": [{ "decision": "allow",
                 "include": [{ "email_domain": { "domain": "example.com" } }] }] }
```

"Bypass" here means **bypass the _edge_ gate**, not "unauthenticated". The API keeps enforcing its own bearer tokens — you have simply moved the check to the layer that can actually evaluate a token.

### Verify all three behaviours explicitly

```bash
# Dashboard: humans get redirected to the IdP
curl -s -o /dev/null -w "%{http_code}\n" https://agent.example.com/
# 302  ✅

# API with a valid token: real JSON from the origin
curl -s -H "Authorization: Bearer $TOKEN" https://agent.example.com/api/v1/projects | head -c 40
# [{"id":"..."  ✅

# API without a token: YOUR APP's 401 JSON — not an Access login page
curl -s https://agent.example.com/api/v1/projects
# {"error":{"code":"AUTH_REQUIRED"}}  ✅
# An HTML <!doctype html> here means the bypass is not applied. ❌
```

That third check is the one people skip, and it is the only one that distinguishes "my app rejected you" from "the edge intercepted you".

### Two traps that follow from the same root cause

**1. TLS issuance deadlocks.** Access also intercepts `/.well-known/acme-challenge/`, so an HTTP-01 challenge never completes, the origin certificate is never issued, and the edge returns a **504 Gateway Timeout** — which reads like an origin outage, not an auth misconfiguration. Add the ACME bypass **before** first deploy, not after you are debugging a 504.

**2. Uptime monitors that cannot fail.** Point a monitor at `/` on an Access-protected host and the edge answers **200 with the login page** whether the origin is healthy or destroyed. The monitor stays green through a total outage. Probe a bypassed path instead:

```
Monitor URL:            https://agent.example.com/api/v1/projects
Accepted status codes:  401
```

A 401 proves the request reached your application. A 200 HTML login page proves only that the auth provider is up.

### Scope agent credentials to read-only

Once the API is reachable by token, the token is the entire security boundary. Mint a **read-only, least-privilege** credential for agent consumers rather than reusing an admin key:

```bash
# Least-privilege key for the MCP/agent client
mytool key create --name mcp-readonly --read-only   # scopes: ["read"]
```

Well-designed MCP adapters detect a read-only key at startup and narrow their advertised tool catalogue to read tools, so an agent is never offered a mutation it would be refused.

### Applies to any interactive-auth proxy

The pattern is identical for Cloudflare Access, Google IAP, oauth2-proxy, Authelia, or Tailscale Funnel with auth: **interactive auth for human paths, token auth for machine paths, and never both on the same path.**

Reference: [Cloudflare Access — bypass policies](https://developers.cloudflare.com/cloudflare-one/policies/access/) · [RFC 6750 — Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750) · [RFC 8555 §8.3 — ACME HTTP-01](https://datatracker.ietf.org/doc/html/rfc8555#section-8.3) · sibling rules `security-hardening`, `discovery-mcp-server-card`
