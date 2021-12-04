using BI.Services.History;
using BI.SignalR;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Domain.Commands.NoteInner;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Commands.NoteInner.FileContent.Videos;
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

        private readonly PhotosCollectionNoteRepository photosCollectionNoteRepository;

        private readonly VideosCollectionNoteRepository videosCollectionNoteRepository;

        private readonly AudiosCollectionNoteRepository audiosCollectionNoteRepository;

        private readonly DocumentsCollectionNoteRepository documentsCollectionNoteRepository;

        private readonly IMediator _mediator;

        public FullNoteContentHandlerCommand(
            BaseNoteContentRepository baseNoteContentRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            PhotosCollectionNoteRepository photosCollectionNoteRepository,
            VideosCollectionNoteRepository videosCollectionNoteRepository,
            AudiosCollectionNoteRepository audiosCollectionNoteRepository,
            DocumentsCollectionNoteRepository documentsCollectionNoteRepository,
            IMediator _mediator)
        {

            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.photosCollectionNoteRepository = photosCollectionNoteRepository;
            this.videosCollectionNoteRepository = videosCollectionNoteRepository;
            this.audiosCollectionNoteRepository = audiosCollectionNoteRepository;
            this.documentsCollectionNoteRepository = documentsCollectionNoteRepository;
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

                if (request.Diffs.RemovedItems != null && request.Diffs.RemovedItems.Any())
                {
                    var removeIds = request.Diffs.RemovedItems.Select(x => x.Id);
                    var contentsToDelete = contents.Where(x => removeIds.Contains(x.Id));

                    var groups = contentsToDelete.GroupBy(x => x.ContentTypeId);

                    if (groups.Any(x => x.Key == ContentTypeENUM.PhotosCollection))
                    {
                        foreach (var collection in groups.First(x => x.Key == ContentTypeENUM.PhotosCollection))
                        {
                            await _mediator.Send(new UnlinkPhotosCollectionCommand(note.Id, collection.Id, request.Email));
                        }
                    }

                    if (groups.Any(x => x.Key == ContentTypeENUM.AudiosCollection))
                    {
                        foreach (var collection in groups.First(x => x.Key == ContentTypeENUM.AudiosCollection))
                        {
                            await _mediator.Send(new UnlinkAudiosCollectionCommand(note.Id, collection.Id, request.Email));
                        }
                    }

                    if (groups.Any(x => x.Key == ContentTypeENUM.DocumentsCollection))
                    {
                        foreach (var collection in groups.First(x => x.Key == ContentTypeENUM.DocumentsCollection))
                        {
                            await _mediator.Send(new UnlinkDocumentsCollectionCommand(note.Id, collection.Id, request.Email));
                        }
                    }

                    if (groups.Any(x => x.Key == ContentTypeENUM.VideosCollection))
                    {
                        foreach (var collection in groups.First(x => x.Key == ContentTypeENUM.VideosCollection))
                        {
                            await _mediator.Send(new UnlinkVideosCollectionCommand(note.Id, collection.Id, request.Email));
                        }
                    }

                    if (contentsToDelete.Any())
                    {
                        await baseNoteContentRepository.RemoveRangeAsync(contentsToDelete);
                    }
                }
                if (request.Diffs.NewTextItems != null && request.Diffs.NewTextItems.Any())
                {
                    var items = request.Diffs.NewTextItems.Select(content => GetTextContent(content, note.Id));
                    await textNotesRepository.AddRangeAsync(items);
                }

                // FILES
                if (request.Diffs.PhotosCollectionItems != null && request.Diffs.PhotosCollectionItems.Any())
                {
                    var items = request.Diffs.PhotosCollectionItems.Select(x => GetCollectionContent<PhotosCollectionNote>(x, note.Id));
                    await photosCollectionNoteRepository.AddRangeAsync(items);
                }
                if (request.Diffs.AudiosCollectionItems != null && request.Diffs.AudiosCollectionItems.Any())
                {
                    var items = request.Diffs.AudiosCollectionItems.Select(x => GetCollectionContent<AudiosCollectionNote>(x, note.Id));
                    await audiosCollectionNoteRepository.AddRangeAsync(items);
                }
                if (request.Diffs.VideosCollectionItems != null && request.Diffs.VideosCollectionItems.Any())
                {
                    var items = request.Diffs.VideosCollectionItems.Select(x => GetCollectionContent<VideosCollectionNote>(x, note.Id));
                    await videosCollectionNoteRepository.AddRangeAsync(items);
                }
                if (request.Diffs.DocumentsCollectionItems != null && request.Diffs.DocumentsCollectionItems.Any())
                {
                    var items = request.Diffs.DocumentsCollectionItems.Select(x => GetCollectionContent<DocumentsCollectionNote>(x, note.Id));
                    await documentsCollectionNoteRepository.AddRangeAsync(items);
                }

                if (request.Diffs.Positions != null && request.Diffs.Positions.Any())
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

        // FILES
        private T GetCollectionContent<T>(BaseNoteContentDTO baseContent, Guid noteId) where T : BaseNoteContent, new()
        {
            var content = new T();

            // UPDATE BASE
            content.Id = baseContent.Id;
            content.Order = baseContent.Order;
            content.UpdatedAt = baseContent.UpdatedAt;

            content.NoteId = noteId;

            return content;
        }
    }
}
