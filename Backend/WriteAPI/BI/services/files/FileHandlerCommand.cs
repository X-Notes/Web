using BI.helpers;
using Common.DatabaseModels.models;
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
            foreach (var file in request.Photos)
                {
                var photoType = photoHelpers.GetPhotoType(file);
                var getContentString = filesStorage.GetValueFromDictionary(ContentTypesFile.Images);
                var pathToCreatedFile = await filesStorage.SaveNoteFiles(file, request.NoteId, getContentString, photoType);
                var fileDB = new AppFile { Path = pathToCreatedFile, Type = file.ContentType };
                fileList.Add(fileDB);
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
    }
}
