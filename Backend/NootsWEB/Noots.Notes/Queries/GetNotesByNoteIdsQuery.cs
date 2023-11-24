using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Notes.Queries
{
    public class GetNotesByNoteIdsQuery : BaseQueryEntity, IRequest<OperationResult<List<SmallNote>>>
    {
        [RequiredListNotEmpty]
        public List<Guid> NoteIds { set; get; }

        [Required]
        public PersonalizationSettingDTO Settings { set; get; }

        public GetNotesByNoteIdsQuery(Guid userId, List<Guid> noteIds, PersonalizationSettingDTO settings)
            : base(userId)
        {
            this.Settings = settings;
            this.NoteIds = noteIds;
        }
    }
}
