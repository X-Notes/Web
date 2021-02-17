using AutoMapper;
using BI.helpers;
using Common;
using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Common.DTO.users;
using Domain.Commands.users;
using MediatR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Storage;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

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
        public UserHandlerСommand(
            UserRepository userRepository, 
            PhotoHelpers photoHelpers, 
            IFilesStorage filesStorage,
            FileRepository fileRepository)
        {
            this.userRepository = userRepository;
            this.photoHelpers = photoHelpers;
            this.filesStorage = filesStorage;
            this.fileRepository = fileRepository;
        }

        public async Task<Unit> Handle(NewUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User() { 
                Name = request.Name, 
                Language = request.Language,
                Email = request.Email
            };

            user.PersonalitionSettings = new PersonalitionSetting()
            {
                Theme = Theme.Dark,
                FontSize = FontSize.Medium,
            };
            await userRepository.Add(user);

            filesStorage.CreateUserFolders(user.Id);

            if(request.Photo != null)
            {
                try
                {
                    var photoType = photoHelpers.GetPhotoType(request.Photo);
                    var getContentString = filesStorage.GetValueFromDictionary(ContentTypes.Images);
                    var pathToCreatedFile = await filesStorage.SaveUserFile(request.Photo, user.Id, getContentString, photoType);
                    var file = new AppFile { Path = pathToCreatedFile, Type = request.Photo.ContentType };
                    await userRepository.UpdatePhoto(user, file);
                }catch(Exception e)
                {
                    Console.WriteLine("Photo not saved");
                }
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateMainUserInfoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.Name = request.Name;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<AnswerChangeUserPhoto> Handle(UpdatePhotoCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

            if(user.PhotoId.HasValue)
            {
                var oldPhoto = await fileRepository.GetFileById(user.PhotoId.Value);
                filesStorage.RemoveFile(oldPhoto.Path);
            }

            var photoType = photoHelpers.GetPhotoType(request.File);
            var getContentString = filesStorage.GetValueFromDictionary(ContentTypes.Images);
            var pathToCreatedFile = await filesStorage.SaveUserFile(request.File, user.Id, getContentString, photoType);
            var file = new AppFile { Path = pathToCreatedFile, Type = request.File.ContentType };

            var success = await userRepository.UpdatePhoto(user, file);

            if(!success)
            {
                filesStorage.RemoveFile(pathToCreatedFile);
                return new AnswerChangeUserPhoto { Success = false };
            }

            return new AnswerChangeUserPhoto() { Success = true, Id = file.Id };

        }

        public async Task<Unit> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            user.Language = request.Language;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateThemeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailWithPersonalization(request.Email);
            user.PersonalitionSettings.Theme = request.Theme;
            await userRepository.Update(user);
            return Unit.Value;
        }

        public async Task<Unit> Handle(UpdateFontSizeCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmailWithPersonalization(request.Email);
            user.PersonalitionSettings.FontSize = request.FontSize;
            await userRepository.Update(user);
            return Unit.Value;
        }
    }
}
