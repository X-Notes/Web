using AutoMapper;
using Common.DTO.labels;
using Common.DTO.notes;
using Domain.Queries.notes;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services
{
    public class NoteHandlerQuery : 
        IRequestHandler<GetAllNotesQuery, List<SmallNote>>,
        IRequestHandler<GetFullNoteQuery, FullNote>
    {
        private readonly IMapper mapper;
        private readonly NoteRepository noteRepository;
        private readonly UserRepository userRepository;
        public NoteHandlerQuery(IMapper mapper, NoteRepository noteRepository, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.noteRepository = noteRepository;
            this.userRepository = userRepository;
        }
        public async Task<List<SmallNote>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            var notes = noteRepository.GetByUserId(user.Id);
            return mapper.Map<List<SmallNote>>(notes);
        }

        public async Task<FullNote> Handle(GetFullNoteQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            var note = noteRepository.GetFull(request.Id);
            return mapper.Map<FullNote>(note);
        }
    }
}
