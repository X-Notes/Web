using Common.DTO.Notes.FullNoteContent.Files;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteContent
{
    public class VideosCollectionNoteDTO : BaseNoteContentDTO
    {
        public string Name { set; get; }
        public List<VideoNoteDTO> Videos { set; get; }

        public VideosCollectionNoteDTO(Guid id, int order, DateTimeOffset updatedAt, string name, List<VideoNoteDTO> videos, int version)
                : base(id, order, ContentTypeEnumDTO.Videos, updatedAt, version)
        {
            Name = name;
            Videos = videos;
        }
    }
}
