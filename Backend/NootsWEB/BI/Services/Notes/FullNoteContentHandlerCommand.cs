using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO.WebSockets.InnerNote;
using Domain.Commands.NoteInner;
using MediatR;
using Microsoft.Extensions.Logging;
using Noots.History.Impl;
using Noots.Permissions.Queries;
using Noots.SignalrUpdater.Impl;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Noots.DatabaseContext.Repositories.NoteContent;
using Common;
using static System.Net.Mime.MediaTypeNames;

namespace BI.Services.Notes
{
    public class FullNoteContentHandlerCommand : IRequestHandler<SyncNoteStructureCommand, OperationResult<NoteStructureResult>>
    {

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly HistoryCacheService historyCacheService;

        private readonly AppSignalRService appSignalRService;

        private readonly TextNotesRepository textNotesRepository;

        private readonly CollectionNoteRepository collectionNoteRepository;

        private readonly IMediator _mediator;

        private readonly CollectionLinkedService collectionLinkedService;
        private readonly ILogger<FullNoteContentHandlerCommand> logger;

        public FullNoteContentHandlerCommand(
            BaseNoteContentRepository baseNoteContentRepository,
            HistoryCacheService historyCacheService,
            AppSignalRService appSignalRService,
            TextNotesRepository textNotesRepository,
            CollectionNoteRepository collectionNoteRepository,
            IMediator _mediator,
            CollectionLinkedService collectionLinkedService,
            ILogger<FullNoteContentHandlerCommand> logger)
        {

            this.historyCacheService = historyCacheService;
            this.appSignalRService = appSignalRService;
            this.textNotesRepository = textNotesRepository;
            this.collectionNoteRepository = collectionNoteRepository;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this._mediator = _mediator;
            this.collectionLinkedService = collectionLinkedService;
            this.logger = logger;
        }


        public async Task<OperationResult<NoteStructureResult>> Handle(SyncNoteStructureCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            NoteStructureResult result = new();
            List<TextNoteDTO> textItemsThatNeedAdd = null;
            List<BaseNoteContentDTO> photosItemsThatNeedAdd = null;
            List<BaseNoteContentDTO> videosItemsThatNeedAdd = null;
            List<BaseNoteContentDTO> audiosItemsThatNeedAdd = null;
            List<BaseNoteContentDTO> documentsItemsThatNeedAdd = null;
            List<UpdateContentPositionWS> positions = null;

            if (permissions.CanWrite)
            {
                var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);
                var contentIds = contents.Select(x => x.Id).ToList();

                if (request.Diffs.RemovedItems != null && request.Diffs.RemovedItems.Any())
                {
                    var removeIds = request.Diffs.RemovedItems.Select(x => x.Id);
                    var contentsToDelete = contents.Where(x => removeIds.Contains(x.Id));

                    var fileContents = contentsToDelete.Where(x => x.ContentTypeId == ContentTypeENUM.Collection).Cast<CollectionNote>();
                    if (fileContents.Any())
                    {
                        var collectionIds = fileContents.Select(x => x.Id);
                        result.Updates.ContentIdsToDelete = await collectionLinkedService.RemoveCollectionsAndUnLinkFiles(collectionIds);
                    }

                    var textIds = contentsToDelete.Where(x => x.ContentTypeId == ContentTypeENUM.Text).Select(x => x.Id);
                    if (textIds.Any())
                    {
                        result.Updates.ContentIdsToDelete ??= new List<Guid>();
                        result.Updates.ContentIdsToDelete.AddRange(textIds);
                        var textContentsToDelete = contents.Where(x => textIds.Contains(x.Id));
                        await baseNoteContentRepository.RemoveRangeAsync(textContentsToDelete);
                    }
                }
                if (request.Diffs.NewTextItems != null && request.Diffs.NewTextItems.Any())
                {
                    textItemsThatNeedAdd = request.Diffs.NewTextItems.Where(x => !contentIds.Contains(x.Id)).ToList();
                    var itemsThatAlreadyAdded = request.Diffs.NewTextItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

                    if (textItemsThatNeedAdd.Any())
                    {
                        var items = textItemsThatNeedAdd.Select(content => GetNewTextContent(content, note.Id)).ToList();
                        await textNotesRepository.AddRangeAsync(items);

                        result.UpdateIds.AddRange(items.Select(x => new UpdateIds {  PrevId = x.PrevId, Id = x.Id}));
                        SetNewIds(result.UpdateIds, textItemsThatNeedAdd);
                    }
                    if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
                    {
                        logger.LogError("ITEMS TEXTS EXIST");
                    }
                }

                // FILES
                if (request.Diffs.PhotosCollectionItems != null && request.Diffs.PhotosCollectionItems.Any())
                {
                    photosItemsThatNeedAdd = request.Diffs.PhotosCollectionItems.Where(x => !contentIds.Contains(x.Id)).ToList();
                    var itemsThatAlreadyAdded = request.Diffs.PhotosCollectionItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

                    if (photosItemsThatNeedAdd.Any())
                    {
                        var items = photosItemsThatNeedAdd.Select(x =>
                        {
                            var cont = GetCollectionContent(x, note.Id, FileTypeEnum.Photo);
                            cont.SetMetaDataPhotos("100%", "auto", 2);
                            return cont;
                        }).ToList();
                        await collectionNoteRepository.AddRangeAsync(items);

                        result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
                        SetNewIds(result.UpdateIds, photosItemsThatNeedAdd);
                    }
                    if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
                    {
                        logger.LogError("ITEMS PHOTOS EXIST");
                    }
                }
                if (request.Diffs.AudiosCollectionItems != null && request.Diffs.AudiosCollectionItems.Any())
                {
                    audiosItemsThatNeedAdd = request.Diffs.AudiosCollectionItems.Where(x => !contentIds.Contains(x.Id)).ToList();
                    var itemsThatAlreadyAdded = request.Diffs.AudiosCollectionItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

                    if (audiosItemsThatNeedAdd.Any())
                    {
                        var items = audiosItemsThatNeedAdd.Select(x => GetCollectionContent(x, note.Id, FileTypeEnum.Audio)).ToList();
                        await collectionNoteRepository.AddRangeAsync(items);

                        result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
                        SetNewIds(result.UpdateIds, audiosItemsThatNeedAdd);
                    }
                    if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
                    {
                        logger.LogError("ITEMS AUDIOS EXIST");
                    }
                }
                if (request.Diffs.VideosCollectionItems != null && request.Diffs.VideosCollectionItems.Any())
                {
                    videosItemsThatNeedAdd = request.Diffs.VideosCollectionItems.Where(x => !contentIds.Contains(x.Id)).ToList();
                    var itemsThatAlreadyAdded = request.Diffs.VideosCollectionItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

                    if (videosItemsThatNeedAdd.Any())
                    {
                        var items = videosItemsThatNeedAdd.Select(x => GetCollectionContent(x, note.Id, FileTypeEnum.Video)).ToList();
                        await collectionNoteRepository.AddRangeAsync(items);

                        result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
                        SetNewIds(result.UpdateIds, videosItemsThatNeedAdd);
                    }
                    if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
                    {
                        logger.LogError("ITEMS VIDEOS EXIST");
                    }
                }
                if (request.Diffs.DocumentsCollectionItems != null && request.Diffs.DocumentsCollectionItems.Any())
                {
                    documentsItemsThatNeedAdd = request.Diffs.DocumentsCollectionItems.Where(x => !contentIds.Contains(x.Id)).ToList();
                    var itemsThatAlreadyAdded = request.Diffs.DocumentsCollectionItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

                    if (documentsItemsThatNeedAdd.Any())
                    {
                        var items = documentsItemsThatNeedAdd.Select(x => GetCollectionContent(x, note.Id, FileTypeEnum.Document)).ToList();
                        await collectionNoteRepository.AddRangeAsync(items);

                        result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
                        SetNewIds(result.UpdateIds, documentsItemsThatNeedAdd);
                    }
                    if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
                    {
                        logger.LogError("ITEMS DOCUMENTS EXIST");
                    }
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
                            content.SetDateAndVersion();
                            updateItems.Add(content);
                       }
                    }
                    if (updateItems.Any())
                    {
                        positions = updateItems.Select(x => new UpdateContentPositionWS(x.Id, x.Order, x.Version)).ToList();
                        await baseNoteContentRepository.UpdateRangeAsync(updateItems);
                    }
                }

                await historyCacheService.UpdateNote(permissions.Note.Id, permissions.Caller.Id);

                result.Updates.TextContentsToAdd = textItemsThatNeedAdd;
                result.Updates.PhotoContentsToAdd = photosItemsThatNeedAdd;
                result.Updates.VideoContentsToAdd = videosItemsThatNeedAdd;
                result.Updates.DocumentContentsToAdd = documentsItemsThatNeedAdd;
                result.Updates.AudioContentsToAdd = audiosItemsThatNeedAdd;
                result.Updates.Positions = positions;

                if (permissions.IsMultiplyUpdate)
                {
                    await appSignalRService.UpdateNoteStructure(request.NoteId, permissions.Caller.Id, result.Updates);
                }

                return new OperationResult<NoteStructureResult>(true, result);
            }

            return new OperationResult<NoteStructureResult>().SetNoPermissions();
        }


        private void SetNewIds<T>(List<UpdateIds> updateIds, List<T> contents) where T : BaseNoteContentDTO
        {
            foreach(var item in updateIds)
            {
                var content = contents.FirstOrDefault(x => x.Id == item.PrevId);
                if(content != null)
                {
                    content.Id = item.Id;
                }
            }
        }


        private TextNote GetNewTextContent(TextNoteDTO textDto, Guid noteId)
        {
            var textDb = new TextNote();

            // UPDATE BASE
            textDb.PrevId = textDto.Id;
            textDb.Order = textDto.Order;
            textDb.SetDateAndVersion();

            textDb.NoteId = noteId;

            // UPDATE TEXT
            textDb.NoteTextTypeId = textDto.NoteTextTypeId;
            textDb.HTypeId = textDto.HeadingTypeId;
            textDb.Checked = textDto.Checked;
            textDb.Contents = textDto.Contents;

            return textDb;
        }

        // FILES
        private CollectionNote GetCollectionContent(BaseNoteContentDTO baseContent, Guid noteId, FileTypeEnum fileTypeEnum)
        {
            var content = new CollectionNote(fileTypeEnum);

            // UPDATE BASE
            content.PrevId = baseContent.Id;
            content.Order = baseContent.Order;
            content.SetDateAndVersion();

            content.NoteId = noteId;

            return content;
        }
    }
}
