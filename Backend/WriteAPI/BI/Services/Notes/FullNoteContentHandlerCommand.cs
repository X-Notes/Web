using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Domain.Commands.NoteInner;
using Domain.Commands.NoteInner.FileContent.Contents;
using Domain.Queries.Permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using WriteContext.Repositories.NoteContent;
namespace BI.Services.Notes
{
    public class FullNoteContentHandlerCommand :
        IRequestHandler<InsertLineCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<ConcatWithPreviousCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<RemoveContentCommand, OperationResult<Unit>>,
        IRequestHandler<SyncNoteStructureCommand, OperationResult<Unit>>,
        IRequestHandler<NewLineTextContentNoteCommand, OperationResult<TextNoteDTO>>
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

        public async Task<OperationResult<TextNoteDTO>> Handle(ConcatWithPreviousCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await textNotesRepository.GetAllTextContentByNoteIdOrdered(note.Id);
                var contentForConcat = contents.FirstOrDefault(x => x.Id == request.ContentId);
                contents.Remove(contentForConcat);

                if (contentForConcat == null || contentForConcat.Order <= 1)
                {
                    return new OperationResult<TextNoteDTO>(success: false, null);
                }

                var contentPrev = contents.First(x => x.Order == contentForConcat.Order - 1);
                contentPrev.Content += contentForConcat.Content;

                var orders = Enumerable.Range(1, contents.Count);

                contents = contents.Zip(orders, (content, order) =>
                {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForConcat);
                    await textNotesRepository.UpdateRangeAsync(contents);

                    await transaction.CommitAsync();

                    var textResult = new TextNoteDTO(contentPrev.Content, contentPrev.Id,
                        contentPrev.NoteTextTypeId, contentPrev.HTypeId, contentPrev.Checked,
                        contentPrev.IsBold, contentPrev.IsItalic, contentPrev.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<TextNoteDTO>(success: true, textResult);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<TextNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(RemoveContentCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {

                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId);
                contents.Remove(contentForRemove);

                if (contentForRemove == null || contentForRemove.Order <= 1)
                {
                    return new OperationResult<Unit>(success: false, Unit.Value);
                }

                var orders = Enumerable.Range(1, contents.Count);

                contents = contents.Zip(orders, (content, order) =>
                {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.RemoveAsync(contentForRemove);
                    await baseNoteContentRepository.UpdateRangeAsync(contents);

                    await transaction.CommitAsync();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(success: true, Unit.Value);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<Unit>().SetNoPermissions();
        }


        public async Task<OperationResult<TextNoteDTO>> Handle(NewLineTextContentNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);
                var lastOrder = contents.Max(x => x.Order);

                var text = new TextNote(false, note.Id, NoteTextTypeENUM.Default, lastOrder + 1);


                await baseNoteContentRepository.AddAsync(text);

                var textResult = new TextNoteDTO(text.Content, text.Id,
                    text.NoteTextTypeId, text.HTypeId, text.Checked, text.IsBold, text.IsItalic, text.UpdatedAt);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<TextNoteDTO>(success: true, textResult);
            }

            return new OperationResult<TextNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(InsertLineCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(note.Id);
                var content = contents.First(x => x.Id == request.ContentId) as TextNote;
                var insertIndex = contents.IndexOf(content);

                switch (request.LineBreakType)
                {
                    case "NEXT":
                        {
                            var newText = new TextNote(false, note.Id, request.NoteTextType, content.Order + 1,
                                                        Content: request.NextText);

                            contents.Insert(insertIndex + 1, newText);

                            var orders = Enumerable.Range(1, contents.Count);
                            contents = contents.Zip(orders, (content, order) =>
                            {
                                content.Order = order;
                                return content;
                            }).ToList();

                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.AddAsync(newText);
                                await baseNoteContentRepository.UpdateRangeAsync(contents);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id, newText.NoteTextTypeId,
                                    newText.HTypeId, newText.Checked, newText.IsBold, newText.IsItalic, newText.UpdatedAt);

                                await transaction.CommitAsync();

                                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                                return new OperationResult<TextNoteDTO>(success: true, textResult);
                            }
                            catch (Exception e)
                            {
                                await transaction.RollbackAsync();
                                Console.WriteLine(e);
                            }
                            break;
                        }
                    case "PREV":
                        {
                            var newText = new TextNote(false, note.Id, request.NoteTextType, content.Order + 1, Content: request.NextText);

                            contents.Insert(insertIndex, newText);

                            var orders = Enumerable.Range(1, contents.Count);
                            contents = contents.Zip(orders, (content, order) =>
                            {
                                content.Order = order;
                                return content;
                            }).ToList();


                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.AddAsync(newText);
                                await baseNoteContentRepository.UpdateRangeAsync(contents);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id,
                                    newText.NoteTextTypeId, newText.HTypeId, newText.Checked, newText.IsBold, newText.IsItalic, newText.UpdatedAt);

                                await transaction.CommitAsync();

                                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);
                                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                                return new OperationResult<TextNoteDTO>(success: true, textResult);
                            }
                            catch (Exception e)
                            {
                                await transaction.RollbackAsync();
                                Console.WriteLine(e);
                            }
                            break;
                        }
                    default:
                        {
                            throw new Exception("Incorrect type");
                        }
                }
            }

            return new OperationResult<TextNoteDTO>().SetNoPermissions();
        }

        public async Task<OperationResult<Unit>> Handle(SyncNoteStructureCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdAsync(note.Id);

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
                    var items = request.Diffs.NewItems.Select(x => GetTextContent(x.Data, x.Index, note.Id));
                    await baseNoteContentRepository.AddRangeAsync(items);
                }
                if (request.Diffs.Positions.Any())
                {
                    var updateItems = new List<BaseNoteContent>();
                    foreach(var item in request.Diffs.Positions)
                    {
                       var content = contents.FirstOrDefault(x => x.Id == item.Id);
                       if(content != null)
                       {
                            content.Order = item.Index;
                            updateItems.Add(content);
                       }
                    }
                    if (updateItems.Any())
                    {
                        await baseNoteContentRepository.UpdateRangeAsync(updateItems);
                    }
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }


            return new OperationResult<Unit>(false, Unit.Value);
        }

        private TextNote GetTextContent(TextNoteDTO textDto, int index, Guid noteId)
        {
            var textDb = new TextNote();
            textDb.NoteTextTypeId = NoteTextTypeENUM.Default;

            textDb.NoteId= noteId;
            textDb.Order = index;
            textDb.UpdatedAt = textDto.UpdatedAt;

            return textDb;
        }
    }
}
