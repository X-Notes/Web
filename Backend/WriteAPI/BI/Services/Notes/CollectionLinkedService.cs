using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Domain.Commands.NoteInner.FileContent.Audios;
using Domain.Commands.NoteInner.FileContent.Documents;
using Domain.Commands.NoteInner.FileContent.Photos;
using Domain.Commands.NoteInner.FileContent.Videos;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Notes
{
    public sealed class CollectionLinkedService
    {
        private readonly AppFileUploadInfoRepository appFileUploadInfoRepository;

        private readonly FileRepository fileRepository;

        private readonly CollectionAppFileRepository collectionNoteAppFileRepository;

        private readonly SnapshotFileContentRepository snapshotFileContentRepository;

        private readonly IMediator _mediator;

        public CollectionLinkedService(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            FileRepository fileRepository,
            CollectionAppFileRepository collectionNoteAppFileRepository,
            SnapshotFileContentRepository snapshotFileContentRepository,
            IMediator _mediator)
        {
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this.fileRepository = fileRepository;
            this.collectionNoteAppFileRepository = collectionNoteAppFileRepository;
            this.snapshotFileContentRepository = snapshotFileContentRepository;
            this._mediator = _mediator;
        }

        public async Task<bool> TryToUnlink(params Guid[] ids)
        {
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => ids.Contains(x.AppFileId) && x.StatusId == AppFileUploadStatusEnum.Linked);

            var fileIdsToUnlink = await GetItemsThatCanBeUnlinked(ids);

            infos = infos.Where(x => fileIdsToUnlink.Contains(x.AppFileId)).ToList();

            if (infos.Any())
            {
                infos.ForEach(x => x.SetUnLinked());
                await appFileUploadInfoRepository.UpdateRangeAsync(infos);

                return true;
            }

            return false;
        }

        private async Task<List<Guid>> GetItemsThatCanBeUnlinked(params Guid[] ids)
        {
            var histIds = await snapshotFileContentRepository.GetFileIdsThatExist(ids);
            var dbIds = await collectionNoteAppFileRepository.GetFileIdsThatExist(ids);
            return ids.Except(dbIds).Except(histIds).ToList();
        }

        public async Task<bool> TryLink(List<AppFile> files)
        {
            var flag = files.Any(x => x.AppFileUploadInfo == null);

            if (flag)
            {
                throw new Exception("AppFileUploadInfo is null");
            }

            var filesToLink = files.Where(x => x.AppFileUploadInfo.StatusId == AppFileUploadStatusEnum.UnLinked).ToList();

            if (filesToLink.Any())
            {
                filesToLink.ForEach(x => x.AppFileUploadInfo.SetLinked());
                await fileRepository.UpdateRangeAsync(files);

                return true;
            }

            return false;
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

        public async Task<bool> TryLink(AppFile file)
        {
            if (file.AppFileUploadInfo == null)
            {
                throw new Exception("AppFileUploadInfo is null");
            }

            if(file.AppFileUploadInfo.StatusId == AppFileUploadStatusEnum.UnLinked)
            {
                file.AppFileUploadInfo.SetLinked();
                await fileRepository.UpdateAsync(file);

                return true;
            }

            return false;
        }

        public async Task<List<Guid>> UnlinkAndRemoveFileItems(IEnumerable<CollectionNote> contentsToDelete, Guid noteId, Guid userId, bool isCheckPermissions = true)
        {
            List<Guid> result = new();
            var groups = contentsToDelete.GroupBy(x => x.FileTypeId);
            foreach(var group in groups)
            {
                var ids = group.Select(x => x.Id).ToList();
                var command = group.Key switch
                {
                    FileTypeEnum.Audio => await _mediator.Send(new UnlinkFilesAndRemoveAudiosCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    FileTypeEnum.Photo => await _mediator.Send(new UnlinkFilesAndRemovePhotosCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    FileTypeEnum.Video => await _mediator.Send(new UnlinkFilesAndRemoveVideosCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    FileTypeEnum.Document => await _mediator.Send(new UnlinkFilesAndRemoveDocumentsCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    _ => null
                };
                result.AddRange(ids);
            }
            return result;
        }
    }
}
