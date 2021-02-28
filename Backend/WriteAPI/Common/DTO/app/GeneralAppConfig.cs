using Common.DatabaseModels.models;
using System.Collections.Generic;


namespace Common.DTO.app
{
    public class GeneralAppConfig
    {
        public List<FolderTypeDTO> FolderTypes { set; get; }
        public List<NoteTypeDTO> NoteTypes { set; get; }
        public List<RefTypeDTO> Refs { set; get; }
        public List<ThemeDTO> Themes { set; get; }
        public List<FontSizeDTO> FontSizes { set; get; }
        public List<LanguageDTO> Languages { set; get; }

        public GeneralAppConfig(List<FolderTypeDTO> FolderTypes,
                                List<NoteTypeDTO> NoteTypes,
                                List<RefTypeDTO> Refs,
                                List<ThemeDTO> Themes,
                                List<FontSizeDTO> FontSizes,
                                List<LanguageDTO> Languages)
        {
            this.FolderTypes = FolderTypes;
            this.NoteTypes = NoteTypes;
            this.Refs = Refs;
            this.Themes = Themes;
            this.FontSizes = FontSizes;
            this.Languages = Languages;
        }
    }
}
