using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes.FullNoteSyncContents;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.NoteInner
{
    public class SyncNoteStructureCommand : BaseCommandEntity, IRequest<OperationResult<NoteStructureResult>>
    {
        [Required]
        public DiffsChanges Diffs { set; get; }

        [ValidationGuid]
        public Guid NoteId { set; get; }
    }
}
