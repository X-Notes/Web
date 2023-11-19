namespace Noots.Auth.Entities;

public class LoginResultDto
{
    public string AccessToken { set; get; }
    
    public string RefreshToken { set; get; }

    public LoginResultDto(string accessToken, string refreshToken)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
    }
}