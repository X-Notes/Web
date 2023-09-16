using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;

namespace Noots.Auth.Entities;

public class TokenVerifyRequest
{
    [Required]
    public string Token { set; get; }
    
    [RequiredEnumField(ErrorMessage = "Language Id is required.")]
    public LanguageENUM LanguageId { set; get; }
}
