using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO.Notes.Collection;
using DatabaseContext.Repositories.NoteContent;

namespace Editor.Services;

public class BaseCollectionHandler
{

    protected readonly BaseNoteContentRepository baseNoteContentRepository;

    protected readonly CollectionAppFileRepository collectionNoteAppFileRepository;

    protected readonly CollectionLinkedService collectionLinkedService;

    public BaseCollectionHandler(
        BaseNoteContentRepository baseNoteContentRepository,
        CollectionAppFileRepository collectionNoteAppFileRepository,
        CollectionLinkedService collectionLinkedService)
    {
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
        this.collectionLinkedService = collectionLinkedService;
    }

    public async Task<(List<Guid> deleteFileIds, BaseNoteContent collection)> RemoveFilesFromCollectionAsync(Guid collectionId, List<Guid> fileIdsToDelete)
    {
        var collection = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == collectionId);
        var collectionItems = await collectionNoteAppFileRepository.GetCollectionItems(fileIdsToDelete, collectionId);

        if (collection == null || collectionItems == null || !collectionItems.Any())
        {
            return (null, null);
        }

        await collectionNoteAppFileRepository.RemoveRangeAsync(collectionItems);
        var fileIds = collectionItems.Select(x => x.AppFileId).ToList();

        var data = collectionItems.Select(x => new UnlinkMetaData(x.AppFileId));
        var idsToUnlink = await collectionLinkedService.TryToUnlink(data);

        collection.SetDateAndVersion();
        await baseNoteContentRepository.UpdateAsync(collection);

        return (fileIds, collection);
    }

    public async Task<(List<Guid> deleteFileIds, BaseNoteContent collection)> AddFilesToCollectionAsync(Guid collectionId, List<Guid> fileIdsToAdd)
    {
        var collection = await baseNoteContentRepository.FirstOrDefaultAsync(x => x.Id == collectionId);
        if (collection == null || fileIdsToAdd == null || fileIdsToAdd.Count == 0) return (null, null);

        var existCollectionItems = await collectionNoteAppFileRepository.GetWhereAsync(x => fileIdsToAdd.Contains(x.AppFileId));
        var existCollectionItemsIds = existCollectionItems.Select(x => x.AppFileId);

        var collectionItems = fileIdsToAdd.Except(existCollectionItemsIds).Select(id => new CollectionNoteAppFile { AppFileId = id, BaseNoteContentId = collection.Id });
        await collectionNoteAppFileRepository.AddRangeAsync(collectionItems);

        var idsToLink = collectionItems.Select(x => x.AppFileId).ToList();
        await collectionLinkedService.TryLink(idsToLink);

        collection.SetDateAndVersion();
        await baseNoteContentRepository.UpdateAsync(collection);

        return (idsToLink, collection);
    }
}
