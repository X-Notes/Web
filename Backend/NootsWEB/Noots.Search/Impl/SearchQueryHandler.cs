using Common.DatabaseModels.DapperEntities.Search;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Notes;
using MediatR;
using Noots.DatabaseContext.Dapper.Reps;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Mapper.Mapping;
using Noots.MapperLocked;
using Noots.Permissions.Queries;
using Noots.Search.Entities;
using Noots.Search.Queries;

namespace Noots.Search.Impl
{
    public class SearchQueryHandler
        : IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>,
          IRequestHandler<GetNotesAndFolderForSearchQuery, SearchNoteFolderResult>,
          IRequestHandler<GetNotesForPreviewWindowQuery, List<PreviewNoteForSelection>>,
          IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>
    {
        private readonly UserBackgroundMapper userBackgroundMapper;

        private readonly UserRepository userRepository;

        private readonly IMediator _mediator;

        private readonly RelatedNoteToInnerNoteRepository relatedRepository;

        private readonly NoteRepository noteRepository;

        private readonly MapperLockedEntities mapperLockedEntities;

        private readonly FoldersNotesRepository foldersNotesRepository;

        private readonly DapperSearchRepository dapperSearchRepository;

        private readonly TextNoteIndexRepository textNoteIndexRepository;

        public SearchQueryHandler(
            UserRepository userRepository,
            UserBackgroundMapper userBackgroundMapper,
            IMediator mediator,
            RelatedNoteToInnerNoteRepository relatedRepository,
            NoteRepository noteRepository,
            MapperLockedEntities mapperLockedEntities,
            FoldersNotesRepository foldersNotesRepository,
            DapperSearchRepository dapperSearchRepository,
            TextNoteIndexRepository textNoteIndexRepository)
        {
            this.userRepository = userRepository;
            this.userBackgroundMapper = userBackgroundMapper;
            _mediator = mediator;
            this.relatedRepository = relatedRepository;
            this.noteRepository = noteRepository;
            this.mapperLockedEntities = mapperLockedEntities;
            this.foldersNotesRepository = foldersNotesRepository;
            this.dapperSearchRepository = dapperSearchRepository;
            this.textNoteIndexRepository = textNoteIndexRepository;
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
            var noteIds = await dapperSearchRepository.GetUserNotesAndSharedIds(request.UserId);

            List<NoteSearch> noteSearches = new();
            if (noteIds.Any())
            {
                var noteTitlesRes = await dapperSearchRepository.SearchByNoteTitle(noteIds.ToArray(), request.SearchString);
                var noteResultDict = noteTitlesRes.Select(x => new NoteSearch(x.Id, x.Title)).ToDictionary(x => x.NoteId);

                var noteContentsRes = await textNoteIndexRepository.GetTextsNotesAsync(noteIds, request.SearchString);

                foreach(var item in noteContentsRes.Where(x => noteResultDict.ContainsKey(x.NoteId)))
                {
                    noteResultDict[item.NoteId].Contents.Add(item.Content);
                }

                var noteWithoutTitle = noteContentsRes.Where(x => !noteResultDict.ContainsKey(x.NoteId));
                var lookNoteContent = noteWithoutTitle.ToLookup(x => x.NoteId);

                var noteIdsWithoutTitle = noteWithoutTitle.Select(x => x.NoteId).Distinct();

                var notes = await noteRepository.GetManyAsync(noteIdsWithoutTitle);

                foreach(var note in notes)
                {
                    noteResultDict.Add(note.Id, new NoteSearch(note.Id, note.Title) { Contents = lookNoteContent[note.Id].Select(x => x.Content).ToList() });
                }


                noteSearches = noteResultDict.Values.ToList();
            }

            var folderIds = await dapperSearchRepository.GetUserFoldersIds(request.UserId);
            IEnumerable<FolderTitle>? folderTitles = null;
            if (folderIds.Any())
            {
                folderTitles = await dapperSearchRepository.SearchByFolderTitle(folderIds.ToArray(), request.SearchString);
            }

            var searchedFolders = folderTitles?.Select(note => new FolderSearch()
            {
                Id = note.Id,
                Title = note.Title
            }).ToList();

            return new SearchNoteFolderResult()
            {
                FoldersResult = searchedFolders,
                NotesResult = noteSearches
            };
        }

        public async Task<List<PreviewNoteForSelection>> Handle(GetNotesForPreviewWindowQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return null;
            }
            
            var relatedNotes = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
            var relatedNotesIds = relatedNotes.Select(x => x.RelatedNoteId).ToList();
  
            if (!string.IsNullOrEmpty(request.Search))
            {
                var noteIds = await noteRepository.GetNoteIdsNoDeleted(request.UserId, request.NoteId);
                if (!noteIds.Any())
                {
                    return null;
                }

                HashSet<Guid> noteSearchesIds = new();
                var noteTitlesRes = await dapperSearchRepository.SearchByNoteTitle(noteIds, request.Search);
                noteSearchesIds.UnionWith(noteTitlesRes.Select(x => x.Id));
                var noteContentsRes = await textNoteIndexRepository.GetTextsNotesAsync(noteIds, request.Search);
                noteSearchesIds.UnionWith(noteContentsRes.Select(x => x.NoteId));

                if (!noteSearchesIds.Any())
                {
                    return null;
                }

                var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(noteSearchesIds, request.Settings);
                return mapperLockedEntities.MapNotesToPreviewNotesDTO(notes, relatedNotesIds);
            }

            var userNoteIds = await noteRepository.GetNoteIdsNoDeleted(request.UserId, request.NoteId);
            var allNoteIdsToView = userNoteIds.Concat(relatedNotesIds).ToHashSet();
            var allNotesToView = await noteRepository.GetNotesByNoteIdsIdWithContent(allNoteIdsToView, request.Settings);
            return mapperLockedEntities.MapNotesToPreviewNotesDTO(allNotesToView, relatedNotesIds);
        }

        public async Task<List<SmallNote>> Handle(GetPreviewSelectedNotesForFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (!permissions.CanWrite)
            {
                return null;
            }

            var folderNoteIds = await foldersNotesRepository.GetNoteIdsByFolderId(request.FolderId);

            if (!string.IsNullOrEmpty(request.Search))
            {
                var noteIds = await noteRepository.GetNoteIdsNoDeleted(permissions.Caller.Id, folderNoteIds);
                if (!noteIds.Any())
                {
                    return null;
                }

                HashSet<Guid> noteSearchesIds = new();
                var noteTitlesRes = await dapperSearchRepository.SearchByNoteTitle(noteIds, request.Search);
                noteSearchesIds.UnionWith(noteTitlesRes.Select(x => x.Id));
                var noteContentsRes = await textNoteIndexRepository.GetTextsNotesAsync(noteIds, request.Search);
                noteSearchesIds.UnionWith(noteContentsRes.Select(x => x.NoteId));

                if (!noteSearchesIds.Any())
                {
                    return null;
                }

                var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(noteSearchesIds, request.Settings);
                return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
            }

            var nonFolderNotes = await noteRepository.GetNotesByUserIdNoLockedWithoutDeleted(permissions.Caller.Id, folderNoteIds, request.Settings);
            return mapperLockedEntities.MapNotesToSmallNotesDTO(nonFolderNotes, request.UserId);
        }
    }
}
