using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.Files;
using Common.Interfaces.Note;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(CollectionNote), Schema = SchemeConfig.NoteContent)]
    public class CollectionNote : BaseNoteContent, ICollectionNote
    {
        public string Name { set; get; }

        [Column(TypeName = "jsonb")]
        public CollectionMetadata MetaData { set; get; }

        public FileTypeEnum FileTypeId { set; get; }
        public FileType FileType { set; get; }

        public List<AppFile> Files { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<CollectionNoteAppFile> CollectionNoteAppFiles { set; get; }

        public CollectionNote(FileTypeEnum fileTypeId)
        {
            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.Collection;
            FileTypeId = fileTypeId;
        }

        public CollectionNote(CollectionNote entity, List<CollectionNoteAppFile> collectionNoteAppFiles, Guid noteId)
        {
            NoteId = noteId;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.Collection;

            Name = entity.Name;
            Order = entity.Order;
            FileTypeId = entity.FileTypeId;
            MetaData = entity.MetaData;

            CollectionNoteAppFiles = collectionNoteAppFiles;
        }

        public CollectionNote(CollectionNote entity, List<AppFile> files, Guid noteId)
        {
            NoteId = noteId;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.Collection;

            Name = entity.Name;
            Order = entity.Order;
            FileTypeId = entity.FileTypeId;
            MetaData = entity.MetaData;

            Files = files;
        }

        public override IEnumerable<Guid> GetInternalFilesIds()
        {
            return Files.Select(x => x.Id);
        }

        public void SetMetaDataPhotos(string width, string height, int countInRow)
        {
            MetaData = MetaData ?? new CollectionMetadata();

            MetaData.CountInRow = countInRow;
            MetaData.Width = width;
            MetaData.Height = height;
        }
    }
}
