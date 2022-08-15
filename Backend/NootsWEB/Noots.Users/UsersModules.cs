using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using BI.Services.UserHandlers;
using Domain.Queries.Users;
using Noots.Users.Commands;
using Noots.Storage.Queries;
using Noots.Users.Entities;

namespace Noots.Users
{
    public static class UsersModules
    {
        public static void ApplyUsersDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserDTOQuery, OperationResult<UserDTO>>, UserHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserShortDTOQuery, OperationResult<ShortUser>>, UserHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>, UserHandlerQuery>();

            services.AddScoped<IRequestHandler<NewUserCommand, Guid>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateMainUserInfoCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdatePhotoCommand, OperationResult<AnswerChangeUserPhoto>>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateLanguageCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateThemeCommand, Unit>, UserHandlerСommand>();
            services.AddScoped<IRequestHandler<UpdateFontSizeCommand, Unit>, UserHandlerСommand>();
        }
    }
}