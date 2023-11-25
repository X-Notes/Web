using Common.DatabaseModels.Models.Notes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.NoteContent.TextContent;


[Table(nameof(TextNoteIndex), Schema = SchemeConfig.NoteContent)]
public class TextNoteIndex : BaseEntity<Guid>
{
    [NotMapped]
    public override Guid Id { set; get; }

    public Guid TextNoteId { set; get; }
    public TextNote TextNote { set; get; }

    public Guid NoteId { set; get; }
    public Note Note { set; get;  }

    public int Version { set; get; }

    public string Content { set; get; }
}
