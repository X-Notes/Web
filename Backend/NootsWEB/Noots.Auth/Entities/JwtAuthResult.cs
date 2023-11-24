using Common.DatabaseModels.Models.Security;
using Newtonsoft.Json;

namespace Auth.Entities;

public class JwtAuthResult
{
    [JsonProperty("accessToken")]
    public string AccessToken { get; set; }

    [JsonProperty("refreshToken")]
    public RefreshToken RefreshToken { get; set; }
}
