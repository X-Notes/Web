using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.labels;
using Common.DTO.notes;
using Domain.Commands.labels;

namespace BI.Mapping
{
    public class LabelProfile : Profile
    {
        public LabelProfile()
        {
            CreateMap<Label, LabelDTO>()
                .ForMember(z => z.Color, dest => dest.MapFrom(x => x.Color))
                .ForMember(z => z.CountNotes, dest => dest.MapFrom(x => x.LabelsNotes.Count))
                .ForMember(z => z.Id, dest => dest.MapFrom(x => x.Id))
                .ForMember(z => z.Name, dest => dest.MapFrom(x => x.Name))
                .ForMember(z => z.IsDeleted, dest => dest.MapFrom(x => x.IsDeleted));

        }
    }
}
