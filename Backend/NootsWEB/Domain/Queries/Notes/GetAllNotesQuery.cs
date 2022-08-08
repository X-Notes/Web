using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetAllNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public PersonalizationSettingDTO Settings { set; get; }
    }
}
