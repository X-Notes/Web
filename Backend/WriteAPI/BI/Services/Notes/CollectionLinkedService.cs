using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.NoteContent;
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


        private readonly AudioNoteAppFileRepository audioNoteAppFileRepository;

        private readonly DocumentNoteAppFileRepository documentNoteAppFileRepository;

        private readonly PhotoNoteAppFileRepository photoNoteAppFileRepository;

        private readonly VideoNoteAppFileRepository videoNoteAppFileRepository;

        private readonly SnapshotFileContentRepository snapshotFileContentRepository;

        private readonly IMediator _mediator;

        public CollectionLinkedService(
            AppFileUploadInfoRepository appFileUploadInfoRepository,
            FileRepository fileRepository,
            AudioNoteAppFileRepository audioNoteAppFileRepository,
            DocumentNoteAppFileRepository documentNoteAppFileRepository,
            PhotoNoteAppFileRepository photoNoteAppFileRepository,
            VideoNoteAppFileRepository videoNoteAppFileRepository,
            SnapshotFileContentRepository snapshotFileContentRepository,
            IMediator _mediator)
        {
            this.appFileUploadInfoRepository = appFileUploadInfoRepository;
            this.fileRepository = fileRepository;
            this.audioNoteAppFileRepository = audioNoteAppFileRepository;
            this.documentNoteAppFileRepository = documentNoteAppFileRepository;
            this.photoNoteAppFileRepository = photoNoteAppFileRepository;
            this.videoNoteAppFileRepository = videoNoteAppFileRepository;
            this.snapshotFileContentRepository = snapshotFileContentRepository;
            this._mediator = _mediator;
        }

        public async Task<bool> TryToUnlink(FileTypeEnum fileType, params Guid[] ids)
        {
            var infos = await appFileUploadInfoRepository.GetWhereAsync(x => ids.Contains(x.AppFileId) && x.StatusId == AppFileUploadStatusEnum.Linked);

            var fileIdsToUnlink = await GetItemsThatCanBeUnlinked(fileType, ids);

            infos = infos.Where(x => fileIdsToUnlink.Contains(x.AppFileId)).ToList();

            if (infos.Any())
            {
                infos.ForEach(x => x.SetUnLinked());
                await appFileUploadInfoRepository.UpdateRangeAsync(infos);

                return true;
            }

            return false;
        }

        private async Task<List<Guid>> GetItemsThatCanBeUnlinked(FileTypeEnum fileType, params Guid[] ids)
        {
            var histIds = await snapshotFileContentRepository.GetFileIdsThatExist(ids);
            switch (fileType)
            {
                case FileTypeEnum.Audio:
                    {
                        var dbIds = await audioNoteAppFileRepository.GetFileIdsThatExist(ids);
                        return ids.Except(dbIds).Except(histIds).ToList();
                    }
                case FileTypeEnum.Photo:
                    {
                        var dbIds = await photoNoteAppFileRepository.GetFileIdsThatExist(ids);
                        return ids.Except(dbIds).Except(histIds).ToList();
                    }
                case FileTypeEnum.Video:
                    {
                        var dbIds = await videoNoteAppFileRepository.GetFileIdsThatExist(ids);
                        return ids.Except(dbIds).Except(histIds).ToList();
                    }
                case FileTypeEnum.Document:
                    {
                        var dbIds = await documentNoteAppFileRepository.GetFileIdsThatExist(ids);
                        return ids.Except(dbIds).Except(histIds).ToList();
                    }
                default:
                    {
                        throw new ArgumentException(message: "Invalid enum value");
                    }
            }
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

        public async Task<List<Guid>> UnlinkAndRemoveFileItems(IEnumerable<BaseNoteContent> contentsToDelete, Guid noteId, Guid userId, bool isCheckPermissions = true)
        {
            List<Guid> result = new();
            var groups = contentsToDelete.GroupBy(x => x.ContentTypeId);
            foreach(var group in groups)
            {
                var ids = group.Select(x => x.Id).ToList();
                var command = group.Key switch
                {
                    ContentTypeENUM.AudiosCollection => await _mediator.Send(new UnlinkFilesAndRemoveAudiosCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    ContentTypeENUM.PhotosCollection => await _mediator.Send(new UnlinkFilesAndRemovePhotosCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    ContentTypeENUM.VideosCollection => await _mediator.Send(new UnlinkFilesAndRemoveVideosCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    ContentTypeENUM.DocumentsCollection => await _mediator.Send(new UnlinkFilesAndRemoveDocumentsCollectionsCommand(noteId, ids, userId, isCheckPermissions)),
                    _ => null
                };
                result.AddRange(ids);
            }
            return result;
        }
    }
}
