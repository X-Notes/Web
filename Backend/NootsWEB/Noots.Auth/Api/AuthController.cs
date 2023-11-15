using Common;
using Common.DTO;
using Common.Google;
using Google.Apis.Auth;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Noots.Auth.Entities;
using Noots.Auth.Interfaces;
using Noots.DatabaseContext.Dapper.Reps;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Users.Commands;
using System.Security.Claims;

namespace Noots.Auth.Api;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly GoogleAuth googleAuth;
    private readonly ILogger<AuthController> logger;
    private readonly IJwtAuthManager jwtAuthManager;
    private readonly UserRepository userRepository;
    private readonly IMediator mediator;
    private readonly DapperRefreshTokenRepository dapperRefreshTokenRepository;

    public AuthController(
        GoogleAuth googleAuth, 
        ILogger<AuthController> logger, 
        IJwtAuthManager jwtAuthManager,
        UserRepository userRepository,
        IMediator mediator,
        DapperRefreshTokenRepository dapperRefreshTokenRepository)
    {
        this.googleAuth = googleAuth;
        this.logger = logger;
        this.jwtAuthManager = jwtAuthManager;
        this.userRepository = userRepository;
        this.mediator = mediator;
        this.dapperRefreshTokenRepository = dapperRefreshTokenRepository;
    }

    [HttpPost("google/login")]
    public async Task<OperationResult<Unit>> VerifyToken(TokenVerifyRequest request)
    {
        var respVerifyToken = await VerifyGoogleTokenId(request.Token);

        if(respVerifyToken == null)
        {
            return new OperationResult<Unit>(false, Unit.Value, OperationResultAdditionalInfo.AnotherError);
        }

        var user = await userRepository.FirstOrDefaultAsync(x => x.Email == respVerifyToken.Email);
        if (user == null)
        {
            var newUserCommand = new NewUserCommand(respVerifyToken.Name, respVerifyToken.Email, respVerifyToken.Picture, request.LanguageId);
            var res = await mediator.Send(newUserCommand);
            if (!res.Success)
            {
                return new OperationResult<Unit>(false, Unit.Value, OperationResultAdditionalInfo.AnotherError);
            }

            user = await userRepository.FirstOrDefaultAsync(x => x.Id == res.Data);
        }

        var claims = new List<Claim> { new Claim(ConstClaims.UserEmail, user.Email), new Claim(ConstClaims.UserId, user.Id.ToString()) };
        var result = await jwtAuthManager.GenerateTokens(user.Id, claims.ToArray());
        InitCookiesTokens(result.AccessToken, result.RefreshToken.TokenString);

        return new OperationResult<Unit>(true, Unit.Value);
    }

    [HttpPost("refresh")]
    public async Task<OperationResult<bool>> Refresh()
    {
        var accessToken = this.GetAccessToken();
        var refreshToken = this.GetRefreshToken();

        if (string.IsNullOrEmpty(refreshToken) || string.IsNullOrEmpty(accessToken))
        {
            return new OperationResult<bool>(false, false, "Tokens Empty");
        }

        var resp = jwtAuthManager.DecodeJwtToken(accessToken);

        if (resp.IsShouldRevoked)
        {
            return new OperationResult<bool>(false, true, "Invalid Token");
        }

        var claim = resp.Principal?.Claims.FirstOrDefault(x => x.Type == ConstClaims.UserId);

        if(claim == null)
        {
            return new OperationResult<bool>(false, true, "Invalid Token");
        }

        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(claim.Value));
        if (user == null)
        {
            return new OperationResult<bool>(false, true, "Invalid Token");
        }

        var savedRefreshToken = await dapperRefreshTokenRepository.GetRefreshToken(user.Id, refreshToken);

        if (savedRefreshToken == null)
        {
            return new OperationResult<bool>(false, true, "Token not found");
        }
        if (savedRefreshToken.IsProcessing)
        {
            return new OperationResult<bool>(false, true, "Token Processing");
        }

        var affectedRows = await dapperRefreshTokenRepository.SoftLockTokenAsync(user.Id, refreshToken);

        if (affectedRows == 0 || DateTimeProvider.Time.UtcDateTime > savedRefreshToken.ExpireAt)
        {
            await dapperRefreshTokenRepository.RemoveTokenAsync(user.Id, refreshToken);
            return new OperationResult<bool>(false, true, "Token expired");
        }

        var claims = new List<Claim> { new Claim(ConstClaims.UserEmail, user.Email), new Claim(ConstClaims.UserId, user.Id.ToString()) };
        var newJwtToken = await jwtAuthManager.GenerateTokens(user.Id, claims.ToArray());

        if (newJwtToken == null)
        {
            return new OperationResult<bool>(false, false, "Invalid attempt!");
        }

        var deletedRows = await dapperRefreshTokenRepository.RemoveTokenAsync(user.Id, refreshToken);
        if (deletedRows == 0)
        {
            return new OperationResult<bool>(false, true, "Token has already processed");
        }

        InitCookiesTokens(newJwtToken.AccessToken, newJwtToken.RefreshToken.TokenString);

        return new OperationResult<bool>(true, true);
    }


    [HttpPost("logout")]
    public async Task<IActionResult> ClearSessionCookie()
    {
        if (Request.Cookies.ContainsKey(ConstClaims.AccessToken))
        {
            Response.Cookies.Delete(ConstClaims.AccessToken);
        }

        if (Request.Cookies.ContainsKey(ConstClaims.RefreshToken))
        {
            var uid = this.GetUserIdUnStrict();
            if (uid != Guid.Empty)
            {
                var user = await userRepository.FirstOrDefaultAsync(x => x.Id == uid);
                if (user != null)
                {
                    var token = Request.Cookies[ConstClaims.RefreshToken];
                    await jwtAuthManager.RemoveRefreshToken(uid, token!);
                }
            }
            Response.Cookies.Delete(ConstClaims.RefreshToken);
        }

        return Ok();
    }

    private async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenId(string token)
    {
        try
        {
            // uncomment these lines if you want to add settings: 
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            { 
                Audience = new string[] { googleAuth.Audience }
            };
            // Add your settings and then get the payload
            GoogleJsonWebSignature.Payload payload =  await GoogleJsonWebSignature.ValidateAsync(token, validationSettings);

            return payload;
        }
        catch (Exception e)
        {
            logger.LogError("invalid google token");
        }

        return null;
    }

    private void InitCookiesTokens(string accessToken, string refreshToken)
    {
        // Set cookie policy parameters as required.
        var cookieOptions = new CookieOptions
        {
            SameSite = SameSiteMode.None,
            HttpOnly = true,
            Secure = false,
            Expires = DateTimeOffset.UtcNow.AddDays(5)
        };

        Response.Cookies.Append(ConstClaims.AccessToken, accessToken, cookieOptions);
        Response.Cookies.Append(ConstClaims.RefreshToken, refreshToken, cookieOptions);
    }
}