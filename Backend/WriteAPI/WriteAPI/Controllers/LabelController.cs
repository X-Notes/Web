﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.labels;
using Domain.Commands.labels;
using Domain.Queries.labels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LabelController : ControllerBase
    {
        private readonly IMediator _mediator;
        public LabelController(IMediator _mediator)
        {
            this._mediator = _mediator;
        }

        [HttpPost]
        public async Task<JsonResult> Add(NewLabelCommand newLabel)
        {
            var email = this.GetUserEmail();
            newLabel.Email = email;
            return new JsonResult(await _mediator.Send(newLabel));
        }

        [HttpGet]
        public async Task<LabelsDTO> GetUserLabels()
        {
            var email = this.GetUserEmail();
            return await _mediator.Send(new GetLabelsByEmail(email));
        }

        [HttpPut]
        public async Task Update(UpdateLabelCommand label)
        {
            var email = this.GetUserEmail();
            label.Email = email;
           await _mediator.Send(label);
        }

        [HttpDelete("perm/{id}")]
        public async Task DeletePerm(int id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new DeleteLabelCommand(email, id));
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new SetDeletedLabelCommand(email, id));
        }

        [HttpGet("restore/{id}")]
        public async Task RestoreLabel(int id)
        {
            var email = this.GetUserEmail();
            await _mediator.Send(new RestoreLabelCommand(email, id));
        }
    }
}