using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetNotesByTypeQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public NoteTypeENUM TypeId { set; get; }
        public GetNotesByTypeQuery(string email, NoteTypeENUM id)
            :base(email)
        {
            this.TypeId = id;
        }
    }
}
