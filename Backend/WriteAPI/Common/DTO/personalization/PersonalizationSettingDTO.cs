using Common.DatabaseModels.models.Users;

namespace Common.DTO.personalization
{
    public class PersonalizationSettingDTO
    {
        public int NotesInFolderCount { set; get; }

        public bool IsViewVideoOnNote { set; get; }

        public bool IsViewAudioOnNote { set; get; }

        public bool IsViewPhotosOnNote { set; get; }

        public bool IsViewTextOnNote { set; get; }

        public bool IsViewDocumentOnNote { set; get; }

    }
}
