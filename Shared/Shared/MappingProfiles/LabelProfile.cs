using AutoMapper;
using Shared.DTO.Label;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.MappingProfiles
{
    public class LabelProfile : Profile
    {
        public LabelProfile()
        {
            CreateMap<NewLabel, Label>();
            CreateMap<Label, LabelDTO>()
                .ForMember(x => x.Id, opt => opt.MapFrom(g => g.Id.ToString()))
                .ForMember(x => x.Color, opt => opt.MapFrom(g => g.Color))
                .ForMember(x => x.Name, opt => opt.MapFrom(g => g.Name));
        }
    }
}
