using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.Files;
using Common.Interfaces.Note;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(VideosCollectionNote), Schema = SchemeConfig.NoteContent)]
    public class VideosCollectionNote : BaseNoteContent, IVideosCollection
    {
        public string Name { set; get; }

        public List<AppFile> Videos { set; get; }
        public List<VideoNoteAppFile> VideoNoteAppFiles { set; get; }

        public VideosCollectionNote()
        {
            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.VideosCollection;
        }

        public VideosCollectionNote(VideosCollectionNote entity, List<VideoNoteAppFile> videosCollectionNoteAppFiles, Guid noteId)
        {
            NoteId = noteId;

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.VideosCollection;

            VideoNoteAppFiles = videosCollectionNoteAppFiles;
        }

        public VideosCollectionNote(VideosCollectionNote entity, List<AppFile> videos, Guid noteId)
        {
            NoteId = noteId;

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeProvider.Time;
            ContentTypeId = ContentTypeENUM.VideosCollection;

            Videos = videos;
        }

        public override IEnumerable<Guid> GetInternalFilesIds()
        {
            return Videos.Select(x => x.Id);
        }
    }
}
