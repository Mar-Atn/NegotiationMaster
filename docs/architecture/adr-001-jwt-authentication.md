# ADR-001: JWT Authentication with Refresh Token Rotation

## Status
Accepted

## Context
The NegotiationMaster application requires secure user authentication for accessing negotiation sessions, tracking progress, and managing user data. We need to choose an authentication strategy that provides:

- Stateless authentication for scalability
- Secure token management
- Protection against token theft
- Reasonable user experience (not requiring frequent re-authentication)
- Support for multiple devices/sessions

Traditional session-based authentication requires server-side session storage, which doesn't scale well across multiple servers. Simple JWT tokens without refresh mechanisms have security concerns if compromised.

## Decision
We will implement JWT-based authentication with refresh token rotation:

1. **Access Tokens**: Short-lived (15 minutes) JWT tokens for API access
2. **Refresh Tokens**: Longer-lived (7 days) tokens stored in database for obtaining new access tokens
3. **Token Rotation**: Refresh tokens are rotated (invalidated and replaced) on each use
4. **Device Tracking**: Refresh tokens are associated with User-Agent for device identification
5. **Revocation Support**: Ability to revoke all tokens for a user (logout from all devices)

## Consequences

### Positive
- **Scalability**: Stateless access tokens don't require server-side storage
- **Security**: Short-lived access tokens limit exposure window if compromised
- **Token Rotation**: Prevents long-term use of stolen refresh tokens
- **Multi-device Support**: Each device gets its own refresh token
- **Granular Control**: Can revoke tokens per device or all devices
- **Performance**: No database lookup required to validate access tokens

### Negative
- **Complexity**: More complex than simple session-based authentication
- **Database Storage**: Refresh tokens require database storage and cleanup
- **Token Management**: Frontend must handle token refresh logic
- **Immediate Revocation**: Access tokens can't be immediately revoked (must wait for expiration)

### Neutral
- **Standards Compliance**: Follows OAuth 2.0 refresh token patterns
- **Library Support**: Well-supported by JWT libraries
- **Documentation**: Industry-standard approach with good documentation

## Implementation
1. Use `jsonwebtoken` library for JWT operations
2. Store refresh tokens in `refresh_tokens` table with user association
3. Implement automatic cleanup of expired refresh tokens
4. Add middleware for token validation and refresh
5. Frontend axios interceptors for automatic token refresh
6. Secure token storage using httpOnly cookies or secure localStorage

## References
- [RFC 6749: OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [RFC 7519: JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)