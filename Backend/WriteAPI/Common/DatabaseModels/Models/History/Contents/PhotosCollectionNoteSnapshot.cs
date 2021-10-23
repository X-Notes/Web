using Common.DatabaseModels.Models.NoteContent;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class PhotosCollectionNoteSnapshot : BaseNoteContentSnapshot, IPhotosCollection
    {
        public string Name { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public List<Guid> PhotosFilesIds { get; set; }

        public PhotosCollectionNoteSnapshot(string name, string width, string height, int countInRow, List<Guid> photosFilesIds,
                        int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Name = name;
            Width = width;
            Height = height;
            CountInRow = countInRow;
            PhotosFilesIds = photosFilesIds;
        }
    }
}
