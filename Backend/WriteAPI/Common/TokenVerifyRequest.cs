using System;
using System.ComponentModel.DataAnnotations;

namespace Common
{
    public class TokenVerifyRequest
    {
        [Required]
        public string Token { set; get; }
    }
}
