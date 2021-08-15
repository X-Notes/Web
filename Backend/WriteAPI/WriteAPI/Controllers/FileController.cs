using Azure.Core;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Notes.FullNoteContent;
using Domain.Queries.Permissions;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.ControllerConfig;
using WriteContext.Repositories.Users;

namespace WriteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {

        private readonly UserRepository userRepository;

        private readonly IMediator _mediator;

        public FileController(UserRepository userRepository, IMediator _mediator)
        {
            this.userRepository = userRepository;
            this._mediator = _mediator;
        }

        [HttpGet("upload/constraints")]
        public FileSizeConstraintsDTO GetFileSizeConstraints()
        {
            return new FileSizeConstraintsDTO(FileSizeConstraints.MaxProfilePhotoSize, FileSizeConstraints.MaxBackgroundPhotoSize);
        }

        [HttpGet("upload/canload")]
        public async Task<OperationResult<bool>> GetCanUserUploadFile([FromQuery] long size, [FromQuery] string type)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == this.GetUserEmail());

            if(user != null && SupportFileContentTypes.IsFileSupport(type))
            {
                if(await _mediator.Send(new GetPermissionUploadFileQuery(size, user.Id)) == PermissionUploadFileEnum.CanUpload)
                {
                    return new OperationResult<bool>(true, true);
                }
            }

            return new OperationResult<bool>(false, false);
        }
    }
}
