using Common.DatabaseModels.models.Files;
using Common.DTO.files;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.files
{
    public enum SaveDocumentsType
    {
        FormFile,
        Bytes
    }

    public class SaveDocumentsToNoteCommand : IRequest<AppFile>
    {
        public IFormFile Document { set; get; }
        public FilesBytes FileBytes { set; get; }

        public SaveDocumentsType FileType { set; get; }

        public Guid NoteId { set; get; }


        public SaveDocumentsToNoteCommand(IFormFile Document, Guid NoteId)
        {
            this.Document = Document;
            this.NoteId = NoteId;
            this.FileType = SaveDocumentsType.FormFile;
        }

        public SaveDocumentsToNoteCommand(FilesBytes FileBytes, Guid NoteId)
        {
            this.FileBytes = FileBytes;
            this.NoteId = NoteId;
            this.FileType = SaveDocumentsType.Bytes;
        }
    }

}
