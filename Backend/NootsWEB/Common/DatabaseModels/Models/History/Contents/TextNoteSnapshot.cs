using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.Helpers;
using Common.Interfaces.Note;
using Noots.RGA_CRDT;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class TextNoteSnapshot : BaseNoteContentSnapshot, INoteText<List<TextBlock>>
    {
        public List<TextBlock> Contents { set; get; }

        public NoteTextTypeENUM NoteTextTypeId { set; get; }

        public HTypeENUM? HTypeId { set; get; }

        public bool? Checked { set; get; }

        public TextNoteSnapshot
            (List<TextBlock> contents, NoteTextTypeENUM noteTextTypeId, HTypeENUM? hTypeId, bool? @checked,
            int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Contents = contents;
            NoteTextTypeId = noteTextTypeId;
            HTypeId = hTypeId;
            Checked = @checked; 
        }

        public string GetContentsJson()
        {
            return Contents.JSerialize();
        }
    }
}
