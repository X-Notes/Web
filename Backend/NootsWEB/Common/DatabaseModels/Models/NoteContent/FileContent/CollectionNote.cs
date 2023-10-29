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
        public string Metadata { set; get; }

        public FileTypeEnum FileTypeId { set; get; }
        public FileType FileType { set; get; }

        public List<AppFile> Files { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<CollectionNoteAppFile> CollectionNoteAppFiles { set; get; }

        public CollectionNote(FileTypeEnum fileTypeId)
        {
            UpdatedAt = DateTimeProvider.Time;
            Version = 1;
            ContentTypeId = ContentTypeENUM.Collection;
            FileTypeId = fileTypeId;
        }

        public CollectionNote(CollectionNote entity, List<CollectionNoteAppFile> collectionNoteAppFiles, int version)
        {
            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.Collection;

            Version = version;

            Name = entity.Name;
            Order = entity.Order;
            FileTypeId = entity.FileTypeId;
            Metadata = entity.Metadata;

            CollectionNoteAppFiles = collectionNoteAppFiles;
        }

        public CollectionMetadata GetMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<CollectionMetadata>(Metadata);
            }

            return null;
        }
        
        public void UpdateMetadata(CollectionMetadata metadata)
        {
            Metadata = metadata != null ? DbJsonConverter.Serialize(metadata) : null;
        }
        
        public override IEnumerable<Guid> GetInternalFilesIds()
        {
            return CollectionNoteAppFiles.Select(x => x.AppFileId);
        }

        public void SetMetaDataPhotos(string width, string height, int countInRow)
        {
            var metadata = string.IsNullOrEmpty(Metadata) ? new CollectionMetadata() : GetMetadata();
            metadata.CountInRow = countInRow;
            metadata.Width = width;
            metadata.Height = height;
            UpdateMetadata(metadata);
        }
    }
}
