using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class CollectionNoteSnapshot : BaseNoteContentSnapshot, ICollectionNote
    {
        public string Name { set; get; }

        public CollectionMetadata MetaData { set; get; }

        public FileTypeEnum FileTypeId { set; get; }

        public List<Guid> FilesIds { get; set; }

        public CollectionNoteSnapshot(string name, List<Guid> filesIds, CollectionMetadata metaData, FileTypeEnum fileTypeId,
                                        int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Name = name;
            MetaData = metaData;
            FileTypeId = fileTypeId;
            FilesIds = filesIds;
        }
    }
}
