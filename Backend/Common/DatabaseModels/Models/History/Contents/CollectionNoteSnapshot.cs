using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class CollectionNoteSnapshot : BaseNoteContentSnapshot
    {
        public string Metadata { set; get; }
        public List<Guid> FilesIds { get; set; }

        public CollectionNoteSnapshot(List<Guid> filesIds, string metaData,
            int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Metadata =  metaData;
            FilesIds = filesIds;
        }

        public CollectionMetadata GetMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<CollectionMetadata>(Metadata);
            }

            return null;
        }
    }
}