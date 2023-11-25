using System.Security.Claims;
using Auth.Entities;

namespace Auth.Interfaces;

public interface IJwtAuthManager
{
    Task<JwtAuthResult> GenerateTokens(Guid userId, Claim[] claims);
    Task RemoveRefreshToken(Guid userId, string token);
    DecodeJWTResult DecodeJwtToken(string token);
}
