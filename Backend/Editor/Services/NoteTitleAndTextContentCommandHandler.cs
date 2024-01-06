using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO.WebSockets;
using Common.DTO.WebSockets.InnerNote;
using DatabaseContext.Repositories.NoteContent;
using DatabaseContext.Repositories.Notes;
using Editor.Commands.Text;
using Editor.Commands.Title;
using Editor.Entities;
using History.Impl;
using Mapper.Mapping;
using MediatR;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services
{
    public class NoteTitleAndTextContentCommandHandler(IMediator mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            BaseNoteContentRepository textNotesRepository,
            NoteWSUpdateService noteWsUpdateService,
            NoteFolderLabelMapper mapper,
            NotesMultipleUpdateService notesMultipleUpdateService)
        :
            IRequestHandler<UpdateTitleNoteCommand, OperationResult<VersionUpdateResult>>,
            IRequestHandler<UpdateTextContentsCommand, OperationResult<List<UpdateBaseContentResult>>>
    {
        public async Task<OperationResult<VersionUpdateResult>> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return new OperationResult<VersionUpdateResult>().SetNoPermissions();
            }
            
            async Task UpdateNoteTitleAsync(Note note, string title)
            {
                note.Title = title;
                note.SetDateAndVersion();
                await noteRepository.UpdateAsync(note);

                await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);
            }
            
            var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == permissions.NoteId);
            
            await UpdateNoteTitleAsync(note, request.Title);
            
            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

            if (noteStatus.IsShared)
            {
                // WS UPDATES
                var update = new UpdateNoteWS { Title = note.Title, NoteId = note.Id, IsUpdateTitle = true };
                await noteWsUpdateService.UpdateNoteWithConnections(update, noteStatus.UserIds, request.ConnectionId);   
            }

            return new OperationResult<VersionUpdateResult>(true, new VersionUpdateResult(note.Id, note.Version));
        }

        public async Task<OperationResult<List<UpdateBaseContentResult>>> Handle(UpdateTextContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await mediator.Send(command);

            if (!permissions.CanWrite)
            {
                new OperationResult<Unit>().SetNoPermissions();
            }

            List<UpdateBaseContentResult> results = new();

            var textIds = request.Texts.Select(x => x.Id).ToList();
            if (!textIds.Any())
            {
                return new OperationResult<List<UpdateBaseContentResult>>(success: true, results);
            }
            
            var textsForUpdate = await textNotesRepository.GetWhereAsync(x => textIds.Contains(x.Id));
            
            var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);
            
            foreach (var text in request.Texts)
            {
                var textToUpdate = textsForUpdate.FirstOrDefault(x => text.Id == x.Id);
                if (textToUpdate != null)
                {
                    var res = await UpdateOne(text, textToUpdate, request.NoteId, noteStatus.IsShared,
                        request.ConnectionId, noteStatus.UserIds);
                    results.Add(res);   
                }
            }
            
            var note = await noteRepository.FirstOrDefaultAsync(x => x.Id == permissions.NoteId);
            if (note != null)
            {
                note.SetDate();
                await noteRepository.UpdateAsync(note);   
            }

            await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

            return new OperationResult<List<UpdateBaseContentResult>>(success: true, results);
        }

        private async Task<UpdateBaseContentResult> UpdateOne(TextDiff text, BaseNoteContent textForUpdate, Guid noteId, bool isMultiplyUpdate, string connectionId, List<Guid> userToSendIds)
        {
            textForUpdate.SetDateAndVersion();
            textForUpdate.UpdateTextMetadata(text.ContentMetadata.NoteTextTypeId, text.ContentMetadata.HTypeId, text.ContentMetadata.Checked, text.ContentMetadata.TabCount);
            var contents = text.Contents != null ? text.Contents
                .Select(x => new TextBlock(x.Text, x.HighlightColor, x.TextColor, x.Link, x.TextTypes)).ToList() : null;
            textForUpdate.UpdateContent(contents);

            await textNotesRepository.UpdateAsync(textForUpdate);

            if (isMultiplyUpdate)
            {
                var updates = new UpdateTextWS(mapper.ToTextDTO(textForUpdate));
                var connections = await noteWsUpdateService.GetConnectionsToUpdate(noteId, userToSendIds, connectionId);
                await appSignalRService.UpdateTextContent(updates, connections);
            }

            return new UpdateBaseContentResult(textForUpdate.Id, textForUpdate.Version, textForUpdate.UpdatedAt);
        }
    }
}
