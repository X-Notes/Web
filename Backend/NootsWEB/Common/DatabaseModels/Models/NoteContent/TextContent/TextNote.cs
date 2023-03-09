﻿using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.Helpers;
using Common.Interfaces.Note;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.NoteContent.TextContent
{
    [Table(nameof(TextNote), Schema = SchemeConfig.NoteContent)]
    public class TextNote : BaseNoteContent, INoteText<string>
    {
        [Column(TypeName = "jsonb")]
        public string Contents { set; get; }

        public NoteTextTypeENUM NoteTextTypeId { set; get; }
        public NoteTextType NoteTextType { set; get; }

        public HTypeENUM? HTypeId { set; get; }
        public HType HType { set; get; }

        public bool? Checked { set; get; }

        [NotMapped]
        public int ListId { set; get; }

        public TextNote()
        {
            ContentTypeId = ContentTypeENUM.Text;
        }

        public TextNote(TextNote text, Guid noteId)
        {
            NoteId = noteId;

            Order = text.Order;

            Contents = text.Contents;
            NoteTextTypeId = text.NoteTextTypeId;
            HTypeId = text.HTypeId;
            Checked = text.Checked;

            ContentTypeId = ContentTypeENUM.Text;
        }

        public void SetContents(List<TextBlock> contents)
        {
            Contents = contents.JSerialize();
        }

        public List<TextBlock> GetContents()
        {
            return Contents.JDeserializeObject<List<TextBlock>>();
        }
    }
}
