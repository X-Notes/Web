using Common.Attributes;
using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Queries.notes
{
    public class GetNotesByTypeQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [ValidationGuidAttribute]
        public Guid TypeId { set; get; }
        public GetNotesByTypeQuery(string email, Guid id)
            :base(email)
        {
            this.TypeId = id;
        }
    }
}
