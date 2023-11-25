using Common.Attributes;
using Common.DTO.Notes.FullNoteContent;
using System;
using System.ComponentModel.DataAnnotations;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class NewCollectionContent
{
    [ValidationGuidAttribute]
    public Guid Id { set; get; }

    [Required]
    public ContentTypeEnumDTO TypeId { set; get; }

    [Required]
    public int Order { set; get; }
}
