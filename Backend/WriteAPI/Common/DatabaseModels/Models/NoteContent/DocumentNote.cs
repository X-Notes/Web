﻿using System;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table("DocumentNote")]
    public class DocumentNote : BaseNoteContent
    {
        public string Name { set; get; }
        public Guid AppFileId { get; set; }
        public AppFile AppFile { get; set; }

        public DocumentNote()
        {
            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Document;
        }

        public DocumentNote(DocumentNote entity, AppFile document, Guid NoteId)
        {
            this.NoteId = NoteId;
            Order = entity.Order;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Document;

            Name = entity.Name;

            AppFile = document;
        }

    }
}