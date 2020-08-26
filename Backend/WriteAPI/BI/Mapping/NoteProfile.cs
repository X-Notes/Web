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
                .ForMember(x => x.Id, dest => dest.MapFrom(z => z.Id.ToString("N")))
                .ForMember(x => x.LabelsIds, dest => dest.MapFrom(z => z.LabelsNotes.Select(x => x.LabelId)));

            CreateMap<Note, SmallNote>()
                .ForMember(x => x.Id, dest => dest.MapFrom(z => z.Id.ToString("N")))
                .ForMember(x => x.LabelsIds, dest => dest.MapFrom(z => z.LabelsNotes.Select(x => x.LabelId)));
        }
    }
}
