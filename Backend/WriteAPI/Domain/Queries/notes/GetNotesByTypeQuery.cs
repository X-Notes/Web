using Common.Attributes;
using Common.DatabaseModels.models.Notes;
using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Queries.notes
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
