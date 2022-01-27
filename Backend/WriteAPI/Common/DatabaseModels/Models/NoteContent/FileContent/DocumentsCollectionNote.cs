using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(DocumentsCollectionNote), Schema = SchemeConfig.NoteContent)]
    public class DocumentsCollectionNote : BaseNoteContent
    {
        public string Name { set; get; }

        public List<AppFile> Documents { set; get; }
        public List<DocumentNoteAppFile> DocumentNoteAppFiles { set; get; }

        public DocumentsCollectionNote()
        {
            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.DocumentsCollection;
        }

        public DocumentsCollectionNote(DocumentsCollectionNote entity, List<DocumentNoteAppFile> documentNoteAppFiles, Guid noteId)
        {
            NoteId = noteId;

            Order = entity.Order;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.DocumentsCollection;

            Name = entity.Name;

            DocumentNoteAppFiles = documentNoteAppFiles;
        }

        public DocumentsCollectionNote(DocumentsCollectionNote entity, List<AppFile> documents, Guid noteId)
        {
            NoteId = noteId;

            Order = entity.Order;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.DocumentsCollection;

            Name = entity.Name;

            Documents = documents;
        }

        public override IEnumerable<Guid> GetInternalFilesIds()
        {
            return Documents.Select(x => x.Id);
        }
    }
}
