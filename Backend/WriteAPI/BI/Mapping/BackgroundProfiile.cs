using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Backgrounds;

namespace BI.Mapping
{
    public class BackgroundProfiile: Profile
    {
        public BackgroundProfiile()
        {
            CreateMap<Backgrounds, BackgroundDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.PhotoId, dest => dest.MapFrom(f => f.FileId))
                .ForMember(x => x.PhotoPath, dest => dest.MapFrom(f => f.File.GetFromBigPath));

            CreateMap<BackgroundDTO, Backgrounds>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.FileId, dest => dest.MapFrom(f => f.PhotoId));
        }
    }
}
