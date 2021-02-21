using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.app;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BI.Mapping
{
    public class AppProfile: Profile
    {
        public AppProfile()
        {
            CreateMap<Language, LanguageDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(f => f.Name));

            CreateMap<FontSize, FontSizeDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(f => f.Name));

            CreateMap<Theme, ThemeDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(f => f.Name));
        }
    }
}
