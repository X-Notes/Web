using BI.helpers;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.Users;
using Common.DTO.users;
using Common.Naming;
using Domain.Commands.users;
using MediatR;
using Storage;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.Users;

namespace BI.services.user
{
    public class UserHandlerСommand :
        IRequestHandler<NewUserCommand, Unit>,
        IRequestHandler<UpdateMainUserInfoCommand, Unit>,
        IRequestHandler<UpdatePhotoCommand, AnswerChangeUserPhoto>,
        IRequestHandler<UpdateLanguageCommand, Unit>,
        IRequestHandler<UpdateThemeCommand, Unit>,
        IRequestHandler<UpdateFontSizeCommand, Unit>
    {
        private readonly UserRepository userRepository;
        private readonly FileRepository fileRepository;

        private readonly PhotoHelpers photoHelpers;
        private readonly IFilesStorage filesStorage;
        private readonly AppRepository appRepository;
        public UserHandlerСommand(
            UserRepository userRepository, 
            PhotoHelpers photoHelpers, 
            IFilesStorage filesStorage,
            FileRepository fileRepository,
            AppRepository appRepository)
        {
            this.userRepository = userRepository;
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
            this.fileRepository = fileRepository;
            this.appRepository = appRepository;
        }

        public async Task<Unit> Handle(NewUserCommand request, CancellationToken cancellationToken)
        {
            var language = await appRepository.GetLanguageByName(ModelsNaming.English);
            var fontSize = await appRepository.GetFontSizeByName(ModelsNaming.Big);
            var theme = await appRepository.GetThemeByName(ModelsNaming.DarkTheme);

            var user = new User() {
                Name = request.Name,
                LanguageId = language.Id,
                Email = request.Email,
                FontSizeId = fontSize.Id,
                ThemeId = theme.Id
            };

            await userRepository.Add(user);

            await filesStorage.CreateUserContainer(user.Id);

            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateMainUserInfoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.Name = request.Name;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<AnswerChangeUserPhoto> Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);

            if (user.PhotoId.HasValue)
            {
                var oldPhoto = await fileRepository.FirstOrDefault(x => x.Id == user.PhotoId.Value);
                await filesStorage.RemoveFile(user.Id.ToString(), oldPhoto.Path);
            }

            var photoType = photoHelpers.GetPhotoType(request.File.ContentType);
            var pathToCreatedFile = await filesStorage.SaveFile(user.Id.ToString(), request.File, ContentTypesFile.Images, photoType);
            var file = new AppFile { Path = pathToCreatedFile, Type = request.File.ContentType };

            var success = await userRepository.UpdatePhoto(user, file);

            if(!success)
            {
                await filesStorage.RemoveFile(user.Id.ToString(), pathToCreatedFile);
                return new AnswerChangeUserPhoto { Success = false };
            }

            return new AnswerChangeUserPhoto() { Success = true, Id = file.Id, PhotoPath = pathToCreatedFile };

        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.LanguageId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateThemeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.ThemeId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateFontSizeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            user.FontSizeId = request.Id;
            await userRepository.Update(user);
            return Unit.Value;
        }
    }
}
