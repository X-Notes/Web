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
            CreateMap<Folder, FullFolder>();
            CreateMap<Folder, SmallFolder>();
        }
    }
}
