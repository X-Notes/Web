using System.Collections.Generic;
using Common.DTO.Notes;
using MediatR;

namespace Domain.Queries.Notes
{
    public class GetAllNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
    }
}
