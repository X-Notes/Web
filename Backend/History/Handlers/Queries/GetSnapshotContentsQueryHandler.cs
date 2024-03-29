﻿using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History.Contents;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteContent.Text;
using DatabaseContext.Repositories.Files;
using DatabaseContext.Repositories.Histories;
using History.Queries;
using Mapper.Mapping;
using MediatR;
using Permissions.Queries;

namespace History.Handlers.Queries
{
    public class GetSnapshotContentsQueryHandler : IRequestHandler<GetSnapshotContentsQuery, OperationResult<List<BaseNoteContentDTO>>>
    {

        private readonly IMediator _mediator;

        private readonly NoteSnapshotRepository noteHistoryRepository;

        private readonly NoteFolderLabelMapper noteCustomMapper;

        private readonly FileRepository fileRepository;


        public GetSnapshotContentsQueryHandler(
            IMediator _mediator,
            NoteSnapshotRepository noteHistoryRepository,
            NoteFolderLabelMapper noteCustomMapper,
            FileRepository fileRepository)
        {
            this._mediator = _mediator;
            this.noteHistoryRepository = noteHistoryRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.fileRepository = fileRepository;
        }

        public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetSnapshotContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command, cancellationToken);

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.FirstOrDefaultAsync(x => x.Id == request.SnapshotId);
                var result = await Convert(snapshot.GetContentSnapshot());
                var data = result.OrderBy(x => x.Order).ToList();
                return new OperationResult<List<BaseNoteContentDTO>>(true, data);
            }

            return new OperationResult<List<BaseNoteContentDTO>>(false, null).SetNoPermissions();
        }

        private async Task<List<BaseNoteContentDTO>> Convert(ContentSnapshot contents)
        {
            var resultList = new List<BaseNoteContentDTO>();

            resultList.AddRange(contents.TextNoteSnapshots.Select(text => new TextNoteDto(text.GetContents(), Guid.Empty, text.Order, text.GetMetadata(), text.UpdatedAt, 1, text.PlainContent)));

            var ids = contents.GetFileIdsFromAllContent();
            if (ids.Any())
            {
                var files = await fileRepository.GetWhereAsync(x => ids.Contains(x.Id));
                foreach (var x in contents.CollectionNoteSnapshots)
                {
                    var metadata = x.GetMetadata();
                    switch (metadata.FileTypeId)
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


        private PhotosCollectionNoteDTO ConvertPhotosCollection(CollectionNoteSnapshot photos, List<AppFile> files)
        {
            var filePhotos = files.Where(x => photos.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToPhotoDTO(x, x.UserId)).ToList();
            var metadata = photos.GetMetadata();
            return new PhotosCollectionNoteDTO(filePhotos, metadata?.Name, metadata?.Width, metadata?.Height, Guid.Empty,
                photos.Order, metadata?.CountInRow, photos.UpdatedAt, 1);
        }

        private VideosCollectionNoteDTO ConvertVideosCollection(CollectionNoteSnapshot videos, List<AppFile> files)
        {
            var fileVideos = files.Where(x => videos.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToVideoDTO(x, x.UserId)).ToList();
            var metadata = videos.GetMetadata();
            return new VideosCollectionNoteDTO(Guid.Empty, videos.Order, videos.UpdatedAt, metadata?.Name, fileVideos, 1);
        }

        private DocumentsCollectionNoteDTO ConvertDocumentsCollection(CollectionNoteSnapshot documents, List<AppFile> files)
        {
            var fileDocuments = files.Where(x => documents.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToDocumentDTO(x, x.UserId)).ToList();
            var metadata = documents.GetMetadata();
            return new DocumentsCollectionNoteDTO(Guid.Empty, documents.Order, documents.UpdatedAt, metadata?.Name, fileDocuments, 1);
        }

        private AudiosCollectionNoteDTO ConvertAudiosCollection(CollectionNoteSnapshot audios, List<AppFile> files)
        {
            var fileAudios = files.Where(x => audios.FilesIds.Contains(x.Id)).Select(x => noteCustomMapper.MapToAudioDTO(x, x.UserId)).ToList();
            var metadata = audios.GetMetadata();
            return new AudiosCollectionNoteDTO(Guid.Empty, audios.Order, audios.UpdatedAt, metadata?.Name, fileAudios, 1);
        }
    }
}