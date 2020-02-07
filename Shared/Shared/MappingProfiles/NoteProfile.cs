using AutoMapper;
using Shared.DTO.Note;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.MappingProfiles
{
    public class NoteProfile : Profile
    {
        public NoteProfile()
        {
            CreateMap<Note, DTONote>();
        }
    }
}
