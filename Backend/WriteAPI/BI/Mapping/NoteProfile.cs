using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.notes;
using System.Linq;

namespace BI.Mapping
{
    public class NoteProfile: Profile
    {
        public NoteProfile()
        {
            CreateMap<Note, FullNote>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Title, dest => dest.MapFrom(f => f.Title))
                .ForMember(x => x.Color, dest => dest.MapFrom(f => f.Color))
                .ForMember(x => x.NoteType, dest => dest.MapFrom(f => f.NoteType))
                .ForMember(x => x.RefType, dest => dest.MapFrom(f => f.RefType))
                .ForMember(x => x.Labels, dest => dest.MapFrom(z => z.LabelsNotes.Select(x => x.Label)));

            CreateMap<Note, SmallNote>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Title, dest => dest.MapFrom(f => f.Title))
                .ForMember(x => x.Color, dest => dest.MapFrom(f => f.Color))
                .ForMember(x => x.NoteType, dest => dest.MapFrom(f => f.NoteType))
                .ForMember(x => x.RefType, dest => dest.MapFrom(f => f.RefType))
                .ForMember(x => x.Labels, dest => dest.MapFrom(z => z.LabelsNotes.Select(x => x.Label)));
        }
    }
}
