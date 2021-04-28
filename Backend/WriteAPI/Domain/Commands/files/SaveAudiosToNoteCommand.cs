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
    public class SaveAudiosToNoteCommand : IRequest<AppFile>
    {
        public IFormFile Audio { set; get; }
        public Guid NoteId { set; get; }

        public SaveAudiosToNoteCommand(IFormFile Audio, Guid NoteId)
        {
            this.Audio = Audio;
            this.NoteId = NoteId;
        }
    }
}
