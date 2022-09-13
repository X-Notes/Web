using Common.DatabaseModels.Models.Users;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Files;
using Noots.DatabaseContext.Repositories.Users;
using Noots.Mapper.Mapping;
using Noots.Storage.Queries;
using Noots.Users.Entities;
using Noots.Users.Queries;

namespace Noots.Users.Impl
{
    public class UserHandlerQuery :
        IRequestHandler<GetUserDTOQuery, OperationResult<UserDTO>>,
        IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>,
        IRequestHandler<GetUserShortDTOQuery, OperationResult<ShortUser>>
    {
        private readonly UserRepository userRepository;

        private readonly FileRepository fileRepository;
        private readonly UserBackgroundMapper userBackgroundMapper;

        public UserHandlerQuery(
            UserRepository userRepository, 
            FileRepository fileRepository,
            UserBackgroundMapper userBackgroundMapper)
        {
            this.userRepository = userRepository;
            this.fileRepository = fileRepository;
            this.userBackgroundMapper = userBackgroundMapper;
        }

        public async Task<OperationResult<UserDTO>> Handle(GetUserDTOQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludeBackgroundAndPhoto(request.UserId);
            if (user != null)
            {
                var userDto = MapToUserDTO(user);
                return new OperationResult<UserDTO>(true , userDto);
            }
            return new OperationResult<UserDTO>().SetNotFound();
        }

        private UserDTO MapToUserDTO(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = userBackgroundMapper.GetUserProfilePhotoPath(user),
                CurrentBackground = user.CurrentBackground != null ? userBackgroundMapper.MapToBackgroundDTO(user.CurrentBackground) : null,
                LanguageId = user.LanguageId,
                ThemeId = user.ThemeId,
                FontSizeId = user.FontSizeId,
                BillingPlanId = user.BillingPlanId
            };
        }

        private ShortUser MapToShortDTO(User user)
        {
            return new ShortUser
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhotoId = user.UserProfilePhoto?.AppFileId,
                PhotoPath = userBackgroundMapper.GetUserProfilePhotoPath(user),
            };
        }

        public async Task<GetUserMemoryResponse> Handle(GetUserMemoryQuery request, CancellationToken cancellationToken)
        {
            var size = await fileRepository.GetTotalUserMemory(request.UserId);
            return new GetUserMemoryResponse { TotalSize = size };
        }

        public async Task<OperationResult<ShortUser>> Handle(GetUserShortDTOQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailIncludePhoto(request.UserId);
            if (user != null)
            {
                var userDto = MapToShortDTO(user);
                return new OperationResult<ShortUser>(true, userDto);
            }
            return new OperationResult<ShortUser>().SetNotFound();
        }
    }
}
