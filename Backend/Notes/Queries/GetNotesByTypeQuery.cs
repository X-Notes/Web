using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Notes.Queries
{
    public class GetNotesByTypeQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public NoteTypeENUM TypeId { set; get; }

        public int TakeContents { set; get; }

        public GetNotesByTypeQuery(Guid userId, NoteTypeENUM id, int takeContents)
            : base(userId)
        {
            TypeId = id;
            TakeContents = takeContents;
        }
    }
}
