using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;

namespace Common.DTO.Notes.FullNoteContent;

public class BaseNoteContentDTO
{
    [ValidationGuidAttribute]
    public Guid Id { set; get; }

    [Required]
    public ContentTypeEnumDTO TypeId { set; get; }

    [Required]
    public DateTimeOffset UpdatedAt { set; get; }

    [Required]
    public int Version { set; get; }

    [Required]
    public int Order { set; get; }

    public BaseNoteContentDTO(Guid id, int order, ContentTypeEnumDTO typeId, DateTimeOffset updatedAt, int version)
    {
        this.Id = id;
        this.TypeId = typeId;
        this.UpdatedAt = updatedAt;
        this.Order = order;
        this.Version = version;
    }
}
