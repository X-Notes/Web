using System;
using System.Collections.Generic;
using System.Linq;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class ContentSnapshot
    {
        public List<TextNoteSnapshot> TextNoteSnapshots { set; get; } = new List<TextNoteSnapshot>();

        public List<AudiosCollectionNoteSnapshot> AudiosCollectionNoteSnapshots { set; get; } = new List<AudiosCollectionNoteSnapshot>();

        public List<DocumentsCollectionNoteSnapshot> DocumentsCollectionNoteSnapshots { set; get; } = new List<DocumentsCollectionNoteSnapshot>();

        public List<PhotosCollectionNoteSnapshot> PhotosCollectionNoteSnapshots { set; get; } = new List<PhotosCollectionNoteSnapshot>();

        public List<VideosCollectionNoteSnapshot> VideosCollectionNoteSnapshots { set; get; } = new List<VideosCollectionNoteSnapshot>();


        public List<Guid> GetFileIdsFromAllContent()
        {
            var result = new List<Guid>();
            result.AddRange(AudiosCollectionNoteSnapshots.SelectMany(x => x.AudioFilesIds));
            result.AddRange(DocumentsCollectionNoteSnapshots.SelectMany(x => x.DocumentFilesIds));
            result.AddRange(PhotosCollectionNoteSnapshots.SelectMany(x => x.PhotosFilesIds));
            result.AddRange(VideosCollectionNoteSnapshots.SelectMany(x => x.VideoFilesIds));
            return result;
        }
    }
}
