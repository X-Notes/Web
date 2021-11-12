using Common.DatabaseModels.Models.NoteContent;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class AudiosCollectionNoteSnapshot : BaseNoteContentSnapshot, IAudiosCollection
    {
        public string Name { set; get; }
        public List<Guid> AudioFilesIds { get; set; }

        public AudiosCollectionNoteSnapshot(string name, List<Guid> audioFilesIds,
                        int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Name = name;    
            AudioFilesIds = audioFilesIds;
        }
    }
}
