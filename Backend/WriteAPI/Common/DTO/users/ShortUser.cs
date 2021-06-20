using Common.DatabaseModels.models.Systems;
using Common.DTO.app;
using Common.DTO.backgrounds;
using System;

namespace Common.DTO.users
{
    public class ShortUser
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
        public BackgroundDTO CurrentBackground { set; get; }
        public LanguageENUM LanguageId { set; get; }
        public ThemeENUM ThemeId { set; get; }
        public FontSizeENUM FontSizeId { set; get; }
    }
}
