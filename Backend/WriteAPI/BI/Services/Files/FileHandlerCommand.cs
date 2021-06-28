using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using Common.DatabaseModels.Models.Files;
using ContentProcessing;
using Domain.Commands.Files;
using MediatR;
using Storage;

namespace BI.Services.Files
{
    public class FileHandlerCommand :
        IRequestHandler<SavePhotosToNoteCommand, List<SavePhotosToNoteResponse>>,
        IRequestHandler<SaveDocumentsToNoteCommand, AppFile>,
        IRequestHandler<SaveVideosToNoteCommand, AppFile>,
        IRequestHandler<SaveAudiosToNoteCommand, List<AppFile>>,
        IRequestHandler<RemoveFilesByPathesCommand, Unit>
    {
        private readonly IFilesStorage filesStorage;
        private readonly IImageProcessor imageProcessor;
        public FileHandlerCommand(IFilesStorage filesStorage, IImageProcessor imageProcessor)
        {
            this.filesStorage = filesStorage;
            this.imageProcessor = imageProcessor;
        }


        public async Task<AppFile> ProcessPhoto(Guid userId, byte[] bytes, string contentType, string fileName)
        {
            var photoType = FileHelper.GetPhotoType(contentType);

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
            else if(thumbs.ContainsKey(minType))
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
                var fileDB = await ProcessPhoto(request.UserId, photoFile.Bytes, photoFile.ContentType, photoFile.FileName);
                fileList.Add(new SavePhotosToNoteResponse(fileDB, photoFile));
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
            var file = request.FileBytes;
            var documentType = FileHelper.GetDocumentType(file.ContentType);
            var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Files, documentType);
            return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Document, request.UserId, file.FileName);
        }

        public async Task<AppFile> Handle(SaveVideosToNoteCommand request, CancellationToken cancellationToken)
        {
            var file = request.FileBytes;
            var videoType = FileHelper.GetVideoType(file.ContentType);
            var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), file.Bytes, file.ContentType, ContentTypesFile.Videos, videoType);
            return new AppFile(pathToCreatedFile, file.ContentType, file.Bytes.Length, FileTypeEnum.Video, request.UserId, file.FileName);
        }

        public async Task<List<AppFile>> Handle(SaveAudiosToNoteCommand request, CancellationToken cancellationToken)
        {
            var files = new List<AppFile>();
            foreach (var audio in request.FileBytes)
            {
                var audioType = FileHelper.GetAudioType(audio.ContentType);
                var pathToCreatedFile = await filesStorage.SaveFile(request.UserId.ToString(), audio.Bytes, audio.ContentType, ContentTypesFile.Audios, audioType);
                files.Add(new AppFile(pathToCreatedFile, audio.ContentType, audio.Bytes.Length, 
                    FileTypeEnum.Audio, request.UserId, audio.FileName));
            }
            return files;
        }
    }
}
