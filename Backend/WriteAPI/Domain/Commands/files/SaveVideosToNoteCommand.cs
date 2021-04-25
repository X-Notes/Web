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
    public class SaveVideosToNoteCommand : IRequest<AppFile>
    {
        public IFormFile Video { set; get; }
        public Guid NoteId { set; get; }
        public SaveVideosToNoteCommand(IFormFile Video, Guid NoteId)
        {
            this.Video = Video;
            this.NoteId = NoteId;
        }
    }
}
