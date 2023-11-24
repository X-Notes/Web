using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Storage.Queries;
using Users.Commands;
using Users.Entities;
using Users.Impl;
using Users.Queries;

namespace Users
{
    public static class UsersModules
    {
        public static void ApplyUsersDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserDTOQuery, OperationResult<UserDTO>>, UserHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserShortDTOQuery, OperationResult<ShortUser>>, UserHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserMemoryQuery, GetUserMemoryResponse>, UserHandlerQuery>();

            services.AddScoped<IRequestHandler<NewUserCommand, OperationResult<Guid>>, UserHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateMainUserInfoCommand, Unit>, UserHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdatePhotoCommand, OperationResult<AnswerChangeUserPhoto>>, UserHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateLanguageCommand, Unit>, UserHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateThemeCommand, Unit>, UserHandlerCommand>();
            services.AddScoped<IRequestHandler<UpdateFontSizeCommand, Unit>, UserHandlerCommand>();
        }
    }
}