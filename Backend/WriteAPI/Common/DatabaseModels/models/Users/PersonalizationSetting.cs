using System;

namespace Common.DatabaseModels.Models.Users
{
    public class PersonalizationSetting : BaseEntity<Guid>
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public int NotesInFolderCount { set; get; }

        public bool IsViewVideoOnNote { set; get; }

        public bool IsViewAudioOnNote { set; get; }

        public bool IsViewPhotosOnNote { set; get; }

        public bool IsViewTextOnNote { set; get; }

        public bool IsViewDocumentOnNote { set; get; }

        public PersonalizationSetting GetNewFactory(Guid userId)
        {
            NotesInFolderCount = 5;
            IsViewVideoOnNote = true;
            IsViewAudioOnNote = true;
            IsViewAudioOnNote = true;
            IsViewPhotosOnNote = true;
            IsViewTextOnNote = true;
            IsViewDocumentOnNote = true;
            UserId = userId;

            return this;
        }

    }
}
