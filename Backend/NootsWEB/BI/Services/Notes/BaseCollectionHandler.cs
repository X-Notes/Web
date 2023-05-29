using Azure.Core;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DTO.Notes.Collection;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BI.Services.Notes;

public class BaseCollectionHandler
{

    protected readonly CollectionNoteRepository collectionNoteRepository;

    protected readonly CollectionAppFileRepository collectionNoteAppFileRepository;

    protected readonly CollectionLinkedService collectionLinkedService;

    public BaseCollectionHandler(
        CollectionNoteRepository collectionNoteRepository,
        CollectionAppFileRepository collectionNoteAppFileRepository,
        CollectionLinkedService collectionLinkedService)
    {
        this.collectionNoteRepository = collectionNoteRepository;
        this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
        this.collectionLinkedService = collectionLinkedService;
    }

    public async Task<(List<Guid> deleteFileIds, CollectionNote collection)> RemoveFilesFromCollectionAsync(Guid collectionId, List<Guid> fileIdsToDelete)
    {
        var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == collectionId);
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
        await collectionNoteRepository.UpdateAsync(collection);

        return (fileIds, collection);
    }

    public async Task<(List<Guid> deleteFileIds, CollectionNote collection)> AddFilesToCollectionAsync(Guid collectionId, List<Guid> fileIdsToAdd) 
    {
        var collection = await collectionNoteRepository.FirstOrDefaultAsync(x => x.Id == collectionId);
        if (collection == null || fileIdsToAdd == null || fileIdsToAdd.Count == 0) return (null, null);

        var existCollectionItems = await collectionNoteAppFileRepository.GetWhereAsync(x => fileIdsToAdd.Contains(x.AppFileId));
        var existCollectionItemsIds = existCollectionItems.Select(x => x.AppFileId);

        var collectionItems = fileIdsToAdd.Except(existCollectionItemsIds).Select(id => new CollectionNoteAppFile { AppFileId = id, CollectionNoteId = collection.Id });
        await collectionNoteAppFileRepository.AddRangeAsync(collectionItems);

        var idsToLink = collectionItems.Select(x => x.AppFileId).ToList();
        await collectionLinkedService.TryLink(idsToLink);

        collection.SetDateAndVersion();
        await collectionNoteRepository.UpdateAsync(collection);

        return (idsToLink, collection);
    }
}
