using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Common.DTO.WebSockets.InnerNote;
using DatabaseContext.Repositories.NoteContent;
using Editor.Commands.Structure;
using History.Impl;
using Mapper.Mapping;
using MediatR;
using Microsoft.Extensions.Logging;
using Permissions.Queries;
using SignalrUpdater.Impl;

namespace Editor.Services;

public class SyncNoteStructureCommandHandler : IRequestHandler<SyncNoteStructureCommand, OperationResult<NoteStructureResult>>
{
    private readonly int maxContents = 150;

    private readonly BaseNoteContentRepository baseNoteContentRepository;

    private readonly HistoryCacheService historyCacheService;

    private readonly AppSignalRService appSignalRService;

    private readonly IMediator mediator;

    private readonly CollectionLinkedService collectionLinkedService;

    private readonly ILogger<SyncNoteStructureCommandHandler> logger;

    private readonly NoteFolderLabelMapper noteFolderLabelMapper;

    private readonly NoteWSUpdateService noteWsUpdateService;

    private readonly NotesMultipleUpdateService notesMultipleUpdateService;

    public SyncNoteStructureCommandHandler(
        BaseNoteContentRepository baseNoteContentRepository,
        HistoryCacheService historyCacheService,
        AppSignalRService appSignalRService,
        IMediator mediator,
        CollectionLinkedService collectionLinkedService,
        ILogger<SyncNoteStructureCommandHandler> logger,
        NoteFolderLabelMapper noteFolderLabelMapper,
        NoteWSUpdateService noteWsUpdateService,
        NotesMultipleUpdateService notesMultipleUpdateService)
    {

        this.historyCacheService = historyCacheService;
        this.appSignalRService = appSignalRService;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.mediator = mediator;
        this.collectionLinkedService = collectionLinkedService;
        this.logger = logger;
        this.noteFolderLabelMapper = noteFolderLabelMapper;
        this.noteWsUpdateService = noteWsUpdateService;
        this.notesMultipleUpdateService = notesMultipleUpdateService;
    }


    public async Task<OperationResult<NoteStructureResult>> Handle(SyncNoteStructureCommand request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command, cancellationToken);

        if (!permissions.CanWrite)
        {
            return new OperationResult<NoteStructureResult>().SetNoPermissions();
        }

        var count = await baseNoteContentRepository.GetCountAsync(x => x.NoteId == permissions.NoteId);
        var removeContentsCount = request.Diffs.RemovedItems?.Count ?? 0;
        var totalCount = count - removeContentsCount + request.Diffs.GetNewItemsCount();
        if (totalCount > maxContents)
        {
            return new OperationResult<NoteStructureResult>().SetBillingError();
        }

        NoteStructureResult result = new();

        await DeleteContentEditorItemsAsync(request.Diffs.RemovedItems, result, permissions.NoteId);
        await NewTextEditorItemsAsync(request.Diffs.NewTextItems, permissions.NoteId, result);
        await NewCollectionEditorItemsAsync(request.Diffs.CollectionItems, permissions.NoteId, result);

        if (request.Diffs.Positions != null && request.Diffs.Positions.Any())
        {
            var positionIds = request.Diffs.Positions.Select(x => x.Id).ToList();

            var contents = await baseNoteContentRepository.GetWhereAsync(x =>
                x.NoteId == permissions.NoteId && positionIds.Contains(x.Id));

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

        await historyCacheService.UpdateNoteAsync(permissions.NoteId, permissions.CallerId);

        var noteStatus = await notesMultipleUpdateService.IsMultipleUpdateAsync(permissions.NoteId);

        if (noteStatus.IsShared)
        {
            var connections = await noteWsUpdateService.GetConnectionsToUpdate(permissions.NoteId, noteStatus.UserIds, request.ConnectionId);
            await appSignalRService.UpdateNoteStructure(result.Updates, connections);
        }

        return new OperationResult<NoteStructureResult>(true, result);
    }

    private async Task NewCollectionEditorItemsAsync(List<NewCollectionContent> newCollectionItems , Guid noteId, NoteStructureResult result)
    {
        if (newCollectionItems == null || !newCollectionItems.Any())
        {
            return;
        }

        var contentIds = await baseNoteContentRepository.GetContentIdsByNoteIdAsync(noteId);

        var newCollectionItemsToAdd = newCollectionItems.Where(x => !contentIds.Contains(x.Id)).ToList();
        var itemsThatAlreadyAdded = newCollectionItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

        if (newCollectionItemsToAdd.Any())
        {
            var items = newCollectionItemsToAdd.Select(x => GetCollectionContent(x, noteId, x.TypeId)).ToList();
            await baseNoteContentRepository.AddRangeAsync(items);

            result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
            result.Updates.CollectionContentsToAdd = items.Select(x => noteFolderLabelMapper.ToCollectionNoteDTO(x)).ToList();
            SetNewIds(result.UpdateIds, result.Updates.CollectionContentsToAdd);
        }

        if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
        {
            logger.LogError("ITEMS EXIST");
        }
    }

    private async Task NewTextEditorItemsAsync(List<NewTextContent> newTextItems, Guid noteId, NoteStructureResult result)
    {
        if (newTextItems == null || !newTextItems.Any())
        {
            return;
        }

        var contentIds = await baseNoteContentRepository.GetContentIdsByNoteIdAsync(noteId);

        var newItemsToAdd = newTextItems.Where(x => !contentIds.Contains(x.Id)).ToList();
        var itemsThatAlreadyAdded = newTextItems.Where(x => contentIds.Contains(x.Id)).ToList(); // TODO REMOVE AFTER TESTING

        if (newItemsToAdd.Any())
        {
            var items = newItemsToAdd.Select(content => GetNewTextContent(content, noteId)).ToList();
            await baseNoteContentRepository.AddRangeAsync(items);

            result.UpdateIds.AddRange(items.Select(x => new UpdateIds { PrevId = x.PrevId, Id = x.Id }));
            result.Updates.TextContentsToAdd = items.Select(x => noteFolderLabelMapper.ToTextDTO(x)).ToList();

            SetNewIds(result.UpdateIds, result.Updates.TextContentsToAdd);
        }

        if (itemsThatAlreadyAdded.Any()) // TODO REMOVE AFTER TESTING
        {
            logger.LogError("ITEMS TEXTS EXIST");
        }
    }

    private async Task DeleteContentEditorItemsAsync(List<ItemForRemove> removedItems, NoteStructureResult result, Guid noteId)
    {
        if (removedItems == null || !removedItems.Any())
        {
            return;
        }

        var removeIds = removedItems.Select(x => x.Id).ToList();
        result.Updates.ContentIdsToDelete = await collectionLinkedService.RemoveCollectionsAndUnLinkFiles(removeIds, noteId);

        await baseNoteContentRepository.ExecuteDeleteAsync(x => removeIds.Contains(x.Id) && x.NoteId == noteId);

        result.Updates.ContentIdsToDelete = removeIds;
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


    private BaseNoteContent GetNewTextContent(NewTextContent textDto, Guid noteId)
    {
        var textDb = BaseNoteContent.CreateTextNote();

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
    private BaseNoteContent GetCollectionContent(NewCollectionContent baseContent, Guid noteId, ContentTypeEnumDTO fileTypeEnum)
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

    private BaseNoteContent GetCollectionContent(NewCollectionContent baseContent, Guid noteId, FileTypeEnum fileTypeEnum)
    {
        var content = BaseNoteContent.CreateCollectionNote(fileTypeEnum);

        // UPDATE BASE
        content.PrevId = baseContent.Id;
        content.Order = baseContent.Order;
        content.SetDateAndVersion();

        content.NoteId = noteId;

        return content;
    }
}