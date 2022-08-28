using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Common.DTO.Files;
using ContentProcessing;
using MediatR;
using Noots.DatabaseContext.Repositories.Files;
using Noots.Mapper.Mapping;
using Noots.Storage.Commands;

namespace Noots.Storage.Impl
{
    public class FileHandlerCommand :
        IRequestHandler<SavePhotosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveDocumentsToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveVideosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveBackgroundCommand, AppFile>,
        IRequestHandler<SaveUserPhotoCommand, AppFile>,
        IRequestHandler<CopyBlobFromContainerToContainerCommand, AppFile>,
        IRequestHandler<RemoveFilesCommand, Unit>,
        IRequestHandler<RemoveFilesFromStorageCommand, Unit>,
        IRequestHandler<CreateUserContainerCommand, Unit>,
        IRequestHandler<UpdateFileMetaDataCommand, OperationResult<FileDTO>>
    {
        private readonly IFilesStorage filesStorage;

        private readonly IImageProcessor imageProcessor;

        private readonly FileRepository fileRepository;
        
        private readonly NoteFolderLabelMapper noteFolderLabelMapper;

        public FileHandlerCommand(
            IFilesStorage filesStorage,
            IImageProcessor imageProcessor,
            FileRepository fileRepository,
            NoteFolderLabelMapper noteFolderLabelMapper)
        {
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
            this.fileRepository = fileRepository;
            this.noteFolderLabelMapper = noteFolderLabelMapper;
        }

        public async Task<AppFile> ProcessNotePhotos(Guid userId, byte[] bytes, string contentType, string fileName)
        {
            var photoType = GetExtensionByMIME(contentType);

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
            var pathes = request.AppFiles.SelectMany(x => x.GetNotNullPathes()).ToList();
            await Handle(new RemoveFilesFromStorageCommand(pathes, request.UserId), CancellationToken.None);
            await fileRepository.RemoveRangeAsync(request.AppFiles);

            return Unit.Value;
        }


        public async Task<List<AppFile>> Handle(SaveDocumentsToNoteCommand request, CancellationToken cancellationToken)
        {
            var files = new List<AppFile>();
            foreach (var file in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Documents, GetExtensionByMIME(file.ContentType));
                files.Add(new AppFile(blob.FilePath, file.ContentType, file.Bytes.Length, FileTypeEnum.Document, request.UserId, file.FileName));
            }
            return files;
        }

        public async Task<List<AppFile>> Handle(SaveVideosToNoteCommand request, CancellationToken cancellationToken)
        {
            var files = new List<AppFile>();
            foreach (var file in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Videos, GetExtensionByMIME(file.ContentType));
                files.Add(new AppFile(blob.FilePath, file.ContentType, file.Bytes.Length, FileTypeEnum.Video, request.UserId, file.FileName));
            }
            return files;
        }

        public async Task<List<AppFile>> Handle(SaveAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var files = new List<AppFile>();
            foreach (var audio in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(request.UserId.ToString(), audio.Bytes, audio.ContentType, ContentTypesFile.Audios, GetExtensionByMIME(audio.ContentType));
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
                    pathSmall = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathPhotoSmall, request.UserToId.ToString(), request.ContentTypesFile, GetExtensionByMIME(request.AppFile.ContentType));
                }

                if (request.AppFile.PathPhotoMedium != null)
                {
                    pathMedium = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathPhotoMedium, request.UserToId.ToString(), request.ContentTypesFile, GetExtensionByMIME(request.AppFile.ContentType));
                }

                if (request.AppFile.PathPhotoBig != null)
                {
                    pathBig = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathPhotoBig, request.UserToId.ToString(), request.ContentTypesFile, GetExtensionByMIME(request.AppFile.ContentType));
                }

                return new AppFile(pathSmall, pathMedium, pathBig, request.AppFile, request.UserToId);
            }
            else
            {
                var pathToCreatedFile = await filesStorage.CopyBlobAsync(request.UserFromId.ToString(), request.AppFile.PathNonPhotoContent, request.UserToId.ToString(), request.ContentTypesFile, GetExtensionByMIME(request.AppFile.ContentType));
                return new AppFile(pathToCreatedFile, request.AppFile, request.UserToId);
            }
        }

        public async Task<AppFile> Handle(SaveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var photoType = GetExtensionByMIME(request.FileBytes.ContentType);

            using var ms = new MemoryStream(request.FileBytes.Bytes);
            ms.Position = 0;

            var bigType = CopyType.Big;
            var mediumType = CopyType.Medium;
            var thumbs = await imageProcessor.ProcessCopies(ms, bigType, mediumType);

            AppFile resultFile;
            if (thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[bigType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                resultFile = new AppFile(null, mediumFile.FilePath, bigFile.FilePath, request.FileBytes.ContentType,
                    thumbs[bigType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                resultFile = new AppFile(null, mediumFile.FilePath, defaultFile.FilePath, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);

                resultFile = new AppFile(defaultFile.FilePath, null, null, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }

            resultFile.AppFileUploadInfo = new AppFileUploadInfo().SetLinked();
            return resultFile;
        }

        public async Task<AppFile> Handle(SaveUserPhotoCommand request, CancellationToken cancellationToken)
        {
            var photoType = GetExtensionByMIME(request.FileBytes.ContentType);

            using var ms = new MemoryStream(request.FileBytes.Bytes);
            ms.Position = 0;

            var superMinType = CopyType.SuperMin;
            var mediumType = CopyType.Medium;

            var thumbs = await imageProcessor.ProcessCopies(ms, superMinType, mediumType);

            AppFile resultFile;
            if (thumbs.ContainsKey(mediumType))
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[superMinType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var mediumFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[mediumType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                resultFile = new AppFile(minFile.FilePath, mediumFile.FilePath, null, request.FileBytes.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[mediumType].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else if (thumbs.ContainsKey(superMinType))
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[superMinType].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                var defaultFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                resultFile = new AppFile(minFile.FilePath, defaultFile.FilePath, null, request.FileBytes.ContentType,
                    thumbs[superMinType].Bytes.Length + thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }
            else
            {
                var minFile = await filesStorage.SaveFile(request.UserId.ToString(), thumbs[CopyType.Default].Bytes, request.FileBytes.ContentType, ContentTypesFile.Photos, photoType);
                resultFile = new AppFile(minFile.FilePath, null, null, request.FileBytes.ContentType,
                    thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, request.UserId, request.FileBytes.FileName);
            }

            resultFile.AppFileUploadInfo = new AppFileUploadInfo().SetLinked();
            return resultFile;
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

        public async Task<OperationResult<FileDTO>> Handle(UpdateFileMetaDataCommand request, CancellationToken cancellationToken)
        {
            var file = await fileRepository.FirstOrDefaultAsync(x => x.Id == request.FileId);
            if (file is not null)
            {
                file.MetaData = file.MetaData ?? new AppFileMetaData();
                file.MetaData.SecondsDuration = request.SecondsDuration;

                var imageFile = await fileRepository.FirstOrDefaultAsync(x => x.Id == request.ImageFileId);
                if (imageFile is not null && file.MetaData != null && !file.MetaData.ImageFileId.HasValue)
                {
                    file.MetaData.ImageFileId = imageFile.Id;
                    file.MetaData.ImagePath = imageFile.GetFromSmallPath;
                }

                await fileRepository.UpdateAsync(file);

                if (!string.IsNullOrEmpty(file.MetaData?.ImagePath))
                {
                    file.MetaData.ImagePath = noteFolderLabelMapper.BuildFilePath(request.UserId,file.MetaData.ImagePath);
                };
                
                var respResult = new FileDTO(file.Id, file.PathPhotoSmall, file.PathPhotoMedium, file.PathPhotoBig, file.PathNonPhotoContent, file.Name, file.UserId, file.MetaData, file.CreatedAt);
                return new OperationResult<FileDTO>(true, respResult);
            }

            return new OperationResult<FileDTO>().SetNotFound();
        }

        public static string GetExtensionByMIME(string mime) => mime switch
        {
            "image/png" => ".png",
            "image/jpeg" => ".jpeg",
            "video/mp4" => ".mp4",
            "audio/mpeg" => ".mp3",
            "audio/wav" => ".wav",
            "audio/ogg" => ".ogg",
            "video/ogg" => ".ogg",
            "application/pdf" => ".pdf",
            "application/msword" => ".doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => ".docx",
            "application/rtf" => ".rtf",
            "text/plain" => ".txt",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => ".xlsx",
            "application/vnd.ms-excel" => ".xls",
            "application/vnd.ms-excel.sheet.macroEnabled.12" => ".xlsm",
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12" => ".xlsb",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation" => ".pptx",
            "application/vnd.ms-powerpoint" => ".ppt",
            "application/vnd.ms-powerpoint.presentation.macroEnabled.12" => ".pptm",
            "application/vnd.ms-powerpoint.slideshow.macroEnabled.12" => ".ppsm",
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow" => ".ppsx",
            _ => throw new ArgumentOutOfRangeException(nameof(mime), $"Not expected direction value: {mime}"),
        };
    }
}
