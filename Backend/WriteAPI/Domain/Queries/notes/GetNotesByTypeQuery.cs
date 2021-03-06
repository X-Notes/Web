using Common.Attributes;
using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;

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
