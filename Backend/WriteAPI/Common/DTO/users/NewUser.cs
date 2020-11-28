using Common.DatabaseModels.helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.ComponentModel.DataAnnotations;

namespace Common.DTO.users
{
    public class NewUser
    {
        [Required]
        public string Name { set; get; }
        public string PhotoId { set; get; }
        [Required]
        [JsonConverter(typeof(StringEnumConverter))]
        public Language language { set; get; }
    }
}
