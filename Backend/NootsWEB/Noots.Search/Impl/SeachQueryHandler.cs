using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Notes;
using MediatR;
using Noots.DatabaseContext.Repositories;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Mapper.Mapping;
using Noots.MapperLocked;
using Noots.Permissions.Queries;
using Noots.Search.Entities;
using Noots.Search.Queries;

namespace Noots.Search.Impl
{
    public class SeachQueryHandler
        : IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>,
          IRequestHandler<GetNotesAndFolderForSearchQuery, SearchNoteFolderResult>,
          IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>,
          IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>
    {
        private readonly SearchRepository searchRepository;

        private readonly UserBackgroundMapper userBackgroundMapper;

        private readonly UserRepository userRepository;

        private readonly IMediator _mediator;

        private readonly RelatedNoteToInnerNoteRepository relatedRepository;

        private readonly NoteRepository noteRepository;

        private readonly MapperLockedEntities mapperLockedEntities;

        private readonly FoldersNotesRepository foldersNotesRepository;

        public SeachQueryHandler(
            UserRepository userRepository,
            SearchRepository searchRepository,
            UserBackgroundMapper userBackgroundMapper,
            IMediator mediator,
            RelatedNoteToInnerNoteRepository relatedRepository,
            NoteRepository noteRepository,
            MapperLockedEntities mapperLockedEntities,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.userRepository = userRepository;
            this.searchRepository = searchRepository;
            this.userBackgroundMapper = userBackgroundMapper;
            _mediator = mediator;
            this.relatedRepository = relatedRepository;
            this.noteRepository = noteRepository;
            this.mapperLockedEntities = mapperLockedEntities;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task<List<ShortUserForShareModal>> Handle(GetUsersForSharingModalQuery request, CancellationToken cancellationToken)
        {
            request.SearchString = request.SearchString.ToLower();
            var users = await userRepository.SearchByEmailAndName(request.SearchString, request.UserId, 100);
            return users.Select(x => MapToShortUserForShareModal(x)).ToList();
        }

        private ShortUserForShareModal MapToShortUserForShareModal(User user)
        {
            return new ShortUserForShareModal
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhotoPath = user.UserProfilePhoto != null ? userBackgroundMapper.BuildFilePath(user.UserProfilePhoto.AppFile.StorageId, user.Id, user.UserProfilePhoto.AppFile.GetFromSmallPath) : user.DefaultPhotoUrl
            };
        }

        public async Task<SearchNoteFolderResult> Handle(GetNotesAndFolderForSearchQuery request, CancellationToken cancellationToken)
        {
            var allNotes = await searchRepository.GetNotesByUserIdSearch(request.UserId);

            allNotes = allNotes.Where(x =>
                    SearchHelper.IsMatchContent(x.Title, request.SearchString)
                    || x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Contents, request.SearchString))
                    || x.LabelsNotes.Select(labelNote => labelNote.Label).Any(label => SearchHelper.IsMatchContent(label.Name, request.SearchString))).ToList();

            var folders = await searchRepository.GetFolderByUserIdAndString(request.UserId, request.SearchString);

            var searchedNotes = allNotes.Take(5).Select(note => new NoteSearch()
            {
                Id = note.Id,
                Name = note.Title
            }).ToList();

            var searchedFolders = folders.Take(5).Select(note => new FolderSearch()
            {
                Id = note.Id,
                Name = note.Title
            }).ToList();

            return new SearchNoteFolderResult()
            {
                FolderSearchs = searchedFolders,
                NoteSearchs = searchedNotes
            };
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
                    return mapperLockedEntities.MapNotesToPreviewNotesDTO(allNotes, relatedNotesIds);
                }
                else
                {
                    allNotes = allNotes.Where(x =>
                    SearchHelper.IsMatchContent(x.Title, request.Search)
                    || x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Contents, request.Search))
                    || relatedNotesIds.Contains(x.Id)
                    ).ToList();
                    return mapperLockedEntities.MapNotesToPreviewNotesDTO(allNotes, relatedNotesIds);
                }
            }

            return new List<PreviewNoteForSelection>();
        }

        public async Task<List<SmallNote>> Handle(GetPreviewSelectedNotesForFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var folderNoteIds = await foldersNotesRepository.GetNoteIdsByFolderId(request.FolderId);

                if (string.IsNullOrEmpty(request.Search))
                {
                    var notes = await noteRepository.GetNotesByUserIdNoLockedWithoutDeleted(permissions.Caller.Id, folderNoteIds, request.Settings);
                    return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
                }
                else
                {
                    var notes = await noteRepository.GetNotesByUserIdWithContentNoLocked(permissions.Caller.Id, folderNoteIds);

                    var noteIds = notes.Where(x =>
                                    SearchHelper.IsMatchContent(x.Title, request.Search) ||
                                    x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Contents, request.Search))
                                    ).Select(x => x.Id);

                    if (noteIds.Any())
                    {
                        notes = await noteRepository.GetNotesByNoteIdsIdWithContent(noteIds, request.Settings);
                        return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
                    }
                }
            }

            return new List<SmallNote>();
        }
    }
}
