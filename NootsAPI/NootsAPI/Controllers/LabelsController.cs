using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Interfaces;
using NootsAPI.Infastructure;
using Shared.DTO.Label;

namespace NootsAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LabelsController : ControllerBase
    {
        ILabelService labelService;
        public LabelsController(ILabelService labelService)
        {
            this.labelService = labelService;
        }

        [HttpPost]
        public async Task<JsonResult> Add(NewLabel newLabel)
        {
            var currentUserEmail = this.GetUserEmail();
            var id =  await labelService.Add(newLabel, currentUserEmail);
            return new JsonResult(id);
        }

        [HttpGet]
        public async Task<List<LabelDTO>> GetUserLabels()
        {
            var currentUserEmail = this.GetUserEmail();
            return await labelService.GetLabelsByUserId(currentUserEmail);
        }
        [HttpPut]
        public async Task Update(LabelDTO label)
        {
            await labelService.Update(label);
        
        }
        [HttpDelete("{id}")]
        public async Task Delete(string id)
        {
            await labelService.Delete(id);
        }

        [HttpGet("{id}")]
        public async Task<LabelDTO> GetById(string id)
        {
            return await labelService.GetById(id);
        }
    }
}