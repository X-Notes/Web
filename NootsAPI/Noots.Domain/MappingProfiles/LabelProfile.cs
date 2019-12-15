using AutoMapper;
using Noots.Domain.DTO.Label;
using Noots.Domain.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.Domain.MappingProfiles
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
