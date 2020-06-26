using AutoMapper;
using Shared.DTO.User;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.MappingProfiles
{
    public class BackgroundsProfile : Profile
    {
        public BackgroundsProfile()
        {
            CreateMap<Background, DTOBackground>().ReverseMap();
        }
    }
}
