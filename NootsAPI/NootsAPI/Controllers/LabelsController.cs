using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Interfaces;
using Noots.Domain.DTO.Label;
using NootsAPI.Infastructure;

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
        public async Task<string> Add(NewLabel newLabel)
        {
            var currentUserEmail = this.GetUserEmail();
            return await labelService.Add(newLabel, currentUserEmail);
        }

        [HttpGet]
        public async Task<List<LabelDTO>> GetUserLabels()
        {
            var currentUserEmail = this.GetUserEmail();
            return await labelService.GetLabelsByUserId(currentUserEmail);
        }
    }
}