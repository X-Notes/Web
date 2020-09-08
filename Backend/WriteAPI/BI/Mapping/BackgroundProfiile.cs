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
            CreateMap<Backgrounds, BackgroundDTO>().ReverseMap();
        }
    }
}
