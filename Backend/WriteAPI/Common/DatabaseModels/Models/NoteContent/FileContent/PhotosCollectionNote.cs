using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Files.Contents;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(PhotosCollectionNote), Schema = SchemeConfig.NoteContent)]
    public class PhotosCollectionNote : BaseNoteContent
    {
        public string Name { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public List<AppFile> Photos { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<PhotoNoteAppFile> PhotoNoteAppFiles { set; get; }

        public PhotosCollectionNote()
        {
            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.PhotosCollection;
        }

        public PhotosCollectionNote(PhotosCollectionNote entity, List<PhotoNoteAppFile> albumNoteAppFiles, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.PhotosCollection;

            Width = entity.Width;
            Height = entity.Height;
            CountInRow = entity.CountInRow;
            Name = entity.Name;
            Order = entity.Order;

            PhotoNoteAppFiles = albumNoteAppFiles;
        }

        public PhotosCollectionNote(PhotosCollectionNote entity, List<AppFile> files, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.PhotosCollection;

            Width = entity.Width;
            Height = entity.Height;
            CountInRow = entity.CountInRow;
            Name = entity.Name;
            Order = entity.Order;

            Photos = files;
        }
    }
}
