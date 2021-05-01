using BI.helpers;
using Common.DatabaseModels.models.Files;
using Domain.Commands.files;
using MediatR;
using Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BI.services.files
{
    public class FileHandlerCommand :
        IRequestHandler<SavePhotosToNoteCommand, List<AppFile>>,
        IRequestHandler<SaveDocumentsToNoteCommand, AppFile>,
        IRequestHandler<SaveVideosToNoteCommand, AppFile>,
        IRequestHandler<SaveAudiosToNoteCommand, AppFile>,
        IRequestHandler<RemoveFilesByPathesCommand, Unit>
    {
        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;

        public FileHandlerCommand(PhotoHelpers photoHelpers, IFilesStorage filesStorage)
        {
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
        }

        public async Task<List<AppFile>> Handle(SavePhotosToNoteCommand request, CancellationToken cancellationToken)
        {
            var fileList = new List<AppFile>();
            switch(request.FileType)
            {
                case SavePhotosType.FormFile:
                    {
                        foreach (var file in request.FormFilePhotos)
                        {
                            var photoType = photoHelpers.GetPhotoType(file.ContentType);
                            var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Images);
                            var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, request.NoteId, getContentString, photoType);
                            var fileDB = new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                            fileList.Add(fileDB);
                        }
                        break;
                    }
                case SavePhotosType.Bytes:
                    {
                        foreach (var file in request.FilesBytes)
                        {
                            var photoType = photoHelpers.GetPhotoType(file.ContentType);
                            var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Images);
                            var pathToCreatedFile = await filesStorage.SaveNoteFiles(file.Bytes, request.NoteId, getContentString, photoType);
                            var fileDB = new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                            fileList.Add(fileDB);
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
            foreach (var path in request.Pathes)
            {
                filesStorage.RemoveFile(path);
            }
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
                        var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Files);
                        var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, request.NoteId, getContentString, documentType);
                        return new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                    }
                case SaveDocumentsType.Bytes:
                    {
                        var file = request.FileBytes;
                        var documentType = photoHelpers.GetDocumentType(file.ContentType);
                        var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Files);
                        var pathToCreatedFile = await filesStorage.SaveNoteFiles(file.Bytes, request.NoteId, getContentString, documentType);
                        return new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
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
                        var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Videos);
                        var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, request.NoteId, getContentString, videoType);
                        return new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                    }
                case SaveVideosType.Bytes:
                    {
                        var file = request.FileBytes;
                        var videoType = photoHelpers.GetVideoType(file.ContentType);
                        var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Videos);
                        var pathToCreatedFile = await filesStorage.SaveNoteFiles(file.Bytes, request.NoteId, getContentString, videoType);
                        return new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
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
                        var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Audios);
                        var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, request.NoteId, getContentString, audioType);
                        return new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                    }
                case SaveAudiosType.Bytes:
                    {
                        var file = request.FileBytes;
                        var audioType = photoHelpers.GetAudioType(file.ContentType);
                        var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Audios);
                        var pathToCreatedFile = await filesStorage.SaveNoteFiles(file.Bytes, request.NoteId, getContentString, audioType);
                        return new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                    }
                default:
                    {
                        throw new Exception("Incorrect type");
                    }
            }
        }
    }
}
