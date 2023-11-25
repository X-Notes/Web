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

        public PersonalizationSettingDTO Settings { set; get; }

        public GetNotesByTypeQuery(Guid userId, NoteTypeENUM id, PersonalizationSettingDTO settings)
            : base(userId)
        {
            this.TypeId = id;
            this.Settings = settings;
        }
    }
}
