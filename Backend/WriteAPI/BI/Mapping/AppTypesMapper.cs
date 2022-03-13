using Common.Azure;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.App;


namespace BI.Mapping
{
    public class AppTypesMapper : BaseMapper
    {
        public AppTypesMapper(AzureConfig azureConfig) : base(azureConfig)
        {
        }

        public LanguageDTO MapToLanguageDTO(Language language)
        {
            return new LanguageDTO
            {
                Id = language.Id,
                Name = language.Name,
            };
        }

        public ThemeDTO MapToThemeDTO(Theme theme)
        {
            return new ThemeDTO
            {
                Id = theme.Id,
                Name = theme.Name,
            };
        }

        public FontSizeDTO MapToFontSizeDTO(FontSize fontSize)
        {
            return new FontSizeDTO
            {
                Id = fontSize.Id,
                Name = fontSize.Name,
            };
        }

        public RefTypeDTO MapToRefTypeDTO(RefType refType)
        {
            return new RefTypeDTO
            {
                Id = refType.Id,
                Name = refType.Name,
            };
        }

        public FolderTypeDTO MapToFolderTypeDTO(FolderType folderTypeDTO)
        {
            return new FolderTypeDTO
            {
                Id = folderTypeDTO.Id,
                Name = folderTypeDTO.Name,
            };
        }

        public NoteTypeDTO MapToNoteTypeDTO(NoteType noteType)
        {
            return new NoteTypeDTO
            {
                Id = noteType.Id,
                Name = noteType.Name,
            };
        }
    }
}
