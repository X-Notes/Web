using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Services;

namespace NootsAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotesController : ControllerBase
    {
        private readonly NoteService noteService;
        public NotesController(NoteService noteService)
        {
            this.noteService = noteService;
        }
        
        [HttpGet("new")]
        public async Task<string> NewNote()
        {
            return await noteService.NewNote();
        }
    }
}