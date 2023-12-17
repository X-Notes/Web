using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Notes.Queries;
using Permissions.Services;

namespace Notes.Handlers.Queries;

public class GetNotesCountQueryHandler : IRequestHandler<GetNotesCountQuery, List<NotesCount>>
{
    private readonly NoteRepository noteRepository;
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;

    public GetNotesCountQueryHandler(NoteRepository noteRepository, UsersOnPrivateNotesService usersOnPrivateNotesService)
    {
        this.noteRepository = noteRepository;
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
    }
    
    public async Task<List<NotesCount>> Handle(GetNotesCountQuery request, CancellationToken cancellationToken)
    {
        var counts = await noteRepository.GetNotesCountAsync(request.UserId);
        
        var sharedCount = counts.FirstOrDefault(x => x.NoteTypeId == NoteTypeENUM.Shared);
        var notesIds = await usersOnPrivateNotesService.GetNoteIds(request.UserId);
        if (sharedCount != null)
        {
            sharedCount.Count += notesIds.Count;
        }
        else
        {
            counts.Add(new NotesCount() { NoteTypeId = NoteTypeENUM.Shared, Count = notesIds.Count });
        }

        return counts;
    }
}