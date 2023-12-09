using Common.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DTO.Notes.FullNoteContent.Text;

namespace Common.DTO.Notes.FullNoteSyncContents;

public class TextDiff
{
    [ValidationGuid]
    public Guid Id { set; get; }
    
    [Required]
    public TextContentMetadataDto ContentMetadata { set; get; }
    
    public List<TextBlockDto> Contents { set; get; }
}
