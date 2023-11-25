using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Auth.Entities;

public class DecodeJWTResult
{
    public ClaimsPrincipal? Principal { set; get; }

    public JwtSecurityToken? Token { set; get; }

    public bool IsShouldRevoked { set; get; }

    public DecodeJWTResult(ClaimsPrincipal? principal, JwtSecurityToken? token, bool isShouldRevoked)
    {
        Principal = principal;
        Token = token;
        IsShouldRevoked = isShouldRevoked;
    }
}
