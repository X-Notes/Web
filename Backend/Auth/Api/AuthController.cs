using System.Security.Claims;
using Auth.Entities;
using Auth.Interfaces;
using Common;
using Common.DTO;
using Common.Google;
using DatabaseContext.Dapper.Reps;
using DatabaseContext.Repositories.Users;
using Google.Apis.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Users.Commands;

namespace Auth.Api;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IOptions<GoogleAuth> googleAuth,
        ILogger<AuthController> logger,
        IJwtAuthManager jwtAuthManager,
        UserRepository userRepository,
        IMediator mediator,
        DapperRefreshTokenRepository dapperRefreshTokenRepository)
    : ControllerBase
{
    private readonly GoogleAuth googleAuth = googleAuth.Value;

    [HttpPost("google/login")]
    public async Task<OperationResult<LoginResultDto>> VerifyToken(TokenVerifyRequest request)
    {
        var respVerifyToken = await VerifyGoogleTokenId(request);

        if(respVerifyToken == null)
        {
            return new OperationResult<LoginResultDto>(false, null, OperationResultAdditionalInfo.AnotherError);
        }

        var user = await userRepository.FirstOrDefaultAsync(x => x.Email == respVerifyToken.Email);
        if (user == null)
        {
            var newUserCommand = new NewUserCommand(respVerifyToken.Name, respVerifyToken.Email, respVerifyToken.Picture, request.LanguageId);
            var res = await mediator.Send(newUserCommand);
            if (!res.Success)
            {
                return new OperationResult<LoginResultDto>(false, null, OperationResultAdditionalInfo.AnotherError);
            }

            user = await userRepository.FirstOrDefaultAsync(x => x.Id == res.Data);
        }

        var claims = new List<Claim> { new Claim(ConstClaims.UserEmail, user.Email), new Claim(ConstClaims.UserId, user.Id.ToString()) };
        var result = await jwtAuthManager.GenerateTokens(user.Id, claims.ToArray());
        
        var options = new CookieOptions()
        {
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.Now.AddDays(30)
        };
        Response.Cookies.Append("isLoggedIn", "1", options);
        
        return new OperationResult<LoginResultDto>(true, new LoginResultDto(result.AccessToken, result.RefreshToken.TokenString));
    }

    [HttpPost("refresh")]
    public async Task<OperationResult<RefreshResultDto>> Refresh(RefreshCommand command)
    {
        if (string.IsNullOrEmpty(command.RefreshToken) || string.IsNullOrEmpty(command.AccessToken))
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Tokens Empty");
        }

        var resp = jwtAuthManager.DecodeJwtToken(command.AccessToken);

        if (resp.IsShouldRevoked)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Invalid Token");
        }

        var claim = resp.Principal?.Claims.FirstOrDefault(x => x.Type == ConstClaims.UserId);

        if(claim == null)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Invalid Token");
        }

        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(claim.Value));
        if (user == null)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Invalid Token");
        }

        var savedRefreshToken = await dapperRefreshTokenRepository.GetRefreshToken(user.Id, command.RefreshToken);

        if (savedRefreshToken == null)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Token not found");
        }
        if (savedRefreshToken.IsProcessing)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Token Processing");
        }

        var affectedRows = await dapperRefreshTokenRepository.SoftLockTokenAsync(user.Id, command.RefreshToken);

        if (affectedRows == 0 || DateTimeProvider.Time > savedRefreshToken.ExpireAt)
        {
            await dapperRefreshTokenRepository.RemoveTokenAsync(user.Id, command.RefreshToken);
            return new OperationResult<RefreshResultDto>(false, null!, "Token expired");
        }

        var claims = new List<Claim> { new Claim(ConstClaims.UserEmail, user.Email), new Claim(ConstClaims.UserId, user.Id.ToString()) };
        var newJwtToken = await jwtAuthManager.GenerateTokens(user.Id, claims.ToArray());

        if (newJwtToken == null)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Invalid attempt!");
        }

        var deletedRows = await dapperRefreshTokenRepository.RemoveTokenAsync(user.Id, command.RefreshToken);
        if (deletedRows == 0)
        {
            return new OperationResult<RefreshResultDto>(false, null!, "Token has already processed");
        }
        
        return new OperationResult<RefreshResultDto>(true, new RefreshResultDto(newJwtToken.AccessToken, newJwtToken.RefreshToken.TokenString));
    }


    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> ClearSessionCookie([FromQuery]string refreshToken)
    {
        var uid = this.GetUserIdUnStrict();
        if (uid != Guid.Empty)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == uid);
            if (user != null)
            {
                await jwtAuthManager.RemoveRefreshToken(user.Id, refreshToken!);
            }
        }
        
        Response.Cookies.Delete("isLoggedIn");
        
        return Ok();
    }

    private async Task<GoogleJsonWebSignature.Payload> VerifyGoogleTokenId(TokenVerifyRequest request)
    {
        try
        {
            // uncomment these lines if you want to add settings: 
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            { 
                Audience = new[] { request.IsIos ? googleAuth.IosAudience : googleAuth.Audience }
            };
            // Add your settings and then get the payload
            GoogleJsonWebSignature.Payload payload =  await GoogleJsonWebSignature.ValidateAsync(request.Token, validationSettings);

            return payload;
        }
        catch (Exception e)
        {
            logger.LogError("invalid google token");
        }

        return null;
    }
}