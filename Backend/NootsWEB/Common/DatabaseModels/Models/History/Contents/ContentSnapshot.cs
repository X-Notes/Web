using System;
using System.Collections.Generic;
using System.Linq;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class ContentSnapshot
    {
        public List<TextNoteSnapshot> TextNoteSnapshots { set; get; } = new List<TextNoteSnapshot>();

        public List<CollectionNoteSnapshot> CollectionNoteSnapshots { set; get; } = new List<CollectionNoteSnapshot>();

        public List<Guid> GetFileIdsFromAllContent()
        {
            return CollectionNoteSnapshots.SelectMany(x => x.FilesIds).ToList();
        }
    }
}
