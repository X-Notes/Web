using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner;
using Domain.Queries.Permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public class FullNoteContentHandlerCommand : IRequestHandler<SyncNoteStructureCommand, OperationResult<Unit>>
    {

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly HistoryCacheService historyCacheService;


        private readonly AppSignalRService appSignalRService;

        private readonly TextNotesRepository textNotesRepository;

        private readonly IMediator _mediator;

        public FullNoteContentHandlerCommand(
            BaseNoteContentRepository baseNoteContentRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            IMediator _mediator)
        {

            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this._mediator = _mediator;
        }


        public async Task<OperationResult<Unit>> Handle(SyncNoteStructureCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);

                if (request.Diffs.RemovedItems.Any())
                {
                    var contentsToDelete = contents.Where(x => request.Diffs.RemovedItems.Contains(x.Id));
                    if (contentsToDelete.Any())
                    {
                        await baseNoteContentRepository.RemoveRangeAsync(contentsToDelete);
                    }
                }
                if (request.Diffs.NewItems.Any())
                {
                    var items = request.Diffs.NewItems.Select(content => GetTextContent(content, note.Id));
                    await textNotesRepository.AddRangeAsync(items);
                }
                if (request.Diffs.Positions.Any())
                {
                    var updateItems = new List<BaseNoteContent>();
                    foreach(var item in request.Diffs.Positions)
                    {
                       var content = contents.FirstOrDefault(x => x.Id == item.Id);
                       if(content != null)
                       {
                            content.Order = item.Order;
                            updateItems.Add(content);
                       }
                    }
                    if (updateItems.Any())
                    {
                        await baseNoteContentRepository.UpdateRangeAsync(updateItems);
                    }
                }

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        private TextNote GetTextContent(TextNoteDTO textDto, Guid noteId)
        {
            var textDb = new TextNote();

            // UPDATE BASE
            textDb.Id = textDto.Id;
            textDb.Order = textDto.Order;
            textDb.UpdatedAt = textDto.UpdatedAt;

            textDb.NoteId = noteId;

            // UPDATE TEXT
            textDb.NoteTextTypeId = textDto.NoteTextTypeId;
            textDb.HTypeId = textDto.HeadingTypeId;
            textDb.Checked = textDto.Checked;
            textDb.Content = textDto.Content;
            textDb.IsBold = textDto.IsBold;
            textDb.IsItalic = textDto.IsItalic;

            return textDb;
        }
    }
}
