using Common.DatabaseModels.helpers;
using MediatR;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Converters;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Domain.Commands.users
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public string Name { set; get; }
        public IFormFile Photo { set; get; }
        [Required]
        [JsonConverter(typeof(StringEnumConverter))]
        public Language Language { set; get; }
    }
}
