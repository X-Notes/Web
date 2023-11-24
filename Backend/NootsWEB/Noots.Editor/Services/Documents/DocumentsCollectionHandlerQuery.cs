using Common.DTO.Notes.FullNoteContent.Files;
using Editor.Queries;
using Mapper.Mapping;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using Permissions.Queries;

namespace Editor.Services.Documents
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
                return files.Select(x => mapper.MapToDocumentDTO(x, permissions.AuthorId)).ToList();
            }

            return new List<DocumentNoteDTO>();
        }
    }
}
