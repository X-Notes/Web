using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO.Search;
using Domain.Queries.Search;
using MediatR;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.Services.Search
{
    public class SeachQueryHandler
        : IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>,
          IRequestHandler<GetNotesAndFolderForSearchQuery, SearchNoteFolderResult>
    {
        private readonly SearchRepository searchRepository;
        private readonly UserBackgroundMapper userBackgroundMapper;
        private readonly UserRepository userRepository;

        public SeachQueryHandler(
            UserRepository userRepository,
            SearchRepository searchRepository,
            UserBackgroundMapper userBackgroundMapper)
        {
            this.userRepository = userRepository;
            this.searchRepository = searchRepository;
            this.userBackgroundMapper = userBackgroundMapper;
        }

        public async Task<List<ShortUserForShareModal>> Handle(GetUsersForSharingModalQuery request, CancellationToken cancellationToken)
        {
            request.SearchString = request.SearchString.ToLower();
            var users = await userRepository.SearchByEmailAndName(request.SearchString, request.UserId);
            return users.Select(x => userBackgroundMapper.MapToShortUserForShareModal(x)).ToList();
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
    }
}
