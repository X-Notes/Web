using AutoMapper;
using BI.helpers;
using Common.DatabaseModels.models.NoteContent;
using Common.DTO.search;
using Domain.Queries.search;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.services.search
{
    public class SeachQueryHandler
        : IRequestHandler<GetUsersForSharingModalQuery, List<ShortUserForShareModal>>,
          IRequestHandler<GetNotesAndFolderForSearch, SearchNoteFolderResult>
    {
        private readonly SearchRepository searchRepository;
        private readonly UserRepository userRepository;
        private readonly IMapper mapper;

        public SeachQueryHandler(
            UserRepository userRepository,
            IMapper mapper,
            SearchRepository searchRepository)
        {
            this.userRepository = userRepository;
            this.mapper = mapper;
            this.searchRepository = searchRepository;
        }

        public async Task<List<ShortUserForShareModal>> Handle(GetUsersForSharingModalQuery request, CancellationToken cancellationToken)
        {
            request.SearchString = request.SearchString.ToLower();
            var users = await userRepository.SearchByEmailAndName(request.SearchString, request.Email);
            return mapper.Map<List<ShortUserForShareModal>>(users);
        }

        public async Task<SearchNoteFolderResult> Handle(GetNotesAndFolderForSearch request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var allNotes = await searchRepository.GetNotesByUserIdSearch(user.Id);

            allNotes = allNotes.Where(x =>
                    SearchHelper.IsMatchContent(x.Title, request.SearchString)
                    || x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Content, request.SearchString))
                    || x.LabelsNotes.Select(labelNote => labelNote.Label).Any(label => label.Name.Contains(request.SearchString))
                    || x.Contents.OfType<AlbumNote>()
                                .Any(x => x.Photos.Any(photo => SearchHelper.IsMatchPhoto(photo, request.SearchString)))
                    ).ToList();

            var folders = await searchRepository.GetFolderByUserIdAndString(user.Id, request.SearchString);

            var searchedNotes = allNotes.Take(5).Select(note => new NoteSearch() {
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
