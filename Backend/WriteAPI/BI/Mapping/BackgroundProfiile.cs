using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.backgrounds;
using System;
using System.Collections.Generic;
using System.Text;

namespace BI.Mapping
{
    public class BackgroundProfiile: Profile
    {
        public BackgroundProfiile()
        {
            CreateMap<Backgrounds, BackgroundDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Path, dest => dest.MapFrom(f => f.FileId));

            CreateMap<BackgroundDTO, Backgrounds>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.FileId, dest => dest.MapFrom(f => f.Path));
        }
    }
}
