using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Queries.NoteInner;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using Noots.DatabaseContext.Repositories.NoteContent;

namespace Noots.Editor.Services.Documents
{
    public class DocumentsCollectionHandlerQuery :
        IRequestHandler<GetNoteFilesByIdsQuery<DocumentNoteDTO>, List<DocumentNoteDTO>>
    {
        private readonly IMediator mediator;
        private readonly CollectionAppFileRepository collectionAppFileRepository;
        private readonly NoteFolderLabelMapper mapper;

        public DocumentsCollectionHandlerQuery(IMediator _mediator, CollectionAppFileRepository collectionAppFileRepository, NoteFolderLabelMapper mapper)
        {
            mediator = _mediator;
            this.collectionAppFileRepository = collectionAppFileRepository;
            this.mapper = mapper;
        }

        public async Task<List<DocumentNoteDTO>> Handle(GetNoteFilesByIdsQuery<DocumentNoteDTO> request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await mediator.Send(command);

            if (permissions.CanRead)
            {
                var colectionFiles = await collectionAppFileRepository.GetAppFilesByContentIds(new List<Guid> { request.CollectionId });
                var files = colectionFiles.Where(x => request.FileIds.Contains(x.AppFileId)).Select(x => x.AppFile);
                return files.Select(x => mapper.MapToDocumentDTO(x, permissions.Author.Id)).ToList();
            }

            return new List<DocumentNoteDTO>();
        }
    }
}
