using AutoMapper;
using Shared.DTO.PartDTO;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.MappingProfiles
{
    public class PartsProfile : Profile
    {
        public PartsProfile()
        {
            CreateMap<Part, DTOPart>();
            CreateMap<CommonList, DTOCommonList>();
            CreateMap<Text, DTOText>();
        }
    }
}
