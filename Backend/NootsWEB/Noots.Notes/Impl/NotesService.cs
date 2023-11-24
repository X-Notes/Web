using Common.DatabaseModels.Models.Notes;
using Common.DTO.Personalization;
using DatabaseContext.Repositories.Notes;
using Permissions.Impl;

namespace Notes.Impl;

public class NotesService
{
    private readonly UsersOnPrivateNotesService usersOnPrivateNotesService;
    private readonly NoteRepository noteRepository;

    public NotesService(UsersOnPrivateNotesService usersOnPrivateNotesService, NoteRepository noteRepository)
    {
        this.usersOnPrivateNotesService = usersOnPrivateNotesService;
        this.noteRepository = noteRepository;
    }
    
    public async Task<List<Note>> GetSharedNotes(Guid userId, PersonalizationSettingDTO settings)
    {
        var notesIds = await usersOnPrivateNotesService.GetNoteIds(userId);
        var sharedNotes = await noteRepository.GetNotesByNoteIdsIdWithContent(notesIds, settings);
        sharedNotes.ForEach(x => x.NoteTypeId = NoteTypeENUM.Shared);
        return sharedNotes;
    }
}