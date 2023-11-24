using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO.WebSockets.InnerNote;
using Editor.Commands.Structure;
using Mapper.Mapping;
using MediatR;
using Microsoft.Extensions.Logging;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.History.Impl;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services;

public class SyncNoteStructureCommandHandler : IRequestHandler<SyncNoteStructureCommand, OperationResult<NoteStructureResult>>
{
    private readonly int maxContents = 300;

    private readonly BaseNoteContentRepository baseNoteContentRepository;

    private readonly HistoryCacheService historyCacheService;

    private readonly AppSignalRService appSignalRService;

    private readonly TextNotesRepository textNotesRepository;

    private readonly CollectionNoteRepository collectionNoteRepository;

    private readonly IMediator _mediator;

    private readonly CollectionLinkedService collectionLinkedService;

    private readonly ILogger<SyncNoteStructureCommandHandler> logger;

    private readonly NoteFolderLabelMapper noteFolderLabelMapper;

    private readonly NoteWSUpdateService noteWSUpdateService;

    public SyncNoteStructureCommandHandler(
        BaseNoteContentRepository baseNoteContentRepository,
        HistoryCacheService historyCacheService,
        AppSignalRService appSignalRService,
        TextNotesRepository textNotesRepository,
        CollectionNoteRepository collectionNoteRepository,
        IMediator _mediator,
        CollectionLinkedService collectionLinkedService,
        ILogger<SyncNoteStructureCommandHandler> logger,
        NoteFolderLabelMapper noteFolderLabelMapper,
        NoteWSUpdateService noteWSUpdateService)
    {

        this.historyCacheService = historyCacheService;
        this.appSignalRService = appSignalRService;
        this.textNotesRepository = textNotesRepository;
        this.collectionNoteRepository = collectionNoteRepository;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this._mediator = _mediator;
        this.collectionLinkedService = collectionLinkedService;
        this.logger = logger;
        this.noteFolderLabelMapper = noteFolderLabelMapper;
        this.noteWSUpdateService = noteWSUpdateService;
    }


    public async Task<OperationResult<NoteStructureResult>> Handle(SyncNoteStructureCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await _mediator.Send(command);
        var note = permissions.Note;

        NoteStructureResult result = new();

        if (!permissions.CanWrite)
        {
            return new OperationResult<NoteStructureResult>().SetNoPermissions();
        }

        var contents = await baseNoteContentRepository.GetWhereAsync(x => x.NoteId == note.Id);

        var removeContentsCount = request.Diffs.RemovedItems == null ? 0 : request.Diffs.RemovedItems.Count;
        var totalCount = contents.Count - removeContentsCount + request.Diffs.GetNewItemsCount();
        if (totalCount > maxContents)
        {
            return new OperationResult<NoteStructureResult>().SetBillingError();
        }

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
            var newItemsToAdd = request.Diffs.NewTextItems.Where(x => !contentIds.Contains(x.Id)).ToList();
            var itemsThatAlreadyAdded = request.Diffs.NewTextItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

            if (newItemsToAdd.Any())
            {
                var items = newItemsToAdd.Select(content => GetNewTextContent(content, note.Id)).ToList();
                await textNotesRepository.AddRangeAsync(items);

                result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
                result.Updates.TextContentsToAdd = items.Select(x => noteFolderLabelMapper.ToTextDTO(x)).ToList();
                SetNewIds(result.UpdateIds, result.Updates.TextContentsToAdd);
            }
            if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
            {
                logger.LogError("ITEMS TEXTS EXIST");
            }
        }

        if (request.Diffs.CollectionItems != null && request.Diffs.CollectionItems.Any())
        {
            var newCollectionItemsToAdd = request.Diffs.CollectionItems.Where(x => !contentIds.Contains(x.Id)).ToList();
            var itemsThatAlreadyAdded = request.Diffs.CollectionItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

            if (newCollectionItemsToAdd.Any())
            {
                var items = newCollectionItemsToAdd.Select(x => GetCollectionContent(x, note.Id, x.TypeId)).ToList();
                await collectionNoteRepository.AddRangeAsync(items);

                result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
                result.Updates.CollectionContentsToAdd = items.Select(x => noteFolderLabelMapper.ToCollectionNoteDTO(x)).ToList();
                SetNewIds(result.UpdateIds, result.Updates.CollectionContentsToAdd);
            }
            if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
            {
                logger.LogError("ITEMS EXIST");
            }
        }

        if (request.Diffs.Positions != null && request.Diffs.Positions.Any())
        {
            var updateItems = new List<BaseNoteContent>();
            foreach (var item in request.Diffs.Positions)
            {
                var content = contents.FirstOrDefault(x => x.Id == item.Id);
                if (content != null)
                {
                    content.Order = item.Order;
                    content.SetDateAndVersion();
                    updateItems.Add(content);
                }
            }
            if (updateItems.Any())
            {
                result.Updates.Positions = updateItems.Select(x => new UpdateContentPositionWS(x.Id, x.Order, x.Version)).ToList();
                await baseNoteContentRepository.UpdateRangeAsync(updateItems);
            }
        }

        await historyCacheService.UpdateNoteAsync(permissions.Note.Id, permissions.Caller.Id);

        if (permissions.IsMultiplyUpdate)
        {
            var connections = await noteWSUpdateService.GetConnectionsToUpdate(permissions.Note.Id, permissions.GetAllUsers(), request.ConnectionId);
            await appSignalRService.UpdateNoteStructure(result.Updates, connections);
        }

        return new OperationResult<NoteStructureResult>(true, result);
    }


    private void SetNewIds<T>(List<UpdateIds> updateIds, List<T> contents) where T : BaseNoteContentDTO
    {
        foreach (var item in updateIds)
        {
            var content = contents.FirstOrDefault(x => x.Id == item.PrevId);
            if (content != null)
            {
                content.Id = item.Id;
            }
        }
    }


    private TextNote GetNewTextContent(NewTextContent textDto, Guid noteId)
    {
        var textDb = new TextNote();

        // UPDATE BASE
        textDb.PrevId = textDto.Id;
        textDb.Order = textDto.Order;
        textDb.SetDateAndVersion();

        textDb.NoteId = noteId;

        // UPDATE TEXT
        textDb.UpdateMetadataNoteTextType(textDto.NoteTextTypeId);
        var contents = textDto.Contents != null ? textDto.Contents
            .Select(x => new TextBlock(x.Text, x.HighlightColor, x.TextColor, x.Link, x.TextTypes)).ToList() : null;
        textDb.UpdateContent(contents);

        return textDb;
    }

    // FILES
    private CollectionNote GetCollectionContent(NewCollectionContent baseContent, Guid noteId, ContentTypeEnumDTO fileTypeEnum)
    {
        var fileType = fileTypeEnum switch
        {
            ContentTypeEnumDTO.Photos => FileTypeEnum.Photo,
            ContentTypeEnumDTO.Documents => FileTypeEnum.Document,
            ContentTypeEnumDTO.Audios => FileTypeEnum.Audio,
            ContentTypeEnumDTO.Videos => FileTypeEnum.Video,
            _ => throw new Exception("Incorrect type")
        };

        return GetCollectionContent(baseContent, noteId, fileType);
    }

    private CollectionNote GetCollectionContent(NewCollectionContent baseContent, Guid noteId, FileTypeEnum fileTypeEnum)
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
