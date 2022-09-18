using Common.DatabaseModels.Models.Notes;
using Common.DTO.Personalization;
using Noots.DatabaseContext.Repositories.Notes;

namespace Noots.Notes.Impl;

public class NotesService
{
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly NoteRepository noteRepository;

    public NotesService(UsersOnPrivateNotesRepository usersOnPrivateNotesRepository, NoteRepository noteRepository)
    {
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        this.noteRepository = noteRepository;
    }
    
    public async Task<List<Note>> GetSharedNotes(Guid userId, PersonalizationSettingDTO settings)
    {
        var usersOnPrivateNotes = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.UserId == userId);
        var notesIds = usersOnPrivateNotes.Select(x => x.NoteId);
        var sharedNotes = await noteRepository.GetNotesByNoteIdsIdWithContent(notesIds, settings);
        sharedNotes.ForEach(x => x.NoteTypeId = NoteTypeENUM.Shared);
        return sharedNotes;
    }
}