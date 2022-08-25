﻿using Common.DTO.Notes.FullNoteContent.Files;
using Domain.Queries.NoteInner;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Noots.DatabaseContext.Repositories.NoteContent;


namespace BI.Services.Notes.Photos
{
    public class PhotosCollectionHandlerQuery :
        IRequestHandler<GetNoteFilesByIdsQuery<PhotoNoteDTO>, List<PhotoNoteDTO>>
    {
        private readonly IMediator mediator;
        private readonly CollectionAppFileRepository collectionAppFileRepository;
        private readonly NoteFolderLabelMapper mapper;

        public PhotosCollectionHandlerQuery(IMediator _mediator, CollectionAppFileRepository collectionAppFileRepository, NoteFolderLabelMapper mapper)
        {
            mediator = _mediator;
            this.collectionAppFileRepository = collectionAppFileRepository;
            this.mapper = mapper;
        }

        public async Task<List<PhotoNoteDTO>> Handle(GetNoteFilesByIdsQuery<PhotoNoteDTO> request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await mediator.Send(command);

            if (permissions.CanRead)
            {
                var colectionFiles = await collectionAppFileRepository.GetAppFilesByContentIds(new List<Guid> { request.CollectionId });
                var files = colectionFiles.Where(x => request.FileIds.Contains(x.AppFileId)).Select(x => x.AppFile);
                return files.Select(x => mapper.MapToPhotoDTO(x, permissions.Author.Id)).ToList();
            }

            return new List<PhotoNoteDTO>();
        }
    }
}