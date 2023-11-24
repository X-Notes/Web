using System.Threading.Tasks;
using Common;
using Common.ConstraintsUploadFiles;
using Common.DTO;
using DatabaseContext.Repositories.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Permissions.Queries;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
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
        var user = await userRepository.FirstOrDefaultAsync(x => x.Id == this.GetUserId());

        if (user != null)
        {
            if (!SupportFileContentTypes.IsFileSupport(model.Types))
            {
                return new OperationResult<bool>().SetNoSupportExtension();
            }

            if (await _mediator.Send(new GetPermissionUploadFileQuery(model.Size, user.Id)) == PermissionUploadFileEnum.NoCanUpload)
            {
                return new OperationResult<bool>().SetNoEnougnMemory();
            }
        }

        return new OperationResult<bool>(true, true);
    }
}