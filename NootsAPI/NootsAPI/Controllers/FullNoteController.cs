using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Services;
using Shared.DTO.Note;

namespace NootsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FullNoteController : ControllerBase
    {
        private readonly FullNoteService fullNoteService;
        public FullNoteController(FullNoteService fullNoteService)
        {
            this.fullNoteService = fullNoteService;
        }

        [HttpPost]
        public async Task Update(UpdateFullNoteDescription description)
        {
            await this.fullNoteService.UpdateDescription(description);
        }
    }
}