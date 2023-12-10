using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
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
    public class NoteTitleAndTextContentCommandHandler :
        IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>,
        IRequestHandler<UpdateTextContentsCommand, OperationResult<List<UpdateBaseContentResult>>>
    {

        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly BaseNoteContentRepository textNotesRepository;

        private readonly NoteWSUpdateService noteWSUpdateService;

        private readonly NoteFolderLabelMapper mapper;

        public NoteTitleAndTextContentCommandHandler(
            IMediator _mediator,
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            BaseNoteContentRepository textNotesRepository,
            NoteWSUpdateService noteWSUpdateService,
            NoteFolderLabelMapper mapper)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.noteWSUpdateService = noteWSUpdateService;
            this.mapper = mapper;
        }

        public async Task<OperationResult<Unit>> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;

                async Task UpdateNoteTitle(string title)
                {
                    note.Title = title;
                    note.SetDateAndVersion();
                    await noteRepository.UpdateAsync(note);

                    await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);
                }

                if (permissions.IsSingleUpdate)
                {
                    await UpdateNoteTitle(request.Title);
                    return new OperationResult<Unit>(true, Unit.Value);
                }

                await UpdateNoteTitle(request.Title);

                // WS UPDATES
                var update = new UpdateNoteWS { Title = note.Title, NoteId = note.Id, IsUpdateTitle = true };
                await noteWSUpdateService.UpdateNoteWithConnections(update, permissions.GetAllUsers(), request.ConnectionId);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }

        public async Task<OperationResult<List<UpdateBaseContentResult>>> Handle(UpdateTextContentsCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

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
            
            foreach (var text in request.Texts)
            {
                var textToUpdate = textsForUpdate.FirstOrDefault(x => text.Id == x.Id);
                if (textToUpdate != null)
                {
                    var res = await UpdateOne(text, textToUpdate, request.NoteId, permissions.IsMultiplyUpdate, request.ConnectionId, permissions.GetAllUsers());
                    results.Add(res);   
                }
            }

            await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);

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
                var connections = await noteWSUpdateService.GetConnectionsToUpdate(noteId, userToSendIds, connectionId);
                await appSignalRService.UpdateTextContent(updates, connections);
            }

            return new UpdateBaseContentResult(textForUpdate.Id, textForUpdate.Version, textForUpdate.UpdatedAt);
        }
    }
}
