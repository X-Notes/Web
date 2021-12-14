using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO.Notes;
using Domain.Queries.Permissions;
using Domain.Queries.RelatedNotes;
using MediatR;
using WriteContext.Repositories.Notes;
using WriteContext.Repositories.Users;

namespace BI.Services.RelatedNotes
{
    public class RelatedNotesHandlerQuery
        : IRequestHandler<GetRelatedNotesQuery, List<RelatedNote>>,
          IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>
    {
        private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
        private readonly AppCustomMapper noteCustomMapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly AppCustomMapper noteMapper;
        private readonly IMediator _mediator;

        public RelatedNotesHandlerQuery(
            ReletatedNoteToInnerNoteRepository relatedRepository,
            AppCustomMapper noteCustomMapper,
            NoteRepository noteRepository,
            UserRepository userRepository,
            AppCustomMapper noteMapper,
            IMediator _mediator)
        {
            this.relatedRepository = relatedRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.noteMapper = noteMapper;
            this._mediator = _mediator;
        }

        public async Task<List<RelatedNote>> Handle(GetRelatedNotesQuery request, CancellationToken cancellationToken)
        {
            var notes = await relatedRepository.GetRelatedNotesFullContent(request.NoteId);
            return noteCustomMapper.MapNotesToRelatedNotes(notes);
        }

        public async Task<List<PreviewNoteForSelection>> Handle(GetNotesForPreviewWindowQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var relatedNotes = await relatedRepository.GetRelatedNotes(request.NoteId);
                var relatedNotesIds = relatedNotes.Select(x => x.RelatedNoteId).ToList();
                var allNotes = await noteRepository.GetNotesByUserIdWithoutNote(permissions.User.Id, request.NoteId, request.Settings);
                if (string.IsNullOrEmpty(request.Search))
                {
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, relatedNotesIds);
                }
                else
                {
                    allNotes = allNotes.Where(x =>
                    SearchHelper.IsMatchContent(x.Title, request.Search)
                    || x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Contents, request.Search))
                    || relatedNotesIds.Contains(x.Id)
                    ).ToList();
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, relatedNotesIds);
                }
            }
            return new List<PreviewNoteForSelection>();
        }
    }
}
