using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Contents;

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
            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.DocumentsCollection;
        }

        public DocumentsCollectionNote(DocumentsCollectionNote entity, List<DocumentNoteAppFile> documentNoteAppFiles, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = entity.Order;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.DocumentsCollection;

            Name = entity.Name;

            DocumentNoteAppFiles = documentNoteAppFiles;
        }

        public DocumentsCollectionNote(DocumentsCollectionNote entity, List<AppFile> documents, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = entity.Order;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.DocumentsCollection;

            Name = entity.Name;

            Documents = documents;
        }

    }
}
