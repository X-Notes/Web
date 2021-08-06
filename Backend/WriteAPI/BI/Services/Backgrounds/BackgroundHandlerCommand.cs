using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using BI.Helpers;
using Common.DTO.Backgrounds;
using ContentProcessing;
using Domain.Commands.Backgrounds;
using Domain.Commands.Files;
using MediatR;
using WriteContext.Repositories.Users;

namespace BI.Services.Backgrounds
{
    public class BackgroundHandlerCommand :
        IRequestHandler<DefaultBackgroundCommand, Unit>,
        IRequestHandler<RemoveBackgroundCommand, Unit>,
        IRequestHandler<UpdateBackgroundCommand, Unit>,
        IRequestHandler<NewBackgroundCommand, BackgroundDTO>
    {
        private readonly IMapper mapper;
        private readonly UserRepository userRepository;
        private readonly BackgroundRepository backgroundRepository;
        private readonly IImageProcessor imageProcessor;
        private readonly IMediator _mediator;

        public BackgroundHandlerCommand(BackgroundRepository backgroundRepository,
                                        UserRepository userRepository,
                                        IMapper mapper,
                                        IImageProcessor imageProcessor,
                                        IMediator _mediator)
        {
            this.backgroundRepository = backgroundRepository;
            this.userRepository = userRepository;
            this.mapper = mapper;
            this.imageProcessor = imageProcessor;
            this._mediator = _mediator;
        }

        public async Task<Unit> Handle(DefaultBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.CurrentBackgroundId = null;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(RemoveBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithBackgrounds(request.Email);
            var back = user.Backgrounds.Where(x => x.Id == request.Id).FirstOrDefault();
            if (back != null)
            {
                await backgroundRepository.RemoveAsync(back);
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), back.File).SetIsNoCheckDelete());
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            user.CurrentBackgroundId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<BackgroundDTO> Handle(NewBackgroundCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);

            var filebytes = await request.File.GetFilesBytesAsync();
            var appFile = await _mediator.Send(new SaveBackgroundCommand(user.Id, filebytes));

            var item = new Common.DatabaseModels.Models.Users.Backgrounds()
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

            await Handle(new UpdateBackgroundCommand(request.Email, item.Id), CancellationToken.None);
            return mapper.Map<BackgroundDTO>(item);
        }
    }
}
