using Common.DatabaseModels.Models.NoteContent;
using System;
using System.Collections.Generic;

namespace Common.DTO.Notes.FullNoteContent
{
    public class VideosCollectionNoteDTO : BaseContentNoteDTO
    {
        public string Name { set; get; }
        public List<VideoNoteDTO> Videos { set; get; }

        public VideosCollectionNoteDTO(Guid id, DateTimeOffset updatedAt, string name, List<VideoNoteDTO> videos)
                : base(id, ContentTypeENUM.VideosCollection, updatedAt)
        {
            Name = name;
            Videos = videos;
        }
    }
}
