using Common.DTO.WebSockets.InnerNote;
using Microsoft.AspNetCore.SignalR;
using Noots.DatabaseContext.Repositories.WS;
using Noots.Editor.Entities;
using Noots.Editor.Entities.Text;
using Noots.Editor.Entities.WS;
using Noots.SignalrUpdater.Impl;

namespace Noots.Editor.Impl;

public class EditorSignalRService : BaseSignalRService
{
    public EditorSignalRService(
        IHubContext<AppSignalRHub> context,
        UserIdentifierConnectionIdRepository userIdentifierConnectionIdRepository) 
        : base(userIdentifierConnectionIdRepository, context)
    {
    }

    public async Task UpdateTextContent(Guid noteId, Guid userId, UpdateTextWS updates)
    {
        var connectionsId = await GetAuthorizedConnections(userId);
        await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(EditorClientWSMethods.updateTextContent, updates);
    }

    public async Task UpdateNoteStructure(Guid noteId, Guid userId, UpdateNoteStructureWS updates)
    {
        var connectionsId = await GetAuthorizedConnections(userId);
        await signalRContext.Clients.GroupExcept(AppSignalRHub.GetNoteGroupName(noteId), connectionsId).SendAsync(EditorClientWSMethods.updateNoteStructure, updates);
    }
}
