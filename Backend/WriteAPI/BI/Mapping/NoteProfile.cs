using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.notes;

namespace BI.Mapping
{
    public class NoteProfile: Profile
    {
        public NoteProfile()
        {
            CreateMap<Note, FullNote>()
                .ForMember(x => x.Id, dest => dest.MapFrom(z => z.Id.ToString("N")));
            CreateMap<Note, SmallNote>()
                .ForMember(x => x.Id, dest => dest.MapFrom(z => z.Id.ToString("N")));
        }
    }
}
