using Common.DTO.app;
using Common.DTO.backgrounds;
using System;

namespace Common.DTO.users
{
    public class ShortUser
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
        public BackgroundDTO CurrentBackground { set; get; }
        public LanguageDTO Language { set; get; }
        public ThemeDTO Theme { set; get; }
        public FontSizeDTO FontSize { set; get; }
    }
}
