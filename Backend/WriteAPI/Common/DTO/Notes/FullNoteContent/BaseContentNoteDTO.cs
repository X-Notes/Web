using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public class BaseContentNoteDTO
    {
        [ValidationGuidAttribute]
        public Guid Id { set; get; }

        [Required]
        public ContentTypeENUM TypeId { set; get; }

        [Required]
        public DateTimeOffset UpdatedAt { set; get; }

        public BaseContentNoteDTO(Guid Id, ContentTypeENUM typeId, DateTimeOffset UpdatedAt)
        {
            this.Id = Id;
            this.TypeId = typeId;
            this.UpdatedAt = UpdatedAt;
        }
    }
}
