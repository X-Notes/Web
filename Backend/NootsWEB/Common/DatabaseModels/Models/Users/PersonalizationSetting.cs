using Common.DTO.Personalization;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.Users
{
    [Table(nameof(PersonalizationSetting), Schema = SchemeConfig.User)]
    public class PersonalizationSetting : BaseEntity<Guid>
    {
        public Guid UserId { set; get; }
        public User User { set; get; }

        public SortedByENUM SortedNoteByTypeId { set; get; }
        public SortedByType SortedNoteByType { set; get; }

        public SortedByENUM SortedFolderByTypeId { set; get; }
        public SortedByType SortedFolderByType { set; get; }


        public int NotesInFolderCount { set; get; }

        public int ContentInNoteCount { set; get; }

        public bool IsViewVideoOnNote { set; get; }

        public bool IsViewAudioOnNote { set; get; }

        public bool IsViewPhotosOnNote { set; get; }

        public bool IsViewTextOnNote { set; get; }

        public bool IsViewDocumentOnNote { set; get; }

        [NotMapped]
        public bool HasUpdates { set; get; }

        public PersonalizationSetting GetNewFactory(Guid userId)
        {         
            ContentInNoteCount = PersonalizationConstants.defaultContentInNoteCount;
            NotesInFolderCount = PersonalizationConstants.defaultNotesInFolderCount;

            IsViewVideoOnNote = true;
            IsViewAudioOnNote = true;
            IsViewAudioOnNote = true;
            IsViewPhotosOnNote = true;
            IsViewTextOnNote = true;
            IsViewDocumentOnNote = true;

            SortedNoteByTypeId = SortedByENUM.CustomOrder;
            SortedFolderByTypeId = SortedByENUM.CustomOrder;

            UserId = userId;

            return this;
        }

        public void UpdateSortSettings(PersonalizationSettingDTO pS)
        {
            SortedNoteByTypeId = pS.SortedNoteByTypeId;
            SortedFolderByTypeId = pS.SortedFolderByTypeId;
        }

        public void UpdatePersonalizationSettings(PersonalizationSettingDTO pS)
        {
            IsViewAudioOnNote = pS.IsViewAudioOnNote;
            IsViewDocumentOnNote = pS.IsViewDocumentOnNote;
            IsViewPhotosOnNote = pS.IsViewPhotosOnNote;
            IsViewTextOnNote = pS.IsViewTextOnNote;
            IsViewVideoOnNote = pS.IsViewVideoOnNote;

            NotesInFolderCount = pS.GetNotesInFolderCount();
            ContentInNoteCount = pS.GetContentInNoteCount();
        }

        public bool SetUpdateStatus(PersonalizationSettingDTO pS)
        {
            if (SortedNoteByTypeId != pS.SortedNoteByTypeId ||
                SortedFolderByTypeId != pS.SortedFolderByTypeId ||
                IsViewAudioOnNote != pS.IsViewAudioOnNote ||
                IsViewDocumentOnNote != pS.IsViewDocumentOnNote ||
                IsViewPhotosOnNote != pS.IsViewPhotosOnNote ||
                IsViewTextOnNote != pS.IsViewTextOnNote ||
                IsViewVideoOnNote != pS.IsViewVideoOnNote ||
                NotesInFolderCount != pS.GetNotesInFolderCount() ||
                ContentInNoteCount != pS.GetContentInNoteCount()
            )
            {
                HasUpdates = true;
            }

            return HasUpdates;
        }
    }
}
