using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Files;

namespace Common.DatabaseModels.Models.NoteContent.FileContent
{
    [Table(nameof(VideosCollectionNote), Schema = SchemeConfig.NoteContent)]
    public class VideosCollectionNote : BaseNoteContent
    {
        public string Name { set; get; }

        public List<AppFile> Videos { set; get; }
        public List<VideoNoteAppFile> VideoNoteAppFiles { set; get; }

        public VideosCollectionNote()
        {
            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.VideosCollection;
        }

        public VideosCollectionNote(VideosCollectionNote entity, List<VideoNoteAppFile> videosCollectionNoteAppFiles, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.VideosCollection;

            VideoNoteAppFiles = videosCollectionNoteAppFiles;
        }

        public VideosCollectionNote(VideosCollectionNote entity, List<AppFile> videos, bool isHistory, Guid entityId)
        {
            SetId(isHistory, entityId);

            Order = entity.Order;
            Name = entity.Name;

            UpdatedAt = DateTimeOffset.Now;
            ContentTypeId = ContentTypeENUM.VideosCollection;

            Videos = videos;
        }
    }
}
