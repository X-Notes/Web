using Common;
using Common.DatabaseModels.Models.Security;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Noots.Auth.Entities;
using Noots.Auth.Interfaces;
using Noots.DatabaseContext.Dapper.Reps;
using Noots.DatabaseContext.Repositories.Sec;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Noots.Auth.Impl;

public class JwtAuthManager : IJwtAuthManager
{
    private readonly JwtTokenConfig _jwtTokenConfig;
    private readonly DapperRefreshTokenRepository dapperRefreshToken;
    private readonly byte[] _secret;
    private readonly ILogger<JwtAuthManager> logger;
    private readonly RefreshTokenRepository refreshTokenRepository;

    public JwtAuthManager(
        JwtTokenConfig jwtTokenConfig, 
        DapperRefreshTokenRepository dapperRefreshToken, 
        ILogger<JwtAuthManager> logger,
        RefreshTokenRepository refreshTokenRepository)
    {
        _jwtTokenConfig = jwtTokenConfig;
        this.dapperRefreshToken = dapperRefreshToken;
        _secret = Encoding.ASCII.GetBytes(jwtTokenConfig.Secret);
        this.logger = logger;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public async Task RemoveRefreshToken(Guid userId, string token)
    {
        await dapperRefreshToken.RemoveTokenAsync(userId, token);
    }

    public async Task<JwtAuthResult> GenerateTokens(Guid userId, Claim[] claims)
    {
        var now = DateTimeProvider.Time;

        var jwtToken = new JwtSecurityToken(
           issuer: _jwtTokenConfig.Issuer,
           audience: _jwtTokenConfig.Audience,
           claims: claims,
           expires: now.AddMinutes(_jwtTokenConfig.AccessTokenExpiration).UtcDateTime,
           signingCredentials: new SigningCredentials(new SymmetricSecurityKey(_secret), SecurityAlgorithms.HmacSha256Signature));

        var accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            TokenString = GenerateRefreshTokenString(),
            ExpireAt = now.AddMinutes(_jwtTokenConfig.RefreshTokenExpiration).UtcDateTime
        };

        await refreshTokenRepository.AddAsync(refreshToken);

        return new JwtAuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    public DecodeJWTResult DecodeJwtToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new SecurityTokenException("Invalid token");
        }

        var options = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidIssuer = _jwtTokenConfig.Issuer,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(_secret),
            ValidAudience = _jwtTokenConfig.Audience,
            ValidateAudience = false,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(token, options, out var validatedToken);
            return new DecodeJWTResult(principal, validatedToken as JwtSecurityToken, false);
        }
        catch (Exception e)
        {
            logger.LogError(e.ToString());
            return new DecodeJWTResult(null, null, true);
        }      
    }

    private static string GenerateRefreshTokenString()
    {
        var randomNumber = new byte[32];
        using var randomNumberGenerator = RandomNumberGenerator.Create();
        randomNumberGenerator.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}
