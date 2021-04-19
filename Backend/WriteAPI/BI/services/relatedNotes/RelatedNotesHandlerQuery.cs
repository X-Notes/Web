using BI.helpers;
using BI.Mapping;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.notes;
using Domain.Queries.permissions;
using Domain.Queries.relatedNotes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.relatedNotes
{
    public class RelatedNotesHandlerQuery
        : IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>,
          IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>
    {
        private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
        private readonly NoteCustomMapper noteCustomMapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly NoteCustomMapper noteMapper;
        private readonly IMediator _mediator;
        private readonly SearchHelper searchHelper;

        public RelatedNotesHandlerQuery(
            ReletatedNoteToInnerNoteRepository relatedRepository,
            NoteCustomMapper noteCustomMapper,
            NoteRepository noteRepository,
            UserRepository userRepository,
            NoteCustomMapper noteMapper,
            IMediator _mediator,
            SearchHelper searchHelper)
        {
            this.relatedRepository = relatedRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.noteMapper = noteMapper;
            this._mediator = _mediator;
            this.searchHelper = searchHelper;
        }

        public async Task<List<RelatedNote>> Handle(GetRelatedNotesQuery request, CancellationToken cancellationToken)
        {
            var notes = await relatedRepository.GetRelatedNotesFullContent(request.NoteId);
            return noteCustomMapper.MapNotesToRelatedNotes(notes);
        }

        public async Task<List<PreviewNoteForSelection>> Handle(GetNotesForPreviewWindowQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if(permissions.CanRead)
            {
                var relatedNotes = await relatedRepository.GetRelatedNotes(request.NoteId);
                var relatedNotesIds = relatedNotes.Select(x => x.RelatedNoteId).ToList();
                var allNotes = await noteRepository.GetNotesByUserIdWithoutNote(permissions.User.Id, request.NoteId);
                if(string.IsNullOrEmpty(request.Search))
                {
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, relatedNotesIds);
                }
                else
                {
                    allNotes = allNotes.Where(x => 
                    searchHelper.IsMatchContent(x.Title, request.Search)
                    || x.Contents.OfType<TextNote>().Any(x => searchHelper.IsMatchContent(x.Content, request.Search))
                    || relatedNotesIds.Contains(x.Id)
                    ).ToList();
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, relatedNotesIds);
                }
            }
            return new List<PreviewNoteForSelection>();
        }
    }
}
