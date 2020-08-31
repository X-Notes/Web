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
            CreateMap<NewLabelCommand, Label>().ReverseMap();
            CreateMap<Label, LabelDTO>().ReverseMap();
        }
    }
}
