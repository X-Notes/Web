using Common.DTO.Notes.FullNoteContent.Files;
using Mapper.Mapping;
using MediatR;
using Noots.Permissions.Queries;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.Editor.Queries;

namespace Noots.Editor.Services.Videos
{
    public class VideosCollectionHandlerQuery :
        IRequestHandler<GetNoteFilesByIdsQuery<VideoNoteDTO>, List<VideoNoteDTO>>
    {
        private readonly IMediator mediator;
        private readonly CollectionAppFileRepository collectionAppFileRepository;
        private readonly NoteFolderLabelMapper mapper;

        public VideosCollectionHandlerQuery(IMediator _mediator, CollectionAppFileRepository collectionAppFileRepository, NoteFolderLabelMapper mapper)
        {
            mediator = _mediator;
            this.collectionAppFileRepository = collectionAppFileRepository;
            this.mapper = mapper;
        }

        public async Task<List<VideoNoteDTO>> Handle(GetNoteFilesByIdsQuery<VideoNoteDTO> request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await mediator.Send(command);

            if (permissions.CanRead)
            {
                var colectionFiles = await collectionAppFileRepository.GetAppFilesByContentIds(new List<Guid> { request.CollectionId });
                var files = colectionFiles.Where(x => request.FileIds.Contains(x.AppFileId)).Select(x => x.AppFile);
                return files.Select(x => mapper.MapToVideoDTO(x, permissions.AuthorId)).ToList();
            }

            return new List<VideoNoteDTO>();
        }
    }
}
