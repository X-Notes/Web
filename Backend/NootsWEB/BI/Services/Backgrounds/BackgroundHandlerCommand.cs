using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using Common;
using Common.DTO;
using Common.DTO.Backgrounds;
using Domain.Commands.Backgrounds;
using MediatR;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;
using Noots.Storage.Commands;
using WriteContext.Repositories.Users;

namespace BI.Services.Backgrounds
{
    public class BackgroundHandlerCommand :
        IRequestHandler<DefaultBackgroundCommand, Unit>,
        IRequestHandler<RemoveBackgroundCommand, Unit>,
        IRequestHandler<UpdateBackgroundCommand, Unit>,
        IRequestHandler<NewBackgroundCommand, OperationResult<BackgroundDTO>>
    {
        private readonly UserRepository userRepository;
        private readonly BackgroundRepository backgroundRepository;
        private readonly IMediator _mediator;
        private readonly UserBackgroundMapper userBackgroundMapper;

        public BackgroundHandlerCommand(BackgroundRepository backgroundRepository,
                                        UserRepository userRepository,
                                        IMediator _mediator,
                                        UserBackgroundMapper userBackgroundMapper)
        {
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
            this._mediator = _mediator;
            this.userBackgroundMapper = userBackgroundMapper;
        }

        public async Task<Unit> Handle(DefaultBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.CurrentBackgroundId = null;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.UserId);
            var back = user.Backgrounds.Where(x => x.Id == request.Id).FirstOrDefault();
            if (back != null)
            {
                await backgroundRepository.RemoveAsync(back);
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), back.File));
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.CurrentBackgroundId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<OperationResult<BackgroundDTO>> Handle(NewBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.File.Length, user.Id));
            if(uploadPermission == PermissionUploadFileEnum.NoCanUpload)
            {
                return new OperationResult<BackgroundDTO>().SetNoEnougnMemory();
            }

            var filebytes = await request.File.GetFilesBytesAsync();
            var appFile = await _mediator.Send(new SaveBackgroundCommand(user.Id, filebytes));

            var item = new Common.DatabaseModels.Models.Users.Background()
            {
                UserId = user.Id,
                File = appFile
            };

            var success = await backgroundRepository.AddBackground(item, appFile);

            if (!success)
            {
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), appFile));
                return null;
            }

            await Handle(new UpdateBackgroundCommand(request.UserId, item.Id), CancellationToken.None);
            var ent = userBackgroundMapper.MapToBackgroundDTO(item);
            return new OperationResult<BackgroundDTO>(success: true, ent);
        }
    }
}
