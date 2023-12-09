using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DTO.Notes.FullNoteContent.Text;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class NewTextContent
{
    [ValidationGuid]
    public Guid Id { set; get; }

    [RequiredEnumField]
    public NoteTextTypeENUM NoteTextTypeId { set; get; }

    [Required]
    public int Order { set; get; }
    
    public List<TextBlockDto> Contents { set; get; }
}
