using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DTO.Notes.FullNoteContent.Text;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class NewTextContent
{
    [ValidationGuidAttribute]
    public Guid Id { set; get; }

    [RequiredEnumFieldAttribute]
    public NoteTextTypeENUM NoteTextTypeId { set; get; }

    [Required]
    public int Order { set; get; }

    [Required]
    public ContentTypeEnumDTO TypeId { set; get; }

    public List<TextBlockDto> Contents { set; get; }
}
