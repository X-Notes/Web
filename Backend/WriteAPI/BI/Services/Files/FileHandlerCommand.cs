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
        IRequestHandler<SavePhotosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveDocumentToNoteCommand, AppFile>,
        IRequestHandler<SaveVideoToNoteCommand, AppFile>,
        IRequestHandler<SaveBackgroundCommand, AppFile>,
        IRequestHandler<SaveUserPhotoCommand, AppFile>,
        IRequestHandler<CopyBlobFromContainerToContainerCommand, AppFile>,
        IRequestHandler<RemoveFilesCommand, Unit>,
        IRequestHandler<RemoveFilesFromStorageCommand, Unit>,
        IRequestHandler<CreateUserContainerCommand, Unit>
    {
        private readonly IFilesStorage filesStorage;

        private readonly IImageProcessor imageProcessor;

        private readonly FileRepository fileRepository;

        private readonly VideoNoteAppFileRepository videoNoteAppFileRepository;

        private readonly DocumentNoteAppFileRepository documentNoteAppFileRepository;

        private readonly AudioNoteAppFileRepository audioNoteAppFileRepository;

        private readonly PhotoNoteAppFileRepository albumNoteAppFileRepository;

        public FileHandlerCommand(
            IFilesStorage filesStorage,
            IImageProcessor imageProcessor,
            FileRepository fileRepository,
            VideoNoteAppFileRepository videoNoteAppFileRepository,
            DocumentNoteAppFileRepository documentNoteAppFileRepositoryy,
            AudioNoteAppFileRepository audioNoteAppFileRepository,
            PhotoNoteAppFileRepository albumNoteAppFileRepository)
        {
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
            this.fileRepository = fileRepository;
            this.videoNoteAppFileRepository = videoNoteAppFileRepository;
            this.documentNoteAppFileRepository = documentNoteAppFileRepositoryy;
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
                var bigFile = await filesStorage.SaveFile(userId.ToString(), thumbs[bigType].Bytes, contentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(userId.ToString(), thumbs[mediumType].Bytes, contentType, ContentTypesFile.Photos, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Photos, photoType);

                return new AppFile(minFile.FilePath, mediumFile.FilePath, bigFile.FilePath, contentType,
                    thumbs[bigType].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length,
                    FileTypeEnum.Photo, userId, fileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(userId.ToString(), thumbs[mediumType].Bytes, contentType, ContentTypesFile.Photos, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Photos, photoType);

                return new AppFile(minFile.FilePath, mediumFile.FilePath, defaultFile.FilePath, contentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length,
                    FileTypeEnum.Photo, userId, fileName);
            }
            else if (thumbs.ContainsKey(minType))
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Photos, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Photos, photoType);

                return new AppFile(minFile.FilePath, defaultFile.FilePath, null, contentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length,
                    FileTypeEnum.Photo, userId, fileName);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Photos, photoType);
                return new AppFile(defaultFile.FilePath, null, null, contentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, userId, fileName);
            }
        }

        public async Task<List<AppFile>> Handle(SavePhotosToNoteCommand request, CancellationToken cancellationToken)
        {
            var fileList = new List<AppFile>();
            foreach (var photoFile in request.FilesBytes)
            {
                var fileDB = await ProcessNotePhotos(request.UserId, photoFile.Bytes, photoFile.ContentType, photoFile.FileName);
                fileList.Add(fileDB);
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
                    FileTypeEnum.Document => await documentNoteAppFileRepository.ExistGroupByContainsIds(fileIds),
                    FileTypeEnum.Audio => await audioNoteAppFileRepository.ExistGroupByContainsIds(fileIds),
                    FileTypeEnum.Video => await videoNoteAppFileRepository.ExistGroupByContainsIds(fileIds),
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

            var pathes = files.SelectMany(x => x.GetNotNullPathes()).ToList();
            await Handle(new RemoveFilesFromStorageCommand(pathes, userId), CancellationToken.None);
        }

        public async Task<AppFile> Handle(SaveDocumentToNoteCommand request, CancellationToken cancellationToken)
        {
            var file = request.FileBytes;
            var blob = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Documents, FileHelper.GetExtension(file.FileName));
            return new AppFile(blob.FilePath, file.ContentType, file.Bytes.Length, FileTypeEnum.Document, request.UserId, file.FileName);
        }

        public async Task<AppFile> Handle(SaveVideoToNoteCommand request, CancellationToken cancellationToken)
        {
            var file = request.FileBytes;
            var blob = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Videos, FileHelper.GetExtension(file.FileName));
            return new AppFile(blob.FilePath, file.ContentType, file.Bytes.Length, FileTypeEnum.Video, request.UserId, file.FileName);
        }

        public async Task<List<AppFile>> Handle(SaveAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var files = new List<AppFile>();
            foreach (var audio in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(request.UserId.ToString(), audio.Bytes, audio.ContentType, ContentTypesFile.Audios, FileHelper.GetExtension(audio.FileName));
                files.Add(new AppFile(blob.FilePath, audio.ContentType, audio.Bytes.Length,
                    FileTypeEnum.Audio, request.UserId, audio.FileName));
            }
            return files;
        }

        public async Task<AppFile> Handle(CopyBlobFromContainerToContainerCommand request, CancellationToken cancellationToken)
        {
            if (request.ContentTypesFile == ContentTypesFile.Photos)
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
                var bigFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[bigType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                return new AppFile(null, mediumFile.FilePath, bigFile.FilePath, request.FileBytes.ContentType,
                    thumbs[bigType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                return new AppFile(null, mediumFile.FilePath, defaultFile.FilePath, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                return new AppFile(defaultFile.FilePath, null, null, request.FileBytes.ContentType,
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
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[superMinType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                return new AppFile(minFile.FilePath, mediumFile.FilePath, null, request.FileBytes.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else if (thumbs.ContainsKey(superMinType))
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[superMinType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                return new AppFile(minFile.FilePath, defaultFile.FilePath, null, request.FileBytes.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                return new AppFile(minFile.FilePath, null, null, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
        }

        public async Task<Unit> Handle(CreateUserContainerCommand request, CancellationToken cancellationToken)
        {
            await filesStorage.CreateUserContainer(request.UserId);
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveFilesFromStorageCommand request, CancellationToken cancellationToken)
        {
            await filesStorage.RemoveFiles(request.UserId, request.Pathes.ToArray());
            return Unit.Value;
        }
    }
}
