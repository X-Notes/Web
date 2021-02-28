using AutoMapper;
using Common.DTO.app;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppController : ControllerBase
    {
        private readonly AppRepository appRepository;
        private readonly IMapper mapper;
        public AppController(AppRepository appRepository, IMapper mapper)
        {
            this.appRepository = appRepository;
            this.mapper = mapper;
        }

        [HttpGet("languages")]
        public async Task<List<LanguageDTO>> GetLanguages()
        {
            var languages = await appRepository.GetLanguages();
            return mapper.Map<List<LanguageDTO>>(languages);
        }

        [HttpGet("fontSizes")]
        public async Task<List<FontSizeDTO>> GetFontSize()
        {
            var fontSizes = await appRepository.GetFontSizes();
            return mapper.Map<List<FontSizeDTO>>(fontSizes);
        }

        [HttpGet("themes")]
        public async Task<List<ThemeDTO>> GetThemes()
        {
            var themes = await appRepository.GetThemes();
            return mapper.Map<List<ThemeDTO>>(themes);
        }


        [HttpGet("noteTypes")]
        public async Task<List<NoteTypeDTO>> GetNoteTypes()
        {
            var types = await appRepository.GetNoteTypes();
            return mapper.Map<List<NoteTypeDTO>>(types);
        }

        [HttpGet("folderTypes")]
        public async Task<List<FolderTypeDTO>> GetFolderTypes()
        {
            var types = await appRepository.GetFolderTypes();
            return mapper.Map<List<FolderTypeDTO>>(types);
        }

        [HttpGet("refs")]
        public async Task<List<RefTypeDTO>> GetRefs()
        {
            var refs = await appRepository.GetRefTypes();
            return mapper.Map<List<RefTypeDTO>>(refs);
        }

        [HttpGet("general")]
        public async Task<GeneralAppConfig> GetGeneral()
        {
            var refs = await appRepository.GetRefTypes();
            var refsDTO = mapper.Map<List<RefTypeDTO>>(refs);

            var typesFolder = await appRepository.GetFolderTypes();
            var typesFolderDTO = mapper.Map<List<FolderTypeDTO>>(typesFolder);

            var typesNote = await appRepository.GetNoteTypes();
            var typesNoteDTO = mapper.Map<List<NoteTypeDTO>>(typesNote);

            var themes = await appRepository.GetThemes();
            var themesDTO = mapper.Map<List<ThemeDTO>>(themes);

            var languages = await appRepository.GetLanguages();
            var languagesDTO = mapper.Map<List<LanguageDTO>>(languages);

            var fontSizes = await appRepository.GetFontSizes();
            var fontSizesDTO = mapper.Map<List<FontSizeDTO>>(fontSizes);

            return new GeneralAppConfig(typesFolderDTO, typesNoteDTO, refsDTO, themesDTO, fontSizesDTO, languagesDTO);
        }
    }
}
