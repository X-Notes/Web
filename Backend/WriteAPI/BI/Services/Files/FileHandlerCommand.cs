using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Azure.Core;
using BI.Helpers;
using Common.DatabaseModels.Models.Files;
using ContentProcessing;
using Domain.Commands.Files;
using MediatR;
using Storage;
using WriteContext.Repositories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.Files
{
    public class FileHandlerCommand :
        IRequestHandler<SavePhotosToNoteCommand, List<SavePhotosToNoteResponse>>,
        IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveDocumentToNoteCommand, AppFile>,
        IRequestHandler<SaveVideoToNoteCommand, AppFile>,
        IRequestHandler<SaveBackgroundCommand, AppFile>,
        IRequestHandler<SaveUserPhotoCommand, AppFile>,
        IRequestHandler<CopyBlobFromContainerToContainerCommand, AppFile>,
        IRequestHandler<RemoveFilesCommand, Unit>
    {
        private readonly IFilesStorage filesStorage;

        private readonly IImageProcessor imageProcessor;

        private readonly FileRepository fileRepository;

        private readonly VideoNoteRepository videoNoteRepository;

        private readonly DocumentNoteRepository documentNoteRepository;

        private readonly AudioNoteAppFileRepository audioNoteAppFileRepository;

        private readonly AlbumNoteAppFileRepository albumNoteAppFileRepository;

        public FileHandlerCommand(
            IFilesStorage filesStorage,
            IImageProcessor imageProcessor,
            FileRepository fileRepository,
            VideoNoteRepository videoNoteRepository,
            DocumentNoteRepository documentNoteRepository,
            AudioNoteAppFileRepository audioNoteAppFileRepository,
            AlbumNoteAppFileRepository albumNoteAppFileRepository)
        {
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
            this.fileRepository = fileRepository;
            this.videoNoteRepository = videoNoteRepository;
            this.documentNoteRepository = documentNoteRepository;
            this.audioNoteAppFileRepository = audioNoteAppFileRepository;
            this.albumNoteAppFileRepository = albumNoteAppFileRepository;
        }


        public async Task<AppFile> ProcessNotePhotos(Guid userId, byte[] bytes, string contentType, string fileName)
        {
            var photoType = FileHelper.GetExtension(fileName);

            using var ms = new MemoryStream(bytes);
            ms.Position = 0;

            var minType = CopyType.Min;
            var mediumType = CopyType.Medium;
            var bigType = CopyType.Big;

            var thumbs = await imageProcessor.ProcessCopies(ms, minType, mediumType, bigType);

            if (thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(userId.ToString(), thumbs[bigType].Bytes, contentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(userId.ToString(), thumbs[mediumType].Bytes, contentType, ContentTypesFile.Images, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, mediumFile, bigFile, contentType,
                    thumbs[bigType].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length,
                    FileTypeEnum.Photo, userId, fileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(userId.ToString(), thumbs[mediumType].Bytes, contentType, ContentTypesFile.Images, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, mediumFile, defaultFile, contentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length,
                    FileTypeEnum.Photo, userId, fileName);
            }
            else if (thumbs.ContainsKey(minType))
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Images, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, defaultFile, null, contentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length,
                    FileTypeEnum.Photo, userId, fileName);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Images, photoType);
                return new AppFile(defaultFile, null, null, contentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, userId, fileName);
            }
        }

        public async Task<List<SavePhotosToNoteResponse>> Handle(SavePhotosToNoteCommand request, CancellationToken cancellationToken)
        {
            var fileList = new List<SavePhotosToNoteResponse>();
            foreach (var photoFile in request.FilesBytes)
            {
                var fileDB = await ProcessNotePhotos(request.UserId, photoFile.Bytes, photoFile.ContentType, photoFile.FileName);
                fileList.Add(new SavePhotosToNoteResponse(fileDB, photoFile));
            }
            return fileList;
        }

        public async Task<Unit> Handle(RemoveFilesCommand request, CancellationToken cancellationToken)
        {

            if (request.IsNoCheckDelete)
            {
                await DeletePermanentlyFiles(request.AppFiles, request.UserId);
                return Unit.Value;
            }

            var filesGroups = request.AppFiles.GroupBy(x => x.FileTypeId);

            foreach (var filesGroup in filesGroups)
            {

                var fileIds = filesGroup.Select(x => x.Id);

                var existIds = filesGroup.Key switch
                {
                    FileTypeEnum.Photo => await albumNoteAppFileRepository.ExistGroupByContainsIds(fileIds),
                    FileTypeEnum.Document => await documentNoteRepository.ExistGroupByContainsIds(fileIds),
                    FileTypeEnum.Audio => await audioNoteAppFileRepository.ExistGroupByContainsIds(fileIds),
                    FileTypeEnum.Video => await videoNoteRepository.ExistGroupByContainsIds(fileIds),
                    _ => throw new Exception("Incorrect file type")
                };

                var idsForDeleting = fileIds.Except(existIds);

                if (idsForDeleting.Any())
                {
                    var filesForDelete = request.AppFiles.Where(x => idsForDeleting.Contains(x.Id)).ToList();
                    await DeletePermanentlyFiles(filesForDelete, request.UserId);
                }
            }

            return Unit.Value;
        }

        public async Task DeletePermanentlyFiles(List<AppFile> files, string userId)
        {
            await fileRepository.RemoveRangeAsync(files);
            await filesStorage.RemoveFiles(userId, files.SelectMany(x => x.GetNotNullPathes()).ToArray());
        }

        public async Task<AppFile> Handle(SaveDocumentToNoteCommand request, CancellationToken cancellationToken)
        {
            var file = request.FileBytes;
            var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Files, FileHelper.GetExtension(file.FileName));
            return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Document, request.UserId, file.FileName);
        }

        public async Task<AppFile> Handle(SaveVideoToNoteCommand request, CancellationToken cancellationToken)
        {
            var file = request.FileBytes;
            var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Videos, FileHelper.GetExtension(file.FileName));
            return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Video, request.UserId, file.FileName);
        }

        public async Task<List<AppFile>> Handle(SaveAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var files = new List<AppFile>();
            foreach (var audio in request.FileBytes)
            {
                var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), audio.Bytes, audio.ContentType, ContentTypesFile.Audios, FileHelper.GetExtension(audio.FileName));
                files.Add(new AppFile(pathToCreatedFile, audio.ContentType, audio.Bytes.Length,
                    FileTypeEnum.Audio, request.UserId, audio.FileName));
            }
            return files;
        }

        public async Task<AppFile> Handle(CopyBlobFromContainerToContainerCommand request, CancellationToken cancellationToken)
        {
            if (request.ContentTypesFile == ContentTypesFile.Images)
            {
                string pathSmall = null;
                string pathMedium = null;
                string pathBig = null;

                if (request.AppFile.PathPhotoSmall != null)
                {
                    pathSmall = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathPhotoSmall, request.UserToId.ToString(), request.ContentTypesFile, FileHelper.GetExtension(request.AppFile.Name));
                }

                if(request.AppFile.PathPhotoMedium != null)
                {
                    pathMedium = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathPhotoMedium, request.UserToId.ToString(), request.ContentTypesFile, FileHelper.GetExtension(request.AppFile.Name));
                }

                if(request.AppFile.PathPhotoBig != null)
                {
                    pathBig = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathPhotoBig, request.UserToId.ToString(), request.ContentTypesFile, FileHelper.GetExtension(request.AppFile.Name));
                }

                return new AppFile(pathSmall, pathMedium, pathBig, request.AppFile, request.UserToId);
            }
            else
            {
                var pathToCreatedFile = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathNonPhotoContent, request.UserToId.ToString(), request.ContentTypesFile, FileHelper.GetExtension(request.AppFile.Name));
                return new AppFile(pathToCreatedFile, request.AppFile, request.UserToId);
            }
        }

        public async Task<AppFile> Handle(SaveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var photoType = FileHelper.GetExtension(request.FileBytes.FileName);

            using var ms = new MemoryStream(request.FileBytes.Bytes);
            ms.Position = 0;

            var bigType = CopyType.Big;
            var mediumType = CopyType.Medium;
            var thumbs = await imageProcessor.ProcessCopies(ms, bigType, mediumType);

            if (thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[bigType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);

                return new AppFile(null, mediumFile, bigFile, request.FileBytes.ContentType,
                    thumbs[bigType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);

                return new AppFile(null, mediumFile, defaultFile, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);

                return new AppFile(defaultFile, null, null, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
        }

        public async Task<AppFile> Handle(SaveUserPhotoCommand request, CancellationToken cancellationToken)
        {
            var photoType = FileHelper.GetExtension(request.FileBytes.FileName);

            using var ms = new MemoryStream(request.FileBytes.Bytes);
            ms.Position = 0;

            var superMinType = CopyType.SuperMin;
            var mediumType = CopyType.Medium;

            var thumbs = await imageProcessor.ProcessCopies(ms, superMinType, mediumType);

            if (thumbs.ContainsKey(mediumType))
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[superMinType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, mediumFile, null, request.FileBytes.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else if (thumbs.ContainsKey(superMinType))
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[superMinType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, defaultFile, null, request.FileBytes.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Images, photoType);
                return new AppFile(minFile, null, null, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
        }
    }
}
