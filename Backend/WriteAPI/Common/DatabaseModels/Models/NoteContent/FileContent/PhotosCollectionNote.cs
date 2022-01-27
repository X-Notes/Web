using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.Files;
using Common.Interfaces.Note;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(PhotosCollectionNote), Schema = SchemeConfig.NoteContent)]
    public class PhotosCollectionNote : BaseNoteContent, IPhotosCollection
    {
        public string Name { set; get; }
        public string Width { set; get; }
        public string Height { set; get; }
        public int CountInRow { set; get; }

        public List<AppFile> Photos { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<PhotoNoteAppFile> PhotoNoteAppFiles { set; get; }

        public PhotosCollectionNote()
        {
            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.PhotosCollection;
            CountInRow = 2;
        }

        public PhotosCollectionNote(PhotosCollectionNote entity, List<PhotoNoteAppFile> albumNoteAppFiles, Guid noteId)
        {
            NoteId = noteId;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.PhotosCollection;

            Width = entity.Width;
            Height = entity.Height;
            CountInRow = entity.CountInRow;
            Name = entity.Name;
            Order = entity.Order;

            PhotoNoteAppFiles = albumNoteAppFiles;
        }

        public PhotosCollectionNote(PhotosCollectionNote entity, List<AppFile> files, Guid noteId)
        {
            NoteId = noteId;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.PhotosCollection;

            Width = entity.Width;
            Height = entity.Height;
            CountInRow = entity.CountInRow;
            Name = entity.Name;
            Order = entity.Order;

            Photos = files;
        }

        public override IEnumerable<Guid> GetInternalFilesIds()
        {
            return Photos.Select(x => x.Id);
        }
    }
}
