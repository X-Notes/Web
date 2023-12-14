using Common.CQRS;
using Common.DTO.Notes;
using MediatR;

namespace Notes.Queries;

public class GetNotesCountQuery : BaseQueryEntity, IRequest<List<NotesCount>>
{
    
}