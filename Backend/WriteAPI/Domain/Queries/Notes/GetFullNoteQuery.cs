using System;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetFullNoteQuery: BaseQueryEntity, IRequest<FullNoteAnswer>
    {
        public Guid Id { set; get; }
        public GetFullNoteQuery(string email, Guid id)
            :base(email)
        {
            this.Id = id;
        }
    }
}
