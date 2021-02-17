using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.noteInner
{
    public class UploadImageToNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public List<IFormFile> Photos { set; get; }
        [Required]
        public Guid NoteId { set; get; }
    }
}
