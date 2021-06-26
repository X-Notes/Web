using BI.Mapping;
using BI.services.history;
using BI.signalR;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.NoteContent.ContentParts;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.noteInner;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.NoteContent;
using WriteContext.Repositories.Notes;

namespace BI.services.notes
{
    public class FullNoteTextHandlerCommand : 
        IRequestHandler<UpdateTitleNoteCommand, Unit>,
        IRequestHandler<UpdateTextNoteCommand, Unit>,
        IRequestHandler<NewLineTextContentNoteCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<InsertLineCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<TransformTextTypeCommand, OperationResult<Unit>>,
        IRequestHandler<ConcatWithPreviousCommand, OperationResult<TextNoteDTO>>,
        IRequestHandler<RemoveContentCommand, OperationResult<Unit>>
    {

        private readonly IMediator _mediator;

        private readonly NoteRepository noteRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppCustomMapper appCustomMapper;

        private readonly AppSignalRService appSignalRService;

        private readonly TextNotesRepository textNotesRepository;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        public FullNoteTextHandlerCommand(
            IMediator _mediator, 
            NoteRepository noteRepository,
            HistoryCacheService historyCacheService,
            AppCustomMapper appCustomMapper,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            BaseNoteContentRepository baseNoteContentRepository)
        {
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.historyCacheService = historyCacheService;
            this.appCustomMapper = appCustomMapper;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
        }

        public async Task<Unit> Handle(UpdateTitleNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.Id, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var note = permissions.Note;
                note.Title = request.Title;
                note.UpdatedAt = DateTimeOffset.Now;
                await noteRepository.Update(note);
                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                var fullNote = await noteRepository.GetFull(note.Id);
                var noteForUpdating = appCustomMapper.MapNoteToFullNote(fullNote);
                await appSignalRService.UpdateGeneralFullNote(noteForUpdating);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateTextNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                content.Content = request.Content;
                if (request.Checked.HasValue)
                {
                    content.Checked = request.Checked.Value;
                    content.IsBold = request.IsBold ?? content.IsBold;
                    content.IsItalic = request.IsItalic ?? content.IsItalic;
                }
                content.UpdatedAt = DateTimeOffset.Now;
                await textNotesRepository.Update(content);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                // TODO DEADLOCK
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return Unit.Value;
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(NewLineTextContentNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhere(x => x.NoteId == note.Id);
                var lastOrder = contents.Max(x => x.Order);

                var text = new TextNote(note.Id, NoteTextTypeENUM.Default, lastOrder + 1);


                await baseNoteContentRepository.Add(text);

                var textResult = new TextNoteDTO(text.Content, text.Id,
                    text.NoteTextTypeId, text.HTypeId, text.Checked, text.IsBold, text.IsItalic, text.UpdatedAt);

                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                return new OperationResult<TextNoteDTO>(Success: true, textResult);
            }

            // TODO MAKE LOGIC FOR HANDLE UNATHORIZE UPDATING
            return new OperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(InsertLineCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var content = contents.First(x => x.Id == request.ContentId) as TextNote;
                var insertIndex = contents.IndexOf(content);

                switch (request.LineBreakType)
                {
                    case "NEXT":
                        {
                            var newText = new TextNote(NoteId: note.Id, request.NoteTextType, content.Order + 1,
                                                        Content: request.NextText);

                            contents.Insert(insertIndex + 1, newText);

                            var orders = Enumerable.Range(1, contents.Count);
                            contents = contents.Zip(orders, (content, order) => {
                                content.Order = order;
                                return content;
                            }).ToList();

                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.Add(newText);
                                await baseNoteContentRepository.UpdateRange(contents);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id, newText.NoteTextTypeId,
                                    newText.HTypeId, newText.Checked, newText.IsBold, newText.IsItalic, newText.UpdatedAt);

                                await transaction.CommitAsync();

                                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                                return new OperationResult<TextNoteDTO>(Success: true, textResult);
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
                            var newText = new TextNote(NoteId: note.Id, request.NoteTextType, content.Order + 1, Content: request.NextText);

                            contents.Insert(insertIndex, newText);

                            var orders = Enumerable.Range(1, contents.Count);
                            contents = contents.Zip(orders, (content, order) => {
                                content.Order = order;
                                return content;
                            }).ToList();


                            using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                            try
                            {
                                await textNotesRepository.Add(newText);
                                await baseNoteContentRepository.UpdateRange(contents);

                                var textResult = new TextNoteDTO(newText.Content, newText.Id,
                                    newText.NoteTextTypeId, newText.HTypeId, newText.Checked, newText.IsBold, newText.IsItalic, newText.UpdatedAt);

                                await transaction.CommitAsync();

                                historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                                await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                                return new OperationResult<TextNoteDTO>(Success: true, textResult);
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
            return new OperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<Unit>> Handle(TransformTextTypeCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var content = await textNotesRepository.FirstOrDefaultAsync(x => x.Id == request.ContentId);
                if (content != null)
                {
                    content.NoteTextTypeId = request.Type;
                    content.HTypeId = request.HeadingType;
                    content.UpdatedAt = DateTimeOffset.Now;
                    await textNotesRepository.Update(content);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    // TODO DEADLOCK
                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
            }

            return new OperationResult<Unit>(Success: false, Unit.Value);
        }

        public async Task<OperationResult<TextNoteDTO>> Handle(ConcatWithPreviousCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var contents = await textNotesRepository.GetAllTextContentByNoteIdOrdered(note.Id);
                var contentForConcat = contents.FirstOrDefault(x => x.Id == request.ContentId);
                contents.Remove(contentForConcat);

                if (contentForConcat == null || contentForConcat.Order <= 1)
                {
                    return new OperationResult<TextNoteDTO>(Success: false, null);
                }

                var contentPrev = contents.First(x => x.Order == contentForConcat.Order - 1);
                contentPrev.Content += contentForConcat.Content;

                var orders = Enumerable.Range(1, contents.Count);

                contents = contents.Zip(orders, (content, order) => {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForConcat);
                    await textNotesRepository.UpdateRange(contents);

                    await transaction.CommitAsync();

                    var textResult = new TextNoteDTO(contentPrev.Content, contentPrev.Id,
                        contentPrev.NoteTextTypeId, contentPrev.HTypeId, contentPrev.Checked,
                        contentPrev.IsBold, contentPrev.IsItalic, contentPrev.UpdatedAt);

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<TextNoteDTO>(Success: true, textResult);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }

            return new OperationResult<TextNoteDTO>(Success: false, null);
        }

        public async Task<OperationResult<Unit>> Handle(RemoveContentCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {

                var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrdered(note.Id);
                var contentForRemove = contents.FirstOrDefault(x => x.Id == request.ContentId);
                contents.Remove(contentForRemove);

                if (contentForRemove == null || contentForRemove.Order <= 1)
                {
                    return new OperationResult<Unit>(Success: false, Unit.Value);
                }

                var orders = Enumerable.Range(1, contents.Count);

                contents = contents.Zip(orders, (content, order) => {
                    content.Order = order;
                    content.UpdatedAt = DateTimeOffset.Now;
                    return content;
                }).ToList();

                using var transaction = await baseNoteContentRepository.context.Database.BeginTransactionAsync();

                try
                {
                    await baseNoteContentRepository.Remove(contentForRemove);
                    await baseNoteContentRepository.UpdateRange(contents);

                    await transaction.CommitAsync();

                    historyCacheService.UpdateNote(permissions.Note.Id, permissions.User.Id, permissions.Author.Email);

                    await appSignalRService.UpdateContent(request.NoteId, permissions.User.Email);

                    return new OperationResult<Unit>(Success: true, Unit.Value);
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine(e);
                }
            }
            return new OperationResult<Unit>(Success: false, Unit.Value);
        }
    }
}
