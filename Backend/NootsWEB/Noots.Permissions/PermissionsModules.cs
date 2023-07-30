using Microsoft.Extensions.DependencyInjection;
using MediatR;
using Noots.Permissions.Entities;
using Noots.Permissions.Impl;
using Noots.Permissions.Queries;

namespace Noots.Permissions
{
    public static class PermissionsModules
    {
        public static void ApplyPermissionsDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserPermissionsForNoteQuery, UserPermissionsForNote>, PermissionNoteHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForNotesManyQuery, List<(Guid, UserPermissionsForNote)>>, PermissionNoteHandlerQuery>();

            services.AddScoped<IRequestHandler<GetUserPermissionsForFolderQuery, UserPermissionsForFolder>, PermissionFolderHandlerQuery>();
            services.AddScoped<IRequestHandler<GetUserPermissionsForFoldersManyQuery, List<(Guid, UserPermissionsForFolder)>>, PermissionFolderHandlerQuery>();

            services.AddScoped<IRequestHandler<GetPermissionUploadFileQuery, PermissionUploadFileEnum>, PermissionNoteHandlerQuery>();

            services.AddScoped<UsersOnPrivateNotesService>();
            services.AddScoped<UsersOnPrivateFoldersService>();
        }
    }
}
