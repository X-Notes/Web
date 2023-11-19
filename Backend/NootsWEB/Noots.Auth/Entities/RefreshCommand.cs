namespace Noots.Auth.Entities;

public class RefreshCommand
{
    public string AccessToken { set; get; }
    
    public string RefreshToken { set; get; }

    public RefreshCommand(string accessToken, string refreshToken)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
    }
}