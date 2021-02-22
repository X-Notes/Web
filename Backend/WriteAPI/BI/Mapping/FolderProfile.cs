using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.folders;
using System;
using System.Collections.Generic;
using System.Text;

namespace BI.Mapping
{
    public class FolderProfile: Profile
    {
        public FolderProfile()
        {
            CreateMap<Folder, FullFolder>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Color, dest => dest.MapFrom(f => f.Color))
                .ForMember(x => x.RefType, dest => dest.MapFrom(f => f.RefType))
                .ForMember(x => x.Title, dest => dest.MapFrom(f => f.Title))
                .ForMember(x => x.FolderType, dest => dest.MapFrom(f => f.FolderType));

            CreateMap<Folder, SmallFolder>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.RefType, dest => dest.MapFrom(f => f.RefType))
                .ForMember(x => x.Title, dest => dest.MapFrom(f => f.Title))
                .ForMember(x => x.Color, dest => dest.MapFrom(f => f.Color))
                .ForMember(x => x.FolderType, dest => dest.MapFrom(f => f.FolderType));
        }
    }
}
