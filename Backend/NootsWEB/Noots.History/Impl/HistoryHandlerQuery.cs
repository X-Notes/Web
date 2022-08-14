using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using Common.DTO.Labels;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Users;
using MediatR;
using Noots.Encryption.Impl;
using Noots.History.Entities;
using Noots.History.Queries;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using WriteContext.Repositories.Files;
using WriteContext.Repositories.Histories;

namespace Noots.History.Impl
{
    public class HistoryHandlerQuery :
        IRequestHandler<GetNoteHistoriesQuery, OperationResult<List<NoteHistoryDTO>>>,
        IRequestHandler<GetNoteSnapshotQuery, OperationResult<NoteHistoryDTOAnswer>>,
        IRequestHandler<GetSnapshotContentsQuery, OperationResult<List<BaseNoteContentDTO>>>
    {

        private readonly IMediator _mediator;

        private readonly NoteSnapshotRepository noteHistoryRepository;

        private readonly NoteFolderLabelMapper noteCustomMapper;

        private readonly FileRepository fileRepository;

        private readonly UserNoteEncryptService userNoteEncryptStorage;

        public HistoryHandlerQuery(
            IMediator _mediator,
            NoteSnapshotRepository noteHistoryRepository,
            NoteFolderLabelMapper noteCustomMapper,
            FileRepository fileRepository,
            UserNoteEncryptService userNoteEncryptStorage)
        {
            this._mediator = _mediator;
            this.noteHistoryRepository = noteHistoryRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.fileRepository = fileRepository;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
        }

        public async Task<OperationResult<List<NoteHistoryDTO>>> Handle(GetNoteHistoriesQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked)
            {
                var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
                if (!isUnlocked)
                {
                    return new OperationResult<List<NoteHistoryDTO>>(false, null).SetContentLocked();
                }
            }

            if (permissions.CanRead)
            {
                var histories = await noteHistoryRepository.GetNoteHistories(request.NoteId);
                var data = MapHistoriesToHistoriesDto(histories);
                return new OperationResult<List<NoteHistoryDTO>>(true, data);
            }

            return new OperationResult<List<NoteHistoryDTO>>(false, null).SetNoPermissions();
        }

        public async Task<OperationResult<NoteHistoryDTOAnswer>> Handle(GetNoteSnapshotQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked)
            {
                var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
                if (!isUnlocked)
                {
                    return new OperationResult<NoteHistoryDTOAnswer>(false, null).SetContentLocked();
                }
            }

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
                var data = new NoteHistoryDTOAnswer(true, MapNoteSnapshotToNoteSnapshotDTO(snapshot));
                return new OperationResult<NoteHistoryDTOAnswer>(true, data);
            }

            return new OperationResult<NoteHistoryDTOAnswer>(false, null).SetNoPermissions();
        }

        public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetSnapshotContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.Note.IsLocked)
            {
                var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
                if (!isUnlocked)
                {
                    return new OperationResult<List<BaseNoteContentDTO>>(false, null).SetContentLocked();
                }
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

            resultList.AddRange(contents.TextNoteSnapshots.Select(text => new TextNoteDTO(text.Contents, Guid.Empty, text.Order, text.NoteTextTypeId, text.HTypeId, text.Checked, 0, text.UpdatedAt)));

            var ids = contents.GetFileIdsFromAllContent();
            if (ids.Any())
            {
                var files = await fileRepository.GetWhereAsync(x => ids.Contains(x.Id));
                foreach (var x in contents.CollectionNoteSnapshots)
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

        public UserNoteHistory MapUserToUserNoteHistory(User user)
        {
            var path = this.noteCustomMapper.BuildFilePath(user.Id, user.UserProfilePhoto?.AppFile.GetFromSmallPath);
            return new UserNoteHistory()
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = path ?? user.DefaultPhotoUrl
            };

        }

        public List<UserNoteHistory> MapUsersToUsersNoteHistory(IEnumerable<User> users)
        {
            return users.Select(x => MapUserToUserNoteHistory(x)).ToList();
        }

        private NoteHistoryDTO MapHistoryToHistoryDto(NoteSnapshot historyDTO)
        {
            return new NoteHistoryDTO()
            {
                SnapshotTime = historyDTO.SnapshotTime,
                Users = MapUsersToUsersNoteHistory(historyDTO.Users),
                NoteVersionId = historyDTO.Id
            };
        }

        private List<NoteHistoryDTO> MapHistoriesToHistoriesDto(IEnumerable<NoteSnapshot> histories)
        {
            return histories.Select(x => MapHistoryToHistoryDto(x)).ToList();
        }

        private NoteSnapshotDTO MapNoteSnapshotToNoteSnapshotDTO(NoteSnapshot snapshot)
        {
            return new NoteSnapshotDTO()
            {
                Id = snapshot.Id,
                Color = snapshot.Color,
                SnapshotTime = snapshot.SnapshotTime,
                Labels = snapshot.Labels.Select(x => new LabelDTO { Name = x.Name, Color = x.Color }).ToList(),
                NoteId = snapshot.NoteId,
                NoteTypeId = snapshot.NoteTypeId,
                RefTypeId = snapshot.RefTypeId,
                Title = snapshot.Title
            };
        }

        private PhotosCollectionNoteDTO ConvertPhotosCollection(CollectionNoteSnapshot photos, List<AppFile> files)
        {
            var filePhotos = files.Where(x => photos.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToPhotoDTO(x, x.UserId)).ToList();
            return new PhotosCollectionNoteDTO(filePhotos, photos.Name, photos.MetaData.Width, photos.MetaData.Height, Guid.Empty, photos.Order, photos.MetaData.CountInRow, photos.UpdatedAt);
        }

        private VideosCollectionNoteDTO ConvertVideosCollection(CollectionNoteSnapshot videos, List<AppFile> files)
        {
            var fileVideos = files.Where(x => videos.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToVideoDTO(x, x.UserId)).ToList();
            return new VideosCollectionNoteDTO(Guid.Empty, videos.Order, videos.UpdatedAt, videos.Name, fileVideos);
        }

        private DocumentsCollectionNoteDTO ConvertDocumentsCollection(CollectionNoteSnapshot documents, List<AppFile> files)
        {
            var fileDocuments = files.Where(x => documents.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToDocumentDTO(x, x.UserId)).ToList();
            return new DocumentsCollectionNoteDTO(Guid.Empty, documents.Order, documents.UpdatedAt, documents.Name, fileDocuments);
        }

        private AudiosCollectionNoteDTO ConvertAudiosCollection(CollectionNoteSnapshot audios, List<AppFile> files)
        {
            var fileAudios = files.Where(x => audios.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToAudioDTO(x, x.UserId)).ToList();
            return new AudiosCollectionNoteDTO(Guid.Empty, audios.Order, audios.UpdatedAt, audios.Name, fileAudios);
        }
    }
}
