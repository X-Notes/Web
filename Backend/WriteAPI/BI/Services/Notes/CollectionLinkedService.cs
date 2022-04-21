using Common.DatabaseModels.Models.Files;
using Common.DTO.Notes.Collection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public sealed class CollectionLinkedService
    {
        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        private readonly CollectionAppFileRepository collectionNoteAppFileRepository;

        private readonly SnapshotFileContentRepository snapshotFileContentRepository;

        public CollectionLinkedService(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            SnapshotFileContentRepository snapshotFileContentRepository)
        {
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
            this.snapshotFileContentRepository = snapshotFileContentRepository;
        }

        public async Task<List<Guid>> TryToUnlink(IEnumerable<UnlinkMetaData> data)
        {
            var ids = data.Select(x => x.Id).ToHashSet().ToArray();
            var fileIdsToUnlink = await GetItemsThatCanBeUnlinked(ids);

            var idsToRemove = data.Where(x => fileIdsToUnlink.Contains(x.Id)).SelectMany(x => x.GetIds()).Distinct().ToList();
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => idsToRemove.Contains(x.AppFileId) && x.StatusId == AppFileUploadStatusEnum.Linked);

            if (infos.Any())
            {
                infos.ForEach(x => x.SetUnLinked());
                await appFileUploadInfoRepository.UpdateRangeAsync(infos);
            }

            return fileIdsToUnlink;
        }

        private async Task<List<Guid>> GetItemsThatCanBeUnlinked(params Guid[] ids)
        {
            var histIds = await snapshotFileContentRepository.GetFileIdsThatExist(ids);
            var dbIds = await collectionNoteAppFileRepository.GetFileIdsThatExist(ids);
            return ids.Except(dbIds).Except(histIds).ToList();
        }

        public async Task<bool> TryLink(params Guid[] ids)
        {
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => ids.Contains(x.AppFileId) && x.StatusId == AppFileUploadStatusEnum.UnLinked);
            if (infos.Any())
            {
                infos.ForEach(x => x.SetLinked());
                await appFileUploadInfoRepository.UpdateRangeAsync(infos);

                return true;
            }

            return false;
        }

        public async Task<List<Guid>> UnLinkCollections(IEnumerable<Guid> collectionIdsToDelete)
        {
            if (!collectionIdsToDelete.Any()) return new List<Guid>();

            var collections = await collectionNoteAppFileRepository.GetAppFilesByContentIds(collectionIdsToDelete.ToList());

            var filesToProcess = collections.Select(x => x.AppFile).Select(x => new UnlinkMetaData
            {
                Id = x.Id,
                AdditionalIds = x.GetAdditionalIds() 
            });

            await collectionNoteAppFileRepository.RemoveRangeAsync(collections);
            await TryToUnlink(filesToProcess);

            return collections.Select(x => x.CollectionNoteId).ToList();
        }
    }
}
