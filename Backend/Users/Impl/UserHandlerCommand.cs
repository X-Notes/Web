﻿using Common;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DTO;
using DatabaseContext.Repositories.Users;
using Mapper.Mapping;
using MediatR;
using Permissions.Queries;
using Storage.Commands;
using Storage.Impl;
using Users.Commands;
using Users.Entities;

namespace Users.Impl
{
    public class UserHandlerCommand :
        IRequestHandler<NewUserCommand, OperationResult<Guid>>,
        IRequestHandler<UpdateMainUserInfoCommand, Unit>,
        IRequestHandler<UpdatePhotoCommand, OperationResult<AnswerChangeUserPhoto>>,
        IRequestHandler<UpdateLanguageCommand, Unit>,
        IRequestHandler<UpdateThemeCommand, Unit>,
        IRequestHandler<UpdateFontSizeCommand, Unit>
    {
        private readonly UserRepository userRepository;

        private readonly UserProfilePhotoRepository userProfilePhotoRepository;

        private readonly IMediator _mediator;

        private readonly UserBackgroundMapper userBackgroundMapper;

        private readonly StorageIdProvider storageIdProvider;

        public UserHandlerCommand(
            UserRepository userRepository,
            UserProfilePhotoRepository userProfilePhotoRepository,
            IMediator mediator,
            UserBackgroundMapper userBackgroundMapper,
            StorageIdProvider storageIdProvider)
        {
            this.userRepository = userRepository;
            this.userProfilePhotoRepository = userProfilePhotoRepository;
            this._mediator = mediator;
            this.userBackgroundMapper = userBackgroundMapper;
            this.storageIdProvider = storageIdProvider;
        }

        public async Task<OperationResult<Guid>> Handle(NewUserCommand request, CancellationToken cancellationToken)
        {
            var userExist = await userRepository.GetAnyAsync(x => x.Email == request.Email);
            if (userExist)
            {
                return new OperationResult<Guid>().SetAnotherError();
            }

            var user = new User()
            {
                Name = request.Name,
                LanguageId = request.LanguageId,
                Email = request.Email,
                FontSizeId = FontSizeENUM.Medium,
                ThemeId = ThemeENUM.Dark,
                BillingPlanId = BillingPlanTypeENUM.Standart,
                DefaultPhotoUrl = request.PhotoURL,
                StorageId = storageIdProvider.GetStorageId(),
            };

            await userRepository.AddAsync(user);

            return new OperationResult<Guid>(true, user.Id);
        }

        public async Task<Unit> Handle(UpdateMainUserInfoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.Name = request.Name;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<OperationResult<AnswerChangeUserPhoto>> Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);

            var uploadPermission = await _mediator.Send(new GetPermissionUploadFileQuery(request.File.Length, user.Id));
            if (uploadPermission == PermissionUploadFileEnum.NoCanUpload)
            {
                return new OperationResult<AnswerChangeUserPhoto>().SetNoEnougnMemory();
            }

            var userProfilePhoto = await userProfilePhotoRepository.GetWithFile(user.Id);

            if (userProfilePhoto != null)
            {
                await userProfilePhotoRepository.RemoveAsync(userProfilePhoto);
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), userProfilePhoto.AppFile));
            }

            var filebytes = await request.File.GetFilesBytesAsync();
            var appFile = await _mediator.Send(new SaveUserPhotoCommand(user.Id, filebytes));

            var success = await userRepository.UpdatePhoto(user, appFile);
            if (success)
            {
                var result = new AnswerChangeUserPhoto() { Success = true, Id = appFile.Id, PhotoPath = userBackgroundMapper.BuildFilePath(user.StorageId, request.UserId, appFile.GetFromSmallPath) };
                return new OperationResult<AnswerChangeUserPhoto>(true, result);
            }
            else
            {
                await _mediator.Send(new RemoveFilesCommand(user.Id.ToString(), appFile));
                return new OperationResult<AnswerChangeUserPhoto>(false, null);
            }
        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.LanguageId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateThemeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.ThemeId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateFontSizeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Id == request.UserId);
            user.FontSizeId = request.Id;
            await userRepository.UpdateAsync(user);
            return Unit.Value;
        }
    }
}