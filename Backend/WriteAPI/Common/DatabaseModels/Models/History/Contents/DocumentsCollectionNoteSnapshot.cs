using Common.DatabaseModels.Models.NoteContent;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;


namespace Common.DatabaseModels.Models.History.Contents
{
    public class DocumentsCollectionNoteSnapshot : BaseNoteContentSnapshot, IDocumentsCollection
    {
        public string Name { set; get; }
        public List<Guid> DocumentFilesIds { get; set; }

        public DocumentsCollectionNoteSnapshot(string name, List<Guid> documentFilesIds,
                        int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Name = name;
            DocumentFilesIds = documentFilesIds;
        }
    }
}
