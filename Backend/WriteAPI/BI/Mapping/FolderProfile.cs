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
                .ForMember(x => x.Id, dest => dest.MapFrom(z => z.Id.ToString("N")));
            CreateMap<Folder, SmallFolder>()
                .ForMember(x => x.Id, dest => dest.MapFrom(z => z.Id.ToString("N")));
        }
    }
}
