using Common.DatabaseModels.models.Files;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.files
{
    public class SaveDocumentsToNoteCommand : IRequest<AppFile>
    {
        public IFormFile Document { set; get; }
        public Guid NoteId { set; get; }
        public SaveDocumentsToNoteCommand(IFormFile Document, Guid NoteId)
        {
            this.Document = Document;
            this.NoteId = NoteId;
        }
    }
}
