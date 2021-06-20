using BI.helpers;
using Common.DatabaseModels.models.Files;
using ContentProcessing;
using Domain.Commands.files;
using MediatR;
using Microsoft.AspNetCore.Http;
using Storage;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BI.services.files
{
    public class FileHandlerCommand :
        IRequestHandler<SavePhotosToNoteCommand, List<SavePhotosToNoteResponse>>,
        IRequestHandler<SaveDocumentsToNoteCommand, AppFile>,
        IRequestHandler<SaveVideosToNoteCommand, AppFile>,
        IRequestHandler<SaveAudiosToNoteCommand, AppFile>,
        IRequestHandler<RemoveFilesByPathesCommand, Unit>
    {
        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;
        private readonly IImageProcessor imageProcessor;
        public FileHandlerCommand(PhotoHelpers photoHelpers, IFilesStorage filesStorage, IImageProcessor imageProcessor)
        {
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
        }


        public async Task<AppFile> ProcessPhoto(Guid userId, byte[] bytes, string contentType)
        {
            var photoType = photoHelpers.GetPhotoType(contentType);

            using var ms = new MemoryStream(bytes);
            ms.Position = 0;

            var minType = CopyType.Min;
            var mediumType = CopyType.Medium;
            var bigType = CopyType.Big;

            var thumbs = await imageProcessor.ProcessCopies(ms, minType, mediumType, bigType);

            if(thumbs.ContainsKey(bigType))
            {
                var bigFile = await filesStorage.SaveFile(userId.ToString(), thumbs[bigType].Bytes, contentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(userId.ToString(), thumbs[mediumType].Bytes, contentType, ContentTypesFile.Images, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, mediumFile, bigFile, contentType, 
                    thumbs[bigType].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length, 
                    FileTypeEnum.Photo, userId);
            }
            else if (thumbs.ContainsKey(mediumType))
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Images, photoType);
                var mediumFile = await filesStorage.SaveFile(userId.ToString(), thumbs[mediumType].Bytes, contentType, ContentTypesFile.Images, photoType);
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, mediumFile, defaultFile, contentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length + thumbs[mediumType].Bytes.Length,
                    FileTypeEnum.Photo, userId);
            }
            else if(thumbs.ContainsKey(minType))
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Images, photoType);            
                var minFile = await filesStorage.SaveFile(userId.ToString(), thumbs[minType].Bytes, contentType, ContentTypesFile.Images, photoType);

                return new AppFile(minFile, defaultFile, null, contentType,
                    thumbs[CopyType.Default].Bytes.Length + thumbs[minType].Bytes.Length,
                    FileTypeEnum.Photo, userId);
            }
            else
            {
                var defaultFile = await filesStorage.SaveFile(userId.ToString(), thumbs[CopyType.Default].Bytes, contentType, ContentTypesFile.Images, photoType);
                return new AppFile(defaultFile, null, null, contentType, thumbs[CopyType.Default].Bytes.Length, FileTypeEnum.Photo, userId);
            }
        }

        public async Task<List<SavePhotosToNoteResponse>> Handle(SavePhotosToNoteCommand request, CancellationToken cancellationToken)
        {
            var fileList = new List<SavePhotosToNoteResponse>();
            switch(request.FileType)
            {
                case SavePhotosType.FormFile:
                    {
                        foreach (var file in request.FormFilePhotos)
                        {
                            using var ms = new MemoryStream();                         
                            await file.CopyToAsync(ms);                           
                            var fileDB = await ProcessPhoto(request.UserId, ms.ToArray(), file.ContentType);
                            fileList.Add(new SavePhotosToNoteResponse {  AppFile = fileDB , IFormFile = file, FileType = SavePhotosType.FormFile });
                        }
                        break;
                    }
                case SavePhotosType.Bytes:
                    {
                        foreach (var file in request.FilesBytes)
                        {
                            var fileDB = await ProcessPhoto(request.UserId, file.Bytes, file.ContentType);
                            fileList.Add(new SavePhotosToNoteResponse { AppFile = fileDB, FilesBytes = file, FileType = SavePhotosType.Bytes });
                        }
                        break;
                    }
                default:
                    {
                        throw new Exception("Incorrect type");
                    }
            }
            return fileList;
        }

        public Task<Unit> Handle(RemoveFilesByPathesCommand request, CancellationToken cancellationToken)
        {
            filesStorage.RemoveFiles(request.UserId, request.Pathes.ToArray());
            return Task.FromResult(Unit.Value);
        }

        public async Task<AppFile> Handle(SaveDocumentsToNoteCommand request, CancellationToken cancellationToken)
        {
            switch (request.FileType)
            {
                case SaveDocumentsType.FormFile:
                    {
                        var file = request.Document;
                        var documentType = photoHelpers.GetDocumentType(file.ContentType);

                        using var ms = new MemoryStream();
                        await file.CopyToAsync(ms);
                        ms.Position = 0;
                        var bytes = ms.ToArray();

                        var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), bytes, file.ContentType, ContentTypesFile.Files, documentType);
                        return new AppFile(pathToCreatedFile, file.ContentType, bytes.Length, FileTypeEnum.Document, request.UserId);
                    }
                case SaveDocumentsType.Bytes:
                    {
                        var file = request.FileBytes;
                        var documentType = photoHelpers.GetDocumentType(file.ContentType);
                        var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Files, documentType);
                        return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Document, request.UserId);
                    }
                default:
                    {
                        throw new Exception("Incorrect type");
                    }
            }
        }

        public async Task<AppFile> Handle(SaveVideosToNoteCommand request, CancellationToken cancellationToken)
        {

            switch (request.FileType)
            {
                case SaveVideosType.FormFile:
                    {
                        var file = request.Video;
                        var videoType = photoHelpers.GetVideoType(file.ContentType);

                        using var ms = new MemoryStream();
                        await file.CopyToAsync(ms);
                        ms.Position = 0;
                        var bytes = ms.ToArray();

                        var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), bytes, file.ContentType , ContentTypesFile.Videos, videoType);
                        return new AppFile(pathToCreatedFile, file.ContentType, bytes.Length, FileTypeEnum.Video, request.UserId);
                    }
                case SaveVideosType.Bytes:
                    {
                        var file = request.FileBytes;
                        var videoType = photoHelpers.GetVideoType(file.ContentType);
                        var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Videos, videoType);
                        return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Video, request.UserId);
                    }
                default:
                    {
                        throw new Exception("Incorrect type");
                    }
            }
        }

        public async Task<AppFile> Handle(SaveAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            switch (request.FileType)
            {
                case SaveAudiosType.FormFile:
                    {
                        var file = request.Audio;
                        var audioType = photoHelpers.GetAudioType(file.ContentType);

                        using var ms = new MemoryStream();
                        await file.CopyToAsync(ms);
                        ms.Position = 0;
                        var bytes = ms.ToArray();

                        var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), bytes, file.ContentType, ContentTypesFile.Audios, audioType);
                        return new AppFile(pathToCreatedFile, file.ContentType, bytes.Length, FileTypeEnum.Audio, request.UserId);
                    }
                case SaveAudiosType.Bytes:
                    {
                        var file = request.FileBytes;
                        var audioType = photoHelpers.GetAudioType(file.ContentType);
                        var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Audios, audioType);
                        return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Audio, request.UserId);
                    }
                default:
                    {
                        throw new Exception("Incorrect type");
                    }
            }
        }
    }
}
