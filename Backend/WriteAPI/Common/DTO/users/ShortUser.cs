using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Common.DTO.app;
using Common.DTO.backgrounds;
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
        public Guid PhotoId { set; get; }
        public BackgroundDTO CurrentBackground { set; get; }
        public LanguageDTO Language { set; get; }
        public ThemeDTO Theme { set; get; }
        public FontSizeDTO FontSize { set; get; }
    }
}
