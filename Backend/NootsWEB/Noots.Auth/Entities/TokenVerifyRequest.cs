using System.ComponentModel.DataAnnotations;

namespace Noots.Auth.Entities;

public class TokenVerifyRequest
{
    [Required]
    public string Token { set; get; }
}
