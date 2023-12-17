using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Notes;
using DatabaseContext.Repositories.Folders;
using DatabaseContext.Repositories.Notes;
using Microsoft.Extensions.Caching.Memory;

namespace SignalrUpdater.Impl;

public class NotesMultipleUpdateService
{
    private readonly NoteRepository noteRepository;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly IMemoryCache memoryCache;

    public NotesMultipleUpdateService(NoteRepository noteRepository, 
        FoldersNotesRepository foldersNotesRepository,
        IMemoryCache memoryCache)
    {
        this.noteRepository = noteRepository;
        this.foldersNotesRepository = foldersNotesRepository;
        this.memoryCache = memoryCache;
    }
    
    private NoteShareStatusValue? GetNoteShareStatusCached(Guid noteId)
    {
        var key = CacheKeys.NoteShareStatus + noteId;
        if (memoryCache.TryGetValue(key, out NoteShareStatusValue cacheValue))
        {
            return cacheValue;
        }
        return null;
    }

    private void SetNoteShareStatusCache(Guid noteId, NoteShareStatusValue value)
    {
        var key = CacheKeys.NoteShareStatus + noteId;
        var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(1));
        memoryCache.Set(key, value, cacheEntryOptions);
    }

    public async Task<NoteShareStatusValue> IsMultipleUpdateAsync(Guid noteId)
    {
        var noteShareStatus = GetNoteShareStatusCached(noteId);
        
        if (noteShareStatus != null)
        {
            return noteShareStatus;
        }
        
        var note = await noteRepository.GetNoteIncludeUsersAsync(noteId);
        
        if (note == null)
        {
            return new NoteShareStatusValue() { IsShared = false };
        }
        
        var folderNotes = await foldersNotesRepository.GetByNoteIdIncludeFolderAndUsersAsync(noteId);

        var isMultipleUpdate =  note.IsShared() || note.UsersOnPrivateNotes.Any() || IsContainsSharedFolder(note, folderNotes);

        if (!isMultipleUpdate)
        {
            var value = new NoteShareStatusValue() { IsShared = false };
            SetNoteShareStatusCache(noteId, value);
            return value;
        }

        var userIds = GetAllUsers(note);
        
        var valueCached = new NoteShareStatusValue() { IsShared = true, UserIds = userIds };
        SetNoteShareStatusCache(noteId, valueCached);
        return valueCached;
    }

    private List<Guid> GetAllUsers(Note note)
    {
        var userIds = new List<Guid> { note.UserId };

        if(note.UsersOnPrivateNotes != null)
        {
            var userNoteIds = note.UsersOnPrivateNotes.Select(q => q.UserId).ToList();
            userIds.AddRange(userNoteIds);
        }

        return userIds;
    }
    
    private bool IsContainsSharedFolder(Note note, List<FoldersNotes>? foldersNotes)
    {
        if (foldersNotes == null) return false;
        return foldersNotes
            .Where(x => x.NoteId == note.Id)
            .Any(x => x.Folder.IsShared() || x.Folder.ContainsPrivateUsers());
    }
}