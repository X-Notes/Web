using Common.DatabaseModels.models;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.files
{
    public class SavePhotosToNoteCommand : IRequest<List<AppFile>>
    {
        public List<IFormFile> Photos { set; get; }
        public Guid NoteId { set; get; }
        public SavePhotosToNoteCommand(List<IFormFile> Photos, Guid NoteId)
        {
            this.Photos = Photos;
            this.NoteId = NoteId;
        }
    }
}
