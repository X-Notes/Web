using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Services;
using NootsAPI.Infastructure;
using Shared.DTO.Note;

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
            var email = this.GetUserEmail();
            return await noteService.NewNote(email);
        }

        [HttpGet("all")]
        public async Task<List<DTONote>> GetAll()
        {
            var currentUserEmail = this.GetUserEmail();
            return await noteService.GetAll(currentUserEmail);
        }
    }
}