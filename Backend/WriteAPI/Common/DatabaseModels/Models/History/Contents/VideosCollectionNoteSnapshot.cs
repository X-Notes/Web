using Common.DatabaseModels.Models.NoteContent;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class VideosCollectionNoteSnapshot : BaseNoteContentSnapshot, IVideosCollection
    {
        public string Name { set; get; }

        public List<Guid> VideoFilesIds { get; set; }

        public VideosCollectionNoteSnapshot(string name, List<Guid> videoFilesIds,
            int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Name = name;
            VideoFilesIds = videoFilesIds;
        }
    }
}
