using Common.DatabaseModels.helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.users
{
    public class ShortUser
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public string BackgroundId { set; get; }
        [JsonConverter(typeof(StringEnumConverter))]
        public Language Language { set; get; }
        public Theme Theme { set; get; }
        public FontSize FontSize { set; get; }
    }
}
