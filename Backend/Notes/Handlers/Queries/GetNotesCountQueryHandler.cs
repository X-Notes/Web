using Common.DTO.Notes;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Notes.Queries;

namespace Notes.Handlers.Queries;

public class GetNotesCountQueryHandler : IRequestHandler<GetNotesCountQuery, List<NotesCount>>
{
    private readonly NoteRepository noteRepository;

    public GetNotesCountQueryHandler(NoteRepository noteRepository)
    {
        this.noteRepository = noteRepository;
    }
    
    public Task<List<NotesCount>> Handle(GetNotesCountQuery request, CancellationToken cancellationToken)
    {
        return noteRepository.GetNotesCountAsync(request.UserId);
    }
}