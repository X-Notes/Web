using AutoMapper;
using Common.DTO.notes;
using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.models;

namespace BI.Mapping
{
    public class NoteProfile: Profile
    {
        public NoteProfile()
        {
            CreateMap<Note, FullNote>()
                .ForMember(x => x.WriteId, dest => dest.MapFrom(z => z.WriteId.ToString("N")));
            CreateMap<Note, SmallNote>()
                .ForMember(x => x.WriteId, dest => dest.MapFrom(z => z.WriteId.ToString("N")));
        }
    }
}
