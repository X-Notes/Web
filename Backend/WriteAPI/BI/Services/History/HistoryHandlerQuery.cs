using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using BI.Services.Encryption;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History.Contents;
using Common.DTO;
using Common.DTO.History;
using Common.DTO.Notes.FullNoteContent;
using Domain.Queries.History;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.History
{
    public class HistoryHandlerQuery :
        IRequestHandler<GetNoteHistoriesQuery, OperationResult<List<NoteHistoryDTO>>>,
        IRequestHandler<GetNoteSnapshotQuery, OperationResult<NoteHistoryDTOAnswer>>,
        IRequestHandler<GetSnapshotContentsQuery, OperationResult<List<BaseNoteContentDTO>>>
    {

        private readonly IMediator _mediator;

        private readonly NoteSnapshotRepository noteHistoryRepository;

        private readonly NoteFolderLabelMapper noteCustomMapper;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        private readonly FileRepository fileRepository;

        private readonly UserNoteEncryptService userNoteEncryptStorage;

        public HistoryHandlerQuery(
            IMediator _mediator,
            NoteSnapshotRepository noteHistoryRepository,
            NoteFolderLabelMapper noteCustomMapper,
            BaseNoteContentRepository baseNoteContentRepository,
            FileRepository fileRepository,
            UserNoteEncryptService userNoteEncryptStorage)
        {
            this._mediator = _mediator;
            this.noteHistoryRepository = noteHistoryRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.baseNoteContentRepository = baseNoteContentRepository;
            this.fileRepository = fileRepository;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
        }

        public async Task<OperationResult<List<NoteHistoryDTO>>> Handle(GetNoteHistoriesQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked && !userNoteEncryptStorage.IsUnlocked(permissions.Note.Id))
            {
                return new OperationResult<List<NoteHistoryDTO>>(false, null).SetContentLocked();
            }

            if (permissions.CanRead)
            {
                var histories = await noteHistoryRepository.GetNoteHistories(request.NoteId);
                var data = noteCustomMapper.MapHistoriesToHistoriesDto(histories);
                return new OperationResult<List<NoteHistoryDTO>>(true, data);
            }

            return new OperationResult<List<NoteHistoryDTO>>(false, null).SetNoPermissions();
        }

        public async Task<OperationResult<NoteHistoryDTOAnswer>> Handle(GetNoteSnapshotQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked && !userNoteEncryptStorage.IsUnlocked(permissions.Note.Id))
            {
                return new OperationResult<NoteHistoryDTOAnswer>(false, null).SetContentLocked();
            }

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
                var data = new NoteHistoryDTOAnswer(true, noteCustomMapper.MapNoteSnapshotToNoteSnapshotDTO(snapshot));
                return new OperationResult<NoteHistoryDTOAnswer>(true, data);
            }

            return new OperationResult<NoteHistoryDTOAnswer>(false, null).SetNoPermissions();
        }

        public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetSnapshotContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked && !userNoteEncryptStorage.IsUnlocked(permissions.Note.Id))
            {
                return new OperationResult<List<BaseNoteContentDTO>>(false, null).SetContentLocked();
            }

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
                var result = await Convert(snapshot.Contents);
                var data = result.OrderBy(x => x.Order).ToList();
                return new OperationResult<List<BaseNoteContentDTO>>(true, data);
            }

            return new OperationResult<List<BaseNoteContentDTO>>(false, null).SetNoPermissions();
        }

        private async Task<List<BaseNoteContentDTO>> Convert(ContentSnapshot contents)
        {
            var resultList = new List<BaseNoteContentDTO>();

            resultList.AddRange(contents.TextNoteSnapshots.Select(x => ConvertText(x)));

            var ids = contents.GetFileIdsFromAllContent();
            if (ids.Any())
            {
                var files = await fileRepository.GetWhereAsync(x => ids.Contains(x.Id));
                foreach(var x in contents.CollectionNoteSnapshots)
                {
                    switch (x.FileTypeId)
                    {
                        case FileTypeEnum.Photo:
                            {
                                resultList.Add(ConvertPhotosCollection(x, files));
                                break;
                            }
                        case FileTypeEnum.Audio:
                            {
                                resultList.Add(ConvertAudiosCollection(x, files));
                                break;
                            }
                        case FileTypeEnum.Document:
                            {
                                resultList.Add(ConvertDocumentsCollection(x, files));
                                break;
                            }
                        case FileTypeEnum.Video:
                            {
                                resultList.Add(ConvertVideosCollection(x, files));
                                break;
                            }
                        default: break;
                    }
                }
            }
            return resultList;
        }

        private TextNoteDTO ConvertText(TextNoteSnapshot text) => 
            new TextNoteDTO(text.Contents, Guid.Empty, text.Order, text.NoteTextTypeId, text.HTypeId, text.Checked, 0, text.UpdatedAt);

        private PhotosCollectionNoteDTO ConvertPhotosCollection(CollectionNoteSnapshot photos, List<AppFile> files)
        {
            var filePhotos = files.Where(x => photos.FilesIds.Contains(x.Id))
                .Select(x => new PhotoNoteDTO(x.Id, x.Name, x.PathPhotoSmall, x.PathPhotoMedium, x.PathPhotoBig, x.UserId, x.CreatedAt)).ToList();
            return new PhotosCollectionNoteDTO(filePhotos, photos.Name, photos.MetaData.Width, photos.MetaData.Height, Guid.Empty, photos.Order, photos.MetaData.CountInRow, photos.UpdatedAt);
        }

        private VideosCollectionNoteDTO ConvertVideosCollection(CollectionNoteSnapshot videos, List<AppFile> files)
        {
            var fileVideos = files.Where(x => videos.FilesIds.Contains(x.Id)).Select(x => new VideoNoteDTO(x.Name, x.Id, x.PathNonPhotoContent, x.UserId, x.CreatedAt)).ToList();
            return new VideosCollectionNoteDTO(Guid.Empty, videos.Order, videos.UpdatedAt, videos.Name, fileVideos);
        }

        private DocumentsCollectionNoteDTO ConvertDocumentsCollection(CollectionNoteSnapshot documents, List<AppFile> files)
        {
            var fileDocuments = files.Where(x => documents.FilesIds.Contains(x.Id)).Select(x => new DocumentNoteDTO(x.Name, x.PathNonPhotoContent, x.Id, x.UserId, x.CreatedAt)).ToList();
            return new DocumentsCollectionNoteDTO(Guid.Empty, documents.Order, documents.UpdatedAt, documents.Name, fileDocuments);
        }

        private AudiosCollectionNoteDTO ConvertAudiosCollection(CollectionNoteSnapshot audios, List<AppFile> files)
        {
            var fileDocuments = files.Where(x => audios.FilesIds.Contains(x.Id)).Select(x => new AudioNoteDTO(x.Name, x.Id, x.PathNonPhotoContent, x.UserId, x.MetaData?.SecondsDuration, x.MetaData?.ImagePath, x.CreatedAt)).ToList();
            return new AudiosCollectionNoteDTO(Guid.Empty, audios.Order, audios.UpdatedAt, audios.Name, fileDocuments);
        }
    }
}
