using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Users;
using System.Collections.Generic;

namespace Common.DTO.Personalization;

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


    public int GetNotesInFolderCount() => NotesInFolderCount > PersonalizationConstants.maxNotesInFolderCount ? PersonalizationConstants.maxNotesInFolderCount : NotesInFolderCount;

    public int GetContentInNoteCount() => ContentInNoteCount > PersonalizationConstants.maxContentInNoteCount ? PersonalizationConstants.maxContentInNoteCount : ContentInNoteCount;

    public PersonalizationSettingDTO GetDefault()
    {
        NotesInFolderCount = PersonalizationConstants.defaultNotesInFolderCount;
        ContentInNoteCount = PersonalizationConstants.defaultContentInNoteCount;

        IsViewVideoOnNote = true;
        IsViewAudioOnNote = true;
        IsViewDocumentOnNote = true;
        IsViewPhotosOnNote = true;
        IsViewTextOnNote = true;

        return this;
    }

    public List<FileTypeEnum> GetFileTypes()
    {
        var list = new List<FileTypeEnum>();

        if (IsViewAudioOnNote)
        {
            list.Add(FileTypeEnum.Audio);
        }
        if (IsViewDocumentOnNote)
        {
            list.Add(FileTypeEnum.Document);
        }
        if (IsViewPhotosOnNote)
        {
            list.Add(FileTypeEnum.Photo);
        }
        if (IsViewVideoOnNote)
        {
            list.Add(FileTypeEnum.Video);
        }

        return list;
    }

    public PersonalizationSettingDTO GetRelated()
    {
        NotesInFolderCount = PersonalizationConstants.defaultNotesInFolderCount;
        ContentInNoteCount = PersonalizationConstants.defaultContentsInRelatedNoteCount;

        IsViewVideoOnNote = true;
        IsViewAudioOnNote = true;
        IsViewDocumentOnNote = true;
        IsViewPhotosOnNote = true;
        IsViewTextOnNote = true;

        return this;
    }
}