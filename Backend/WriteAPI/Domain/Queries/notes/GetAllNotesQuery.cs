using Common.DTO.notes;
using MediatR;
using System.Collections.Generic;

namespace Domain.Queries.notes
{
    public class GetAllNotesQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
    }
}
