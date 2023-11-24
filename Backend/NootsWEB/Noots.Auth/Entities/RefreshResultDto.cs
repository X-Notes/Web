namespace Auth.Entities;

public class RefreshResultDto
{
    public string AccessToken { set; get; }
    
    public string RefreshToken { set; get; }

    public RefreshResultDto(string accessToken, string refreshToken)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
    }
}