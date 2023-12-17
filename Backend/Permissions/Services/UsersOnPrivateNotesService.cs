using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using DatabaseContext.Repositories.Notes;

namespace Permissions.Services;

public class UsersOnPrivateNotesService
{
    private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;
    private readonly RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository;

    public UsersOnPrivateNotesService(
        UsersOnPrivateNotesRepository usersOnPrivateNotesRepository,
        RelatedNoteToInnerNoteRepository relatedNoteToInnerNoteRepository)
	{
        this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        this.relatedNoteToInnerNoteRepository = relatedNoteToInnerNoteRepository;
    }

    public async Task<List<Guid>> RevokeAllPermissionsNote(Guid noteId)
    {
        var usersOnPrivate = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.NoteId == noteId);

        if (!usersOnPrivate.Any())
        {
            return new List<Guid>();
        }

        var userIds = usersOnPrivate.Select(x => x.UserId).ToList();

        await RemoveUserRelatedNotesAsync(userIds, new List<Guid> { noteId });

        await usersOnPrivateNotesRepository.RemoveRangeAsync(usersOnPrivate);

        return userIds;
    }

    public async Task<bool> RevokePermissionsNotes(Guid userId, List<Guid> noteIds)
	{
        var usersOnPrivate = await usersOnPrivateNotesRepository.GetWhereAsync(x => userId == x.UserId && noteIds.Contains(x.NoteId));

        if (!usersOnPrivate.Any())
        {
            return false;
        }

        await RemoveUserRelatedNotesAsync(new List<Guid> { userId }, noteIds);

        await usersOnPrivateNotesRepository.RemoveRangeAsync(usersOnPrivate);

        return true;
    }

    public async Task AddPermissionsAsync(Guid noteId, RefTypeENUM refType, List<Guid> userIds)
    {
        var permissionsRequests = userIds.Select(userId => new UserOnPrivateNotes()
        {
            AccessTypeId = refType,
            NoteId = noteId,
            UserId = userId
        }).ToList();

        await usersOnPrivateNotesRepository.AddRangeAsync(permissionsRequests);
    }

    public async Task AddPermissionAsync(Guid noteId, RefTypeENUM refType, Guid userId)
    {
        await usersOnPrivateNotesRepository.AddAsync(new UserOnPrivateNotes { NoteId = noteId, AccessTypeId = refType, UserId = userId });
    }

    public Task<List<Guid>> GetNoteIds(Guid userId)
    {
        return usersOnPrivateNotesRepository.GetNoteIdsByUserId(userId);
    }

    private async Task RemoveUserRelatedNotesAsync(IEnumerable<Guid> userIds, IEnumerable<Guid> noteIds)
    {
        var notes = await relatedNoteToInnerNoteRepository.GeIncludeRelatedNoteByNotesIds(noteIds);
        var notesToDelete = notes.Where(x => userIds.Contains(x.RelatedNote.UserId));
        if (notesToDelete.Any())
        {
            await relatedNoteToInnerNoteRepository.RemoveRangeAsync(notesToDelete);
        }
    }
}
