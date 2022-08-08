using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Common.DTO.App;
using WriteContext.Repositories;
using BI.JobsHandlers;
using BI.Mapping;
using System.Linq;
using Common.Timers;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppController : ControllerBase
    {
        private readonly AppRepository appRepository;
        private readonly TimersConfig timersConfig;
        private readonly AppTypesMapper appTypesMapper;

        public AppController(
            AppRepository appRepository,
            TimersConfig timersConfig,
            AppTypesMapper appTypesMapper)
        {
            this.appRepository = appRepository;
            this.timersConfig = timersConfig;
            this.appTypesMapper = appTypesMapper;
        }

        [HttpGet("config")]
        public TimersConfig GetConfigForDelete()
        {
            return timersConfig;
        }

        [HttpGet("languages")]
        public async Task<List<LanguageDTO>> GetLanguages()
        {
            var languages = await appRepository.GetLanguages();
            return languages.Select(x => appTypesMapper.MapToLanguageDTO(x)).ToList();
        }

        [HttpGet("fontSizes")]
        public async Task<List<FontSizeDTO>> GetFontSize()
        {
            var fontSizes = await appRepository.GetFontSizes();
            return fontSizes.Select(x => appTypesMapper.MapToFontSizeDTO(x)).ToList();
        }

        [HttpGet("themes")]
        public async Task<List<ThemeDTO>> GetThemes()
        {
            var themes = await appRepository.GetThemes();
            return themes.Select(x => appTypesMapper.MapToThemeDTO(x)).ToList();
        }


        [HttpGet("noteTypes")]
        public async Task<List<NoteTypeDTO>> GetNoteTypes()
        {
            var types = await appRepository.GetNoteTypes();
            return types.Select(x => appTypesMapper.MapToNoteTypeDTO(x)).ToList();
        }

        [HttpGet("folderTypes")]
        public async Task<List<FolderTypeDTO>> GetFolderTypes()
        {
            var types = await appRepository.GetFolderTypes();
            return types.Select(x => appTypesMapper.MapToFolderTypeDTO(x)).ToList();
        }

        [HttpGet("refs")]
        public async Task<List<RefTypeDTO>> GetRefs()
        {
            var refs = await appRepository.GetRefTypes();
            return refs.Select(x => appTypesMapper.MapToRefTypeDTO(x)).ToList();
        }

        [HttpGet("general")]
        public async Task<GeneralAppConfig> GetGeneral()
        {
            var refs = await appRepository.GetRefTypes();
            var refsDTO = refs.Select(x => appTypesMapper.MapToRefTypeDTO(x)).ToList();

            var typesFolder = await appRepository.GetFolderTypes();
            var typesFolderDTO = typesFolder.Select(x => appTypesMapper.MapToFolderTypeDTO(x)).ToList();

            var typesNote = await appRepository.GetNoteTypes();
            var typesNoteDTO = typesNote.Select(x => appTypesMapper.MapToNoteTypeDTO(x)).ToList();

            var themes = await appRepository.GetThemes();
            var themesDTO = themes.Select(x => appTypesMapper.MapToThemeDTO(x)).ToList();

            var languages = await appRepository.GetLanguages();
            var languagesDTO = languages.Select(x => appTypesMapper.MapToLanguageDTO(x)).ToList();

            var fontSizes = await appRepository.GetFontSizes();
            var fontSizesDTO = fontSizes.Select(x => appTypesMapper.MapToFontSizeDTO(x)).ToList();

            return new GeneralAppConfig(typesFolderDTO, typesNoteDTO, refsDTO, themesDTO, fontSizesDTO, languagesDTO);
        }
    }
}
