using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class TextDiff
{
    [ValidationGuid]
    public Guid Id { set; get; }

    [Required]
    public ContentTypeEnumDTO TypeId { set; get; }

    [Required]
    public int Order { set; get; }

    [RequiredEnumField]
    public NoteTextTypeENUM NoteTextTypeId { set; get; }

    public bool? Checked { set; get; }

    public HTypeENUM? HeadingTypeId { set; get; }

    public List<TextBlock> Contents { set; get; }
}
