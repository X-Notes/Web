using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.Systems;

namespace Auth.Entities;

public class TokenVerifyRequest
{
    [Required]
    public string Token { set; get; }
    
    [RequiredEnumField(ErrorMessage = "Language Id is required.")]
    public LanguageENUM LanguageId { set; get; }
    
    public bool IsIos { set; get; }
}
