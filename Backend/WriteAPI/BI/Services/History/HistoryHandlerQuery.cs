using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History.Contents;
using Common.DTO.History;
using Common.DTO.Notes.FullNoteContent;
using Domain.Queries.History;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.NoteContent;
using static System.Net.Mime.MediaTypeNames;

namespace BI.Services.History
{
    public class HistoryHandlerQuery :
        IRequestHandler<GetNoteHistoriesQuery, List<NoteHistoryDTO>>,
        IRequestHandler<GetNoteSnapshotQuery, NoteHistoryDTOAnswer>,
        IRequestHandler<GetSnapshotContentsQuery, List<BaseNoteContentDTO>>
    {

        private readonly IMediator _mediator;

        private readonly NoteSnapshotRepository noteHistoryRepository;

        private readonly AppCustomMapper noteCustomMapper;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        public HistoryHandlerQuery(
            IMediator _mediator,
            NoteSnapshotRepository noteHistoryRepository,
            AppCustomMapper noteCustomMapper,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository)
        {
            this._mediator = _mediator;
            this.noteHistoryRepository = noteHistoryRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
        }

        public async Task<List<NoteHistoryDTO>> Handle(GetNoteHistoriesQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var histories = await noteHistoryRepository.GetNoteHistories(request.NoteId);
                return noteCustomMapper.MapHistoriesToHistoriesDto(histories);
            }

            return new List<NoteHistoryDTO>();
        }

        public async Task<NoteHistoryDTOAnswer> Handle(GetNoteSnapshotQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
                return new NoteHistoryDTOAnswer(true, noteCustomMapper.MapNoteSnapshotToNoteSnapshotDTO(snapshot));
            }

            return new NoteHistoryDTOAnswer(false, null);
        }

        public async Task<List<BaseNoteContentDTO>> Handle(GetSnapshotContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
                var result = await Convert(snapshot.Contents);
                return result.OrderBy(x => x.Order).ToList();
            }

            // TODO WHEN NO ACCESS
            return null;
        }

        private async Task<List<BaseNoteContentDTO>> Convert(ContentSnapshot contents)
        {
            var resultList = new List<BaseNoteContentDTO>();

            resultList.AddRange(contents.TextNoteSnapshots.Select(x => ConvertText(x)));


            var ids = contents.GetFileIdsFromAllContent();

            if (ids.Any())
            {
                var files = await fileRepository.GetWhereAsync(x => ids.Contains(x.Id));
                resultList.AddRange(contents.PhotosCollectionNoteSnapshots.Select(x => ConvertPhotosCollection(x, files)));
                resultList.AddRange(contents.VideosCollectionNoteSnapshots.Select(x => ConvertVideosCollection(x, files)));
                resultList.AddRange(contents.DocumentsCollectionNoteSnapshots.Select(x => ConvertDocumentsCollection(x, files)));
                resultList.AddRange(contents.AudiosCollectionNoteSnapshots.Select(x => ConvertAudiosCollection(x, files)));
            }

            return resultList;
        }

        private TextNoteDTO ConvertText(TextNoteSnapshot text) => 
            new TextNoteDTO(text.Content, Guid.Empty, text.Order, text.NoteTextTypeId, text.HTypeId, text.Checked, text.IsBold, text.IsItalic, text.UpdatedAt);

        private PhotosCollectionNoteDTO ConvertPhotosCollection(PhotosCollectionNoteSnapshot photos, List<AppFile> files)
        {
            var filePhotos = files.Where(x => photos.PhotosFilesIds.Contains(x.Id))
                .Select(x => new PhotoNoteDTO(x.Id, x.Name, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig, x.UserId, x.CreatedAt)).ToList();
            return new PhotosCollectionNoteDTO(filePhotos, photos.Name, photos.Width, photos.Height, Guid.Empty, photos.Order, photos.CountInRow, photos.UpdatedAt);
        }

        private VideosCollectionNoteDTO ConvertVideosCollection(VideosCollectionNoteSnapshot videos, List<AppFile> files)
        {
            var fileVideos = files.Where(x => videos.VideoFilesIds.Contains(x.Id)).Select(x => new VideoNoteDTO(x.Name, x.Id, x.PathNonPhotoContent, x.UserId, x.CreatedAt)).ToList();
            return new VideosCollectionNoteDTO(Guid.Empty, videos.Order, videos.UpdatedAt, videos.Name, fileVideos);
        }

        private DocumentsCollectionNoteDTO ConvertDocumentsCollection(DocumentsCollectionNoteSnapshot documents, List<AppFile> files)
        {
            var fileDocuments = files.Where(x => documents.DocumentFilesIds.Contains(x.Id)).Select(x => new DocumentNoteDTO(x.Name, x.PathNonPhotoContent, x.Id, x.UserId, x.CreatedAt)).ToList();
            return new DocumentsCollectionNoteDTO(Guid.Empty, documents.Order, documents.UpdatedAt, documents.Name, fileDocuments);
        }

        private AudiosCollectionNoteDTO ConvertAudiosCollection(AudiosCollectionNoteSnapshot audios, List<AppFile> files)
        {
            var fileDocuments = files.Where(x => audios.AudioFilesIds.Contains(x.Id)).Select(x => new AudioNoteDTO(x.Name, x.Id, x.PathNonPhotoContent, x.UserId, x.CreatedAt)).ToList();
            return new AudiosCollectionNoteDTO(Guid.Empty, audios.Order, audios.UpdatedAt, audios.Name, fileDocuments);
        }
    }
}
