using AutoMapper;
using Common.DTO.labels;
using Domain.Commands.labels;
using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.models;

namespace BI.Mapping
{
    public class LabelProfile : Profile
    {
        public LabelProfile()
        {
            CreateMap<NewLabel, Label>().ReverseMap();
            CreateMap<Label, LabelDTO>().ReverseMap();
        }
    }
}
