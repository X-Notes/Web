using BI.Mapping;
using Common.DTO.folders;
using Common.DTO.notes;
using Domain.Queries.innerFolder;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.folders
{
    public class FullFolderHandlerQuery :
        IRequestHandler<GetFolderNotesByFolderId, List<SmallNote>>
    {

        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly IMediator _mediator;
        private readonly NoteCustomMapper noteMapper;
        public FullFolderHandlerQuery(
            FoldersNotesRepository foldersNotesRepository,
            IMediator _mediator,
            NoteCustomMapper noteMapper
            )
        {
            this.foldersNotesRepository = foldersNotesRepository;
            this._mediator = _mediator;
            this.noteMapper = noteMapper;
        }

        public async Task<List<SmallNote>> Handle(GetFolderNotesByFolderId request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var foldersNotes = await foldersNotesRepository.GetOrderedByFolderIdWithNotes(request.FolderId);
                var notes = foldersNotes.Select(x => x.Note);

                return noteMapper.MapNotesToSmallNotesDTO(notes);
            }

            return new List<SmallNote>();
        }
    }
}
