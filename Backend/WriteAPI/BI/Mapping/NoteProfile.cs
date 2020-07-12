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
            CreateMap<Note, FullNote>();
            CreateMap<Note, SmallNote>();
        }
    }
}
