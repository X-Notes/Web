using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using WriteContext.helpers;

namespace Common.DTO.users
{
    public class NewUser
    {
        public string Name { set; get; }
        public string PhotoId { set; get; }
        [JsonConverter(typeof(StringEnumConverter))]
        public Language language { set; get; }
    }
}
