using System;
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

        public DocumentNote(DocumentNote entity, Guid AppFileId, bool isHistory, Guid entityId)
        {
            this.SetId(isHistory, entityId);

            Order = entity.Order;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Document;

            Name = entity.Name;

            this.AppFileId = AppFileId;
        }

        public DocumentNote(DocumentNote entity, AppFile file, bool isHistory, Guid entityId)
        {
            this.SetId(isHistory, entityId);

            Order = entity.Order;

            this.UpdatedAt = DateTimeOffset.Now;
            this.ContentTypeId = ContentTypeENUM.Document;

            Name = entity.Name;

            this.AppFile = file;
        }

    }
}
