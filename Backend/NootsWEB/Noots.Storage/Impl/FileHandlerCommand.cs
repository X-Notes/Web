using Common.Azure;
using Common.DatabaseModels.Models.Files;
using Common.DTO;
using Common.DTO.Files;
using ContentProcessing;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.Files;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Storage.Commands;
using Noots.Storage.Entities;
using Noots.Storage.Impl.AzureStorage;
using Noots.Storage.Interfaces;

namespace Noots.Storage.Impl
{
    public class FileHandlerCommand :
        IRequestHandler<SavePhotosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveDocumentsToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveVideosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveBackgroundCommand, AppFile>,
        IRequestHandler<SaveUserPhotoCommand, AppFile>,
        IRequestHandler<CopyBlobFromContainerToContainerCommand, (bool success, AppFile file)>,
        IRequestHandler<RemoveFilesCommand, Unit>,
        IRequestHandler<RemoveFilesFromStorageCommand, Unit>,
        IRequestHandler<UpdateFileMetaDataCommand, OperationResult<FileDTO>>
    {
        private readonly IFilesStorage filesStorage;

        private readonly IImageProcessor imageProcessor;

        private readonly FileRepository fileRepository;

        private readonly NoteFolderLabelMapper noteFolderLabelMapper;

        private readonly PathStorageBuilder pathStorageBuilder;

        private readonly StorageIdProvider storageIdProvider;

        private readonly AzureConfig azureConfig;

        public FileHandlerCommand(
            IFilesStorage filesStorage,
            IImageProcessor imageProcessor,
            FileRepository fileRepository,
            NoteFolderLabelMapper noteFolderLabelMapper,
            PathStorageBuilder pathStorageBuilder,
            StorageIdProvider storageIdProvider,
            AzureConfig azureConfig)
        {
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
            this.fileRepository = fileRepository;
            this.noteFolderLabelMapper = noteFolderLabelMapper;
            this.pathStorageBuilder = pathStorageBuilder;
            this.storageIdProvider = storageIdProvider;
            this.azureConfig = azureConfig;
        }


        public async Task<AppFile> ProcessNotePhotos(Guid userId, byte[] bytes, string contentType, string fileName)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(ContentTypesFile.Photos);
            var contentId = pathStorageBuilder.GetContentPathFileId();
            var storageId = storageIdProvider.GetStorageId();

            using var ms = new MemoryStream(bytes);
            ms.Position = 0;

            var minType = CopyType.Min;
            var mediumType = CopyType.Medium;
            var bigType = CopyType.Big;

            var thumbs = await imageProcessor.ProcessCopies(ms, minType, mediumType, bigType);
            if (thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[bigType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.large, fileName));
                var mediumFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[mediumType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.medium, fileName));
                var minFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[minType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.small, fileName));

                var size = thumbs[bigType].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length;
                return new AppFile(contentType, size, FileTypeEnum.Photo, userId, fileName).InitPaths(storageId, prefixFolder, contentId, null, minFile.FileName, mediumFile.FileName, bigFile.FileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, fileName));
                var mediumFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[mediumType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.medium, fileName));
                var minFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[minType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.small, fileName));

                var size = thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length;
                return new AppFile(contentType, size, FileTypeEnum.Photo, userId, fileName)
                    .InitPaths(storageId, prefixFolder, contentId, defaultFile.FileName, minFile.FileName, mediumFile.FileName, null);
            }
            else if (thumbs.ContainsKey(minType))
            {
                var defaultFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, fileName));
                var minFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[minType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.small, fileName));

                var size = thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length;
                return new AppFile(contentType, size, FileTypeEnum.Photo, userId, fileName)
                    .InitPaths(storageId, prefixFolder, contentId, defaultFile.FileName, minFile.FileName, null, null);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(storageId, userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, fileName));
                var size = thumbs[CopyType.Default].Bytes.Length;
                return new AppFile(contentType, size, FileTypeEnum.Photo, userId, fileName)
                    .InitPaths(storageId, prefixFolder, contentId, defaultFile.FileName, null, null, null);
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
            var idsToDelete = request.AppFiles.SelectMany(x => x.GetIds()).Distinct();

            var files = await fileRepository.GetManyAsync(idsToDelete);
            if (files.Any())
            {
                await Handle(new RemoveFilesFromStorageCommand(files, request.UserId), CancellationToken.None);
                await fileRepository.RemoveRangeAsync(files);
            }

            return Unit.Value;
        }


        public async Task<List<AppFile>> Handle(SaveDocumentsToNoteCommand request, CancellationToken cancellationToken)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(ContentTypesFile.Documents);
            var contentId = pathStorageBuilder.GetContentPathFileId();
            var storageId = storageIdProvider.GetStorageId();

            var files = new List<AppFile>();
            foreach (var file in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(storageId, request.UserId.ToString(), file.Bytes, file.ContentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, file.FileName));
                var appFile = new AppFile(file.ContentType, file.Bytes.Length, FileTypeEnum.Document, request.UserId, file.FileName)
                                        .InitPaths(storageId, prefixFolder, contentId, blob.FileName, null, null, null);
                files.Add(appFile);
            }
            return files;
        }

        public async Task<List<AppFile>> Handle(SaveVideosToNoteCommand request, CancellationToken cancellationToken)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(ContentTypesFile.Videos);
            var contentId = pathStorageBuilder.GetContentPathFileId();
            var storageId = storageIdProvider.GetStorageId();

            var files = new List<AppFile>();
            foreach (var file in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(storageId, request.UserId.ToString(), file.Bytes, file.ContentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, file.FileName));
                var appFile = new AppFile(file.ContentType, file.Bytes.Length, FileTypeEnum.Video, request.UserId, file.FileName)
                                    .InitPaths(storageId, prefixFolder, contentId, blob.FileName, null, null, null);
                files.Add(appFile);
            }
            return files;
        }

        public async Task<List<AppFile>> Handle(SaveAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(ContentTypesFile.Audios);
            var contentId = pathStorageBuilder.GetContentPathFileId();
            var storageId = storageIdProvider.GetStorageId();

            var files = new List<AppFile>();
            foreach (var audio in request.FileBytes)
            {
                var blob = await filesStorage.SaveFile(storageId, request.UserId.ToString(), audio.Bytes, audio.ContentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, audio.FileName));
                var appFile = new AppFile(audio.ContentType, audio.Bytes.Length, FileTypeEnum.Audio, request.UserId, audio.FileName)
                                    .InitPaths(storageId, prefixFolder, contentId, blob.FileName, null, null, null);
                files.Add(appFile);
            }
            return files;
        }

        public async Task<(bool success, AppFile file)> Handle(CopyBlobFromContainerToContainerCommand request, CancellationToken cancellationToken)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(request.ContentTypesFile);
            var contentId = pathStorageBuilder.GetContentPathFileId();

            var processedPathes = new List<string>();
            foreach (var path in request.AppFile.GetNotNullPathes())
            {
                var resp = await filesStorage.CopyBlobAsync(
                    request.StorageFromId, request.UserFromId.ToString(), path.FullPath,
                    request.StorageToId, request.UserToId.ToString(), prefixFolder, contentId, path.FileName);

                if(resp.success)
                {
                    processedPathes.Add(resp.path);
                }
                else
                {
                    if (processedPathes.Any())
                    {
                        await filesStorage.RemoveFiles(request.StorageToId, request.UserToId.ToString(), processedPathes.ToArray());
                    }
                    return (false!, null!);
                }
            }

            var file = new AppFile(request.AppFile.ContentType, request.AppFile.Size, request.AppFile.FileTypeId, request.UserToId, request.AppFile.Name);
            file.InitSuffixes(request.StorageToId, prefixFolder, contentId, request.AppFile.PathSuffixes);

            return (true, file);
        }

        public async Task<AppFile> Handle(SaveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(ContentTypesFile.Photos);
            var contentId = pathStorageBuilder.GetContentPathFileId();
            var storageId = storageIdProvider.GetStorageId();

            using var ms = new MemoryStream(request.File.Bytes);
            ms.Position = 0;

            var bigType = CopyType.Big;
            var mediumType = CopyType.Medium;
            var thumbs = await imageProcessor.ProcessCopies(ms, bigType, mediumType);

            AppFile resultFile;
            var fileName = request.File.FileName;
            var contentType = request.File.ContentType;
            if (thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[bigType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.large, fileName));
                var mediumFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[mediumType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.medium, fileName));

                var size = thumbs[bigType].Bytes.Length + thumbs[mediumType].Bytes.Length;

                resultFile = new AppFile(contentType, size, FileTypeEnum.Photo, request.UserId, fileName)
                                    .InitPaths(storageId, prefixFolder, contentId, null, null , mediumFile.FileName, bigFile.FileName);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, fileName));
                var mediumFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[mediumType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.medium, fileName));

                var size = thumbs[CopyType.Default].Bytes.Length + thumbs[mediumType].Bytes.Length;

                resultFile = new AppFile(contentType,size, FileTypeEnum.Photo, request.UserId, fileName)
                                    .InitPaths(storageId, prefixFolder, contentId, defaultFile.FileName, null, mediumFile.FileName, null);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, fileName));

                var size = thumbs[CopyType.Default].Bytes.Length;

                resultFile = new AppFile(contentType, size, FileTypeEnum.Photo, request.UserId, fileName)
                                    .InitPaths(storageId, prefixFolder, contentId, defaultFile.FileName, null, null, null);
            }

            resultFile.AppFileUploadInfo = new AppFileUploadInfo().SetLinked();
            return resultFile;
        }

        public async Task<AppFile> Handle(SaveUserPhotoCommand request, CancellationToken cancellationToken)
        {
            var prefixFolder = pathStorageBuilder.GetPrefixContentFolder(ContentTypesFile.Photos);
            var contentId = pathStorageBuilder.GetContentPathFileId();
            var storageId = storageIdProvider.GetStorageId();

            using var ms = new MemoryStream(request.File.Bytes);
            ms.Position = 0;

            var superMinType = CopyType.SuperMin;
            var mediumType = CopyType.Medium;

            var thumbs = await imageProcessor.ProcessCopies(ms, superMinType, mediumType);

            AppFile resultFile;
            var fileName = request.File.FileName;
            var contentType = request.File.ContentType;
            if (thumbs.ContainsKey(mediumType))
            {
                var minFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[superMinType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.small, fileName));
                var mediumFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[mediumType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.medium, fileName));

                var size = thumbs[superMinType].Bytes.Length + thumbs[mediumType].Bytes.Length;

                resultFile = new AppFile(contentType, size, FileTypeEnum.Photo, request.UserId, fileName)
                                    .InitPaths(storageId, prefixFolder, contentId, null, minFile.FileName, mediumFile.FileName, null);
            }
            else if (thumbs.ContainsKey(superMinType))
            {
                var minFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[superMinType].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.small, fileName));
                var defaultFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames._default, fileName));

                var size = thumbs[superMinType].Bytes.Length + thumbs[CopyType.Default].Bytes.Length;

                resultFile = new AppFile(contentType, size, FileTypeEnum.Photo, request.UserId, fileName)
                                    .InitPaths(storageId, prefixFolder, contentId, defaultFile.FileName, minFile.FileName, null, null);
            }
            else
            {
                var minFile = await filesStorage.SaveFile(storageId, request.UserId.ToString(), thumbs[CopyType.Default].Bytes, contentType, prefixFolder, contentId, GetNewFileName(EndSuffixesNames.small, fileName) );

                var size = thumbs[CopyType.Default].Bytes.Length;

                resultFile = new AppFile(contentType, size, FileTypeEnum.Photo, request.UserId, fileName)
                                    .InitPaths(storageId, prefixFolder, contentId, minFile.FileName, null, null, null);
            }

            resultFile.AppFileUploadInfo = new AppFileUploadInfo().SetLinked();
            return resultFile;
        }

        public async Task<Unit> Handle(RemoveFilesFromStorageCommand request, CancellationToken cancellationToken)
        {
            foreach(var file in request.Files)
            {
                var pathes = file.GetNotNullPathes();
                if(pathes != null)
                {
                    var pathesArray = pathes.Select(x => x.FullPath).ToArray();
                    await filesStorage.RemoveFiles(file.StorageId, request.UserId, pathesArray);
                }
            }
            return Unit.Value;
        }

        public async Task<OperationResult<FileDTO>> Handle(UpdateFileMetaDataCommand request, CancellationToken cancellationToken)
        {
            var file = await fileRepository.FirstOrDefaultAsync(x => x.Id == request.FileId);
            if (file == null)
            {
                return new OperationResult<FileDTO>().SetNotFound();
            }
    
            var metadata = file.GetMetadata();
            metadata.SecondsDuration = request.SecondsDuration;
            var imageFile = await fileRepository.FirstOrDefaultAsync(x => x.Id == request.ImageFileId);
            if (imageFile is not null && !metadata.ImageFileId.HasValue)
            {
                metadata.ImageFileId = imageFile.Id; // TODO CHECK
                metadata.ImagePath =  noteFolderLabelMapper.BuildFilePath(imageFile.StorageId, imageFile.UserId, imageFile.GetFromSmallPath);
            }
            file.UpdateMetadata(metadata);

            await fileRepository.UpdateAsync(file);

            /* Check
            if (!string.IsNullOrEmpty(metadata?.ImagePath))
            {
                var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
                metadata.ImagePath = noteFolderLabelMapper.BuildFilePath(user.StorageId, request.UserId, file.MetaData.ImagePath);
            };
            */

            var respResult = new FileDTO(file.Id, azureConfig.FirstOrDefaultCache(file.StorageId).Url, file.PathPrefix, 
                file.PathFileId, file.GetPathFileSuffixes(), file.Name, file.UserId, file.GetMetadata(), file.CreatedAt);
            
            return new OperationResult<FileDTO>(true, respResult);
        }

        private string GetNewFileName(string suffix, string fileName)
        {
            return suffix + Path.GetExtension(fileName);
        }

        public static string GetExtensionByMIME(string mime, string fileName = null) => mime switch
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
            "application/octet-stream" => Path.GetExtension(fileName),
            _ => string.IsNullOrEmpty(fileName) ? throw new ArgumentOutOfRangeException(nameof(mime), $"Not expected direction value: {mime}") : Path.GetExtension(fileName),
        };
    }
}