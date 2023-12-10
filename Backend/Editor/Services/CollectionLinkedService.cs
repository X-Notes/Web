using Common.DTO.Notes.Collection;
using DatabaseContext.Repositories.Files;
using DatabaseContext.Repositories.Histories;
using DatabaseContext.Repositories.NoteContent;

namespace Editor.Services
{
    public sealed class CollectionLinkedService
    {
        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        private readonly CollectionAppFileRepository collectionNoteAppFileRepository;

        private readonly SnapshotFileContentRepository snapshotFileContentRepository;

        private readonly BaseNoteContentRepository collectionNoteRepository;

        private readonly FileRepository fileRepository;

        public CollectionLinkedService(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            SnapshotFileContentRepository snapshotFileContentRepository,
            BaseNoteContentRepository collectionNoteRepository,
            FileRepository fileRepository)
        {
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
            this.snapshotFileContentRepository = snapshotFileContentRepository;
            this.collectionNoteRepository = collectionNoteRepository;
            this.fileRepository = fileRepository;
        }

        public async Task<List<Guid>> TryToUnlink(IEnumerable<UnlinkMetaData> data)
        {
            var ids = data.Select(x => x.Id).ToHashSet().ToArray();
            var fileIdsToUnlink = await GetItemsThatCanBeUnlinked(ids);

            var idsToRemove = data.Where(x => fileIdsToUnlink.Contains(x.Id)).SelectMany(x => x.GetIds()).Distinct().ToList();
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => idsToRemove.Contains(x.AppFileId) && x.LinkedDate.HasValue);

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

        public async Task TryLink(IEnumerable<Guid> ids)
        {
            if (ids == null)
            {
                return;
            }
            
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => ids.Contains(x.AppFileId) && x.UnLinkedDate.HasValue);
            if (infos.Any())
            {
                infos.ForEach(x => x.SetLinked());
                await appFileUploadInfoRepository.UpdateRangeAsync(infos);
            }
        }

        public async Task<List<Guid>> RemoveCollectionsAndUnLinkFiles(IEnumerable<Guid> collectionIdsToDelete)
        {
            if (!collectionIdsToDelete.Any()) return new List<Guid>();

            var collections = await collectionNoteRepository.GetManyIncludeFiles(collectionIdsToDelete.ToList());

            var filesToProcess = collections.SelectMany(x => x.Files).Select(x => new UnlinkMetaData(x.Id));

            await collectionNoteRepository.RemoveRangeAsync(collections);
            await TryToUnlink(filesToProcess);

            return collections.Select(x => x.Id).ToList();
        }

        public async Task UnlinkFiles(IEnumerable<Guid> fileIds)
        {
            var ids = fileIds.ToHashSet();
            var files = await fileRepository.GetWhereAsync(x => ids.Contains(x.Id));
            var filesToProcess = files.Select(x => new UnlinkMetaData(x.Id));
            await TryToUnlink(filesToProcess);
        }
    }
}
