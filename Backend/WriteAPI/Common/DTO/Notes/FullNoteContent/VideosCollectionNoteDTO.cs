using Common.DatabaseModels.Models.NoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteContent
{
    public class VideosCollectionNoteDTO : BaseNoteContentDTO
    {
        public string Name { set; get; }
        public List<VideoNoteDTO> Videos { set; get; }

        public VideosCollectionNoteDTO(Guid id, int order, DateTimeOffset updatedAt, string name, List<VideoNoteDTO> videos)
                : base(id, order, ContentTypeENUM.Collection, updatedAt)
        {
            Name = name;
            Videos = videos;
        }
    }
}
