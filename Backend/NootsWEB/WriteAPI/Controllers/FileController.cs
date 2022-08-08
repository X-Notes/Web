using Common.DTO;
using Domain.Queries.Permissions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
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

        [HttpPost("upload/canload")]
        public async Task<OperationResult<bool>> GetCanUserUploadFile(CanUploadFilesModel model)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == this.GetUserEmail());

            if(user != null)
            {
                if (!SupportFileContentTypes.IsFileSupport(model.Types)) {
                    return new OperationResult<bool>().SetNoSupportExtension();
                }

                if(await _mediator.Send(new GetPermissionUploadFileQuery(model.Size, user.Id)) == PermissionUploadFileEnum.NoCanUpload)
                {
                    return new OperationResult<bool>().SetNoEnougnMemory();
                }
            }

            return new OperationResult<bool>(true, true);
        }
    }
}
