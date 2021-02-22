using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.app;

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


            CreateMap<RefType, RefTypeDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(f => f.Name));


            CreateMap<FolderType, FolderTypeDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(f => f.Name));


            CreateMap<NoteType, NoteTypeDTO>()
                .ForMember(x => x.Id, dest => dest.MapFrom(f => f.Id))
                .ForMember(x => x.Name, dest => dest.MapFrom(f => f.Name));
        }
    }
}
