using Noots.Auth.Entities;
using System.Security.Claims;

namespace Noots.Auth.Interfaces;

public interface IJwtAuthManager
{
    Task<JwtAuthResult> GenerateTokens(Guid userId, Claim[] claims);
    Task RemoveRefreshToken(Guid userId, string token);
    DecodeJWTResult DecodeJwtToken(string token);
}
