using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.app;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace WriteAPI.Controllers
{
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
    }
}
