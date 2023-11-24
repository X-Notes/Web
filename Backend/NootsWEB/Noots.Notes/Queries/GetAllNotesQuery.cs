using System.ComponentModel.DataAnnotations;
using Common.CQRS;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Notes.Queries
{
    public class GetAllNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public PersonalizationSettingDTO Settings { set; get; }
    }
}
