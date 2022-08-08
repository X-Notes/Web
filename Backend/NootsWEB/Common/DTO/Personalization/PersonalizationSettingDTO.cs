using Common.DatabaseModels.Models.Users;

namespace Common.DTO.Personalization
{
    public class PersonalizationSettingDTO
    {
        public int NotesInFolderCount { set; get; }

        public int ContentInNoteCount { set; get; }

        public bool IsViewVideoOnNote { set; get; }

        public bool IsViewAudioOnNote { set; get; }

        public bool IsViewPhotosOnNote { set; get; }

        public bool IsViewTextOnNote { set; get; }

        public bool IsViewDocumentOnNote { set; get; }

        public SortedByENUM SortedNoteByTypeId { set; get; }

        public SortedByENUM SortedFolderByTypeId { set; get; }

        public PersonalizationSettingDTO GetDefault()
        {
            NotesInFolderCount = 10;
            ContentInNoteCount = 10;

            IsViewVideoOnNote = true;
            IsViewAudioOnNote = true;
            IsViewDocumentOnNote = true;    
            IsViewPhotosOnNote = true;
            IsViewTextOnNote = true;

            return this;
        }
    }
}
