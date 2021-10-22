using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DatabaseModels.Models.NoteContent;

namespace Common.DTO.Notes.FullNoteContent
{
    public abstract class BaseNoteContentDTO
    {
        [ValidationGuidAttribute]
        public Guid Id { set; get; }

        [Required]
        public ContentTypeENUM TypeId { set; get; }

        [Required]
        public DateTimeOffset UpdatedAt { set; get; }

        [Required]
        public int Order { set; get; }

        public BaseNoteContentDTO(Guid id, int order, ContentTypeENUM typeId, DateTimeOffset updatedAt)
        {
            this.Id = id;
            this.TypeId = typeId;
            this.UpdatedAt = updatedAt;
            this.Order = order;
        }
    }
}
