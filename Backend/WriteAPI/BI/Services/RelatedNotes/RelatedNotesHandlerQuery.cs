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
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        private readonly NoteFolderLabelMapper noteMapper;
        private readonly IMediator _mediator;

        public RelatedNotesHandlerQuery(
            ReletatedNoteToInnerNoteRepository relatedRepository,
            NoteRepository noteRepository,
            UserRepository userRepository,
            NoteFolderLabelMapper noteMapper,
            IMediator _mediator)
        {
            this.relatedRepository = relatedRepository;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
            this.noteMapper = noteMapper;
            this._mediator = _mediator;
        }

        public async Task<List<RelatedNote>> Handle(GetRelatedNotesQuery request, CancellationToken cancellationToken)
        {
            var relatedNotes = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
            var ids = relatedNotes.Select(x => x.RelatedNoteId);
            var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(ids, null);
            var lookUp = notes.ToDictionary(x => x.Id);
            relatedNotes.ForEach(x => x.RelatedNote = lookUp.ContainsKey(x.RelatedNoteId) ? lookUp[x.RelatedNoteId] : null);
            return noteMapper.MapNotesToRelatedNotes(relatedNotes);
        }

        public async Task<List<PreviewNoteForSelection>> Handle(GetNotesForPreviewWindowQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                var relatedNotes = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
                var relatedNotesIds = relatedNotes.Select(x => x.RelatedNoteId).ToList();
                var relNotes = await noteRepository.GetNotesByNoteIdsIdWithContent(relatedNotesIds, request.Settings);
                var allNotes = await noteRepository.GetNotesByUserIdWithoutNoteNoLockedWithoutDeleted(permissions.Caller.Id, request.NoteId, request.Settings);
                allNotes.AddRange(relNotes);
                allNotes = allNotes.DistinctBy(x => x.Id).ToList();

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
