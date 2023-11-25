using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO.Notes.FullNoteContent;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DTO.Notes.FullNoteContent.Text;
using Newtonsoft.Json;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class TextDiff
{
    [ValidationGuid]
    public Guid Id { set; get; }

    [Required]
    public ContentTypeEnumDTO TypeId { set; get; }

    [Required]
    public int Order { set; get; }

    [Required]
    public TextContentMetadataDto ContentMetadata { set; get; }
    
    public List<TextBlockDto> Contents { set; get; }
}
