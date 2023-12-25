using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DatabaseModels.Models.Notes;
using Common.Interfaces.Note;

namespace Common.DatabaseModels.Models.NoteContent
{
    [Table(nameof(BaseNoteContent), Schema = SchemeConfig.NoteContent)]
    public class BaseNoteContent : BaseEntity<Guid>, IBaseNoteContent
    {
        public int _version;

        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        [Range(0, int.MaxValue)]
        public int Order { set; get; }

        [Range(1, int.MaxValue)]
        public int Version
        {
            get
            {
                return this._version;
            }
            set
            {
                if (value <= 0) throw new Exception("Value cannot be 0");
                this._version = value;
            }
        }

        public ContentTypeENUM ContentTypeId { set; get; }
        public ContentType ContentType { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }

        [NotMapped]
        public Guid PrevId { set; get; }

        [Column(TypeName = "jsonb")]
        public string Metadata { set; get; }

        // TEXT
        [Column(TypeName = "jsonb")]
        public string Contents { set; get; }

        public string PlainContent { set; get; }

        public TextNoteIndex TextNoteIndex { set; get; }

        // COLLECTION
        public List<AppFile> Files { set; get; } // TODO MAKE THIS IN OTHER MANTY TO MANY
        public List<CollectionNoteAppFile> CollectionNoteAppFiles { set; get; }

        public void SetDateAndVersion()
        {
            UpdatedAt = DateTimeProvider.Time;
            Version++;
        }

        public static BaseNoteContent CreateTextNote(BaseNoteContent text)
        {
            var content = new BaseNoteContent();

            content.Order = text.Order;

            content.Contents = text.Contents;
            content.Metadata = text.Metadata;

            content.ContentTypeId = ContentTypeENUM.Text;

            return content;
        }

        public static BaseNoteContent CreateTextNote()
        {
            var content = new BaseNoteContent();

            content.ContentTypeId = ContentTypeENUM.Text;
            var metadata = new TextContentMetadata()
            {
                NoteTextTypeId = NoteTextTypeENUM.Default
            };
            content.Metadata = DbJsonConverter.Serialize(metadata);

            return content;
        }

        public void UpdateMetadataNoteTextType(NoteTextTypeENUM noteTextTypeId)
        {
            var metadata = GetTextMetadata();
            metadata.NoteTextTypeId = noteTextTypeId;
            Metadata = DbJsonConverter.Serialize(metadata);
        }

        public static BaseNoteContent CreateCollectionNote(FileTypeEnum fileTypeId)
        {
            var content = new BaseNoteContent();

            content.UpdatedAt = DateTimeProvider.Time;
            content.Version = 1;
            content.ContentTypeId = ContentTypeENUM.Collection;
            content.UpdateCollectionMetadata(new CollectionMetadata() { FileTypeId = fileTypeId });

            return content;
        }

        public static BaseNoteContent CreateCollectionNote(BaseNoteContent entity, List<CollectionNoteAppFile> collectionNoteAppFiles, int version)
        {
            var content = new BaseNoteContent();

            content.UpdatedAt = DateTimeProvider.Time;
            content.ContentTypeId = ContentTypeENUM.Collection;

            content.Version = version;

            content.Order = entity.Order;
            content.Metadata = entity.Metadata;

            content.CollectionNoteAppFiles = collectionNoteAppFiles;

            return content;
        }

        public void UpdateContent(List<TextBlock> contents)
        {
            Contents = contents != null ? DbJsonConverter.Serialize(contents) : null;
        }

        public List<TextBlock> GetContents()
        {
            if (!string.IsNullOrEmpty(Contents))
            {
                return DbJsonConverter.DeserializeObject<List<TextBlock>>(Contents);
            }

            return null;
        }

        public TextContentMetadata GetTextMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<TextContentMetadata>(Metadata);
            }

            return null;
        }

        public CollectionMetadata GetCollectionMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<CollectionMetadata>(Metadata);
            }

            return null;
        }

        public void UpdateCollectionMetadata(CollectionMetadata metadata)
        {
            Metadata = metadata != null ? DbJsonConverter.Serialize(metadata) : null;
        }

        public void SetMetaDataPhotos(string width, string height, int countInRow)
        {
            var metadata = string.IsNullOrEmpty(Metadata) ? new CollectionMetadata() : GetCollectionMetadata();
            metadata.CountInRow = countInRow;
            metadata.Width = width;
            metadata.Height = height;
            UpdateCollectionMetadata(metadata);
        }

        public IEnumerable<Guid> GetInternalFilesIds()
        {
            if (CollectionNoteAppFiles == null)
            {
                return Enumerable.Empty<Guid>();
            }

            return CollectionNoteAppFiles?.Select(x => x.AppFileId);
        }

        public void UpdateTextMetadata(NoteTextTypeENUM noteTextTypeId, HTypeENUM? hTypeId, bool? @checked, int? tabCount)
        {
            var metadata = new TextContentMetadata
            {
                NoteTextTypeId = noteTextTypeId,
                HTypeId = hTypeId,
                Checked = @checked,
                TabCount = tabCount
            };
            Metadata = DbJsonConverter.Serialize(metadata);
        }

        public string GetContentString()
        {
            if (Contents == null) return null;
            var texts = GetContents()?.Select(x => x.Text).ToList();
            if (texts == null || !texts.Any())
            {
                return "";
            }
            return string.Join("", texts);
        }
    }
}