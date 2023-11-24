using System.Data;
using Common.DatabaseModels;
using Common.DatabaseModels.DapperEntities.Search;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DatabaseModels.Models.Notes;
using Dapper;

namespace DatabaseContext.Dapper.Reps;

public class DapperSearchRepository : IDisposable
{
	private readonly DapperContext dapperContext;

    private IDbConnection _connection;

    public DapperSearchRepository(DapperContext dapperContext)
	{
		this.dapperContext = dapperContext;
        _connection = this.dapperContext.GetConnection();
    }

    private IDbConnection Connection => _connection;

    public async Task<IEnumerable<NoteTitle>> SearchByNoteTitle(IEnumerable<Guid> noteIds, string str)
    {
        string query = $"SELECT \"{nameof(Note.Id)}\", \"{nameof(Note.Title)}\" FROM {SchemeConfig.Note}.\"{nameof(Note)}\" " +
            $"WHERE \"{nameof(Note.Id)}\" = ANY(@ids)" +
            $" AND \"{nameof(Note.Title)}\" ILIKE @str";

        return await Connection.QueryAsync<NoteTitle>(query, new { ids = noteIds, str = "%" + str + "%" });
    }

    public async Task<IEnumerable<FolderTitle>> SearchByFolderTitle(Guid[] folderIds, string str)
    {        
        string query = $"SELECT \"{nameof(Folder.Id)}\", \"{nameof(Folder.Title)}\" FROM {SchemeConfig.Folder}.\"{nameof(Folder)}\" " +
            $"WHERE \"{nameof(Folder.Id)}\" = ANY(@ids)" +
            $" AND \"{nameof(Folder.Title)}\" ILIKE @str";

        return await Connection.QueryAsync<FolderTitle>(query, new { ids = folderIds, str = "%" + str + "%" });
    }

    public async Task<IEnumerable<NoteContent>> SearchNotesContents(IEnumerable<Guid> noteIds, string str)
    {
        var elKey = "element";
        var noteIdKey = nameof(NoteContent.NoteId);
        var baseNoteIdKey = $"{SchemeConfig.NoteContent}.\"{nameof(BaseNoteContent)}\".\"{nameof(BaseNoteContent.NoteId)}\"";
        string query = $"SELECT {baseNoteIdKey} AS \"{noteIdKey}\", STRING_AGG(\"{elKey}\"->>'Text', ' ') AS \"{nameof(NoteContent.Content)}\"" +
            $"FROM {SchemeConfig.NoteContent}.\"{nameof(BaseNoteContent)}\" JOIN {SchemeConfig.NoteContent}.\"{nameof(TextNote)}\" ON {SchemeConfig.NoteContent}.\"{nameof(BaseNoteContent)}\".\"{nameof(BaseNoteContent.Id)}\" = {SchemeConfig.NoteContent}.\"{nameof(TextNote)}\".\"{nameof(TextNote.Id)}\", " +
            $"LATERAL jsonb_array_elements({SchemeConfig.NoteContent}.\"{nameof(TextNote)}\".\"{nameof(TextNote.Contents)}\") AS \"{elKey}\" WHERE \"{noteIdKey}\" = ANY(@noteIds) " +
            $"GROUP BY {baseNoteIdKey} HAVING STRING_AGG(\"{elKey}\"->>'{nameof(TextBlock.Text)}', ' ') ILIKE @str";

        return await Connection.QueryAsync<NoteContent>(query, new { noteIds = noteIds, str = "%" + str + "%" });
    }

    public async Task<IEnumerable<Guid>> GetUserNotesAndSharedIds(Guid userId)
    {
        string query = $"SELECT \"{nameof(Note.Id)}\" FROM {SchemeConfig.Note}.\"{nameof(Note)}\" WHERE \"{nameof(Note.UserId)}\" = @userId OR \"{nameof(Note.Id)}\" IN (SELECT \"{nameof(UserOnPrivateNotes.NoteId)}\" FROM {SchemeConfig.Note}.\"{nameof(UserOnPrivateNotes)}\" as UPN WHERE UPN.\"{nameof(UserOnPrivateNotes.UserId)}\" = @userId)";
        return await Connection.QueryAsync<Guid>(query, new { userId = userId });
    }

    public async Task<IEnumerable<Guid>> GetUserFoldersIds(Guid userId)
    {
        string query = $"SELECT \"{nameof(Folder.Id)}\" FROM {SchemeConfig.Folder}.\"{nameof(Folder)}\" WHERE \"{nameof(Folder.UserId)}\" = @userId OR \"{nameof(Folder.Id)}\" IN (SELECT \"{nameof(UsersOnPrivateFolders.FolderId)}\" FROM {SchemeConfig.Folder}.\"{nameof(UsersOnPrivateFolders)}\" as UPN WHERE UPN.\"{nameof(UsersOnPrivateFolders.UserId)}\" = @userId)";
        return await Connection.QueryAsync<Guid>(query, new { userId = userId });
    }

    public void Dispose()
	{
        _connection.Dispose();
        GC.SuppressFinalize(this);
    }
}
